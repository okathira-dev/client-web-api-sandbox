// @ts-nocheck -- 検証PoCの単体HTMLから移植した検証コード。型の厳密化は方式確定後に行う。
// biome-ignore-all lint/correctness/noInnerDeclarations: 移植元の検証コードはブロック内 var 宣言（関数スコープ前提）に依存しており、挙動を変えないため方式確定後に整理する
// biome-ignore-all lint/style/useTemplate: 移植元の文字列結合をそのまま保持し、挙動を変えないため

/* =====================================================================
   レーザー検出検証PoC
   - 入力: 模擬カメラ(合成映像) / 実カメラ(getUserMedia)
   - スクリーン(表示側)パターンを別canvasに描き、模擬カメラはそれを
     透視変形+遅延+悪条件付きで合成する
   - 検出5方式を同一フレームで並行実行し比較する
   ===================================================================== */
var $ = (id) => document.getElementById(id);

var state = {
  source: "demo", // "demo" | "cam"
  stream: null,
  track: null,
  pattern: "still",
  markers: true,
  calib: { active: false, points: [], H: null, Hinv: null }, // points: camera-proc coords
  calibClicks: [],
  primary: "composite", // 主方式 id
  corrections: { warp: false, blur: true, chroma: false, bg: false },
  sim: { ae: false, glare: false, noise: false },
  demoDelayMs: 90,
  demoLaser: { on: false, hold: false, sx: 0.5, sy: 0.5, until: 0 },
  lastShotAt: 0,
  wasDetected: false,
  shots: 0,
  hits: 0,
  gridIndex: 0,
  gridRecords: [],
  shotLog: [],
  frameCount: 0,
  syncStart: performance.now(),
  procTimes: [],
  fpsCount: 0,
  fpsAt: performance.now(),
  bgModel: null, // Float32Array EMA background (proc size)
  prevData: null,
  rvfc: null,
  target: { x: 480, y: 270, r: 64, vx: 2.6, vy: 1.9 }, // screen coords 960x540
  caps: null,
};

var METHODS = [
  {
    id: "rgb",
    name: "A. 単純RGB閾値",
    desc: "R が高く、G・B より十分大きい画素。最軽量だが赤い描画や環境光に弱い。",
  },
  {
    id: "hsv",
    name: "B. HSV 赤検出",
    desc: "色相が赤の2範囲（0付近と180付近）にあり、彩度・明度が高い画素。実用の基本形。",
  },
  {
    id: "bright",
    name: "C. 輝度最大・飽和",
    desc: "非常に明るく飽和気味の画素。レーザー中心の白飛びを拾うが、白画面で破綻しやすい。",
  },
  {
    id: "diff",
    name: "D. 時間差分＋赤",
    desc: "直前フレームから新しく現れた赤い変化だけを見る。出しっぱなしの光や静止した赤には反応しない。",
  },
  {
    id: "ideal",
    name: "E. 理想差分（実験）",
    desc: "「描画したはずの画像」を正面化カメラ像と比較し、差が大きく赤い画素。調査で非推奨とされた方式をあえて検証する。",
  },
  {
    id: "composite",
    name: "F. 複合（推奨）",
    desc: "HSV赤 ∧（高輝度/飽和 ∨ 時間差分で新規）∧ ROI内。調査の推奨構成。",
  },
];
/* 表示は5カード+主方式切替のため composite を含む6方式にする */
var methodState = {}; // id -> {detected,x,y,count,ms,maskCanvas...}

/* ---------------- screen (display side) ---------------- */
var SW = 960,
  SH = 540;
var screenCv = $("screenCanvas"),
  sctx = screenCv.getContext("2d");
var gridPts = [];
(() => {
  for (var gy = 0; gy < 4; gy++)
    for (var gx = 0; gx < 5; gx++)
      gridPts.push({ x: 120 + gx * 180, y: 80 + gy * 126 });
})();

function drawMarker(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#fff";
  ctx.fillRect(-s, -s, s * 2, s * 2);
  ctx.fillStyle = "#000";
  ctx.fillRect(-s * 0.78, -s * 0.78, s * 1.56, s * 1.56);
  ctx.fillStyle = "#fff";
  ctx.fillRect(-s * 0.4, -s * 0.4, s * 0.8, s * 0.8);
  ctx.fillStyle = "#d92c22";
  ctx.fillRect(-s * 0.16, -s * 0.16, s * 0.32, s * 0.32);
  ctx.restore();
}
function drawTarget(ctx, x, y, r, t) {
  ctx.save();
  ctx.translate(x, y);
  var pulse = 1 + 0.04 * Math.sin(t / 280);
  ctx.beginPath();
  ctx.arc(0, 0, r * pulse, 0, 7);
  ctx.fillStyle = "#123c46";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.72 * pulse, 0, 7);
  ctx.fillStyle = "#f2f5f6";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.46 * pulse, 0, 7);
  ctx.fillStyle = "#175cd3";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.22 * pulse, 0, 7);
  ctx.fillStyle = "#f5c518";
  ctx.fill();
  ctx.restore();
}
function drawScreen(now) {
  var c = sctx;
  c.clearRect(0, 0, SW, SH);
  var pat = state.pattern;
  if (pat === "white") {
    c.fillStyle = "#f4f4f4";
    c.fillRect(0, 0, SW, SH);
  } else if (pat === "dark") {
    c.fillStyle = "#101418";
    c.fillRect(0, 0, SW, SH);
  } else if (pat === "busy") {
    c.fillStyle = "#20242c";
    c.fillRect(0, 0, SW, SH);
    for (var i = 0; i < 26; i++) {
      var bx = (i * 167) % SW,
        by = (i * 241) % SH,
        bw = 60 + ((i * 53) % 150),
        bh = 36 + ((i * 31) % 80);
      c.fillStyle =
        i % 3 === 0 ? "#c1271c" : i % 3 === 1 ? "#8f1d14" : "#33506e";
      c.fillRect(bx, by, bw, bh);
    }
    c.fillStyle = "#e8b34b";
    c.font = "700 30px sans-serif";
    c.fillText("SALE 50%", 60, 70);
    c.fillText("赤い看板・赤いUIが多い画面", 60, SH - 36);
    drawTarget(c, 720, 150, 52, now);
  } else if (pat === "sync") {
    c.fillStyle = "#0c0f12";
    c.fillRect(0, 0, SW, SH);
    var f = state.frameCount;
    var cols = ["#ff3b30", "#ffd60a", "#32d74b", "#64d2ff"];
    c.fillStyle = cols[f % 4];
    c.fillRect(28, 28, 84, 84);
    c.fillStyle = "#fff";
    c.font = "600 120px 'IBM Plex Mono',monospace";
    c.fillText(String(f % 1000), 150, 190);
    c.font = "600 54px 'IBM Plex Mono',monospace";
    c.fillText(Math.floor(now - state.syncStart) + " ms", 150, 300);
    c.font = "500 26px sans-serif";
    c.fillStyle = "#9fb2bd";
    c.fillText(
      "左上の色パッチ = フレーム番号の下位2bit（4色ローテーション）",
      150,
      380,
    );
    c.fillText("カメラ映像に写った数字と見比べると遅延が読めます", 150, 424);
  } else if (pat === "grid") {
    c.fillStyle = "#131a20";
    c.fillRect(0, 0, SW, SH);
    gridPts.forEach((p, i) => {
      c.beginPath();
      c.arc(p.x, p.y, 13, 0, 7);
      c.fillStyle = i < state.gridIndex ? "#2e7d5b" : "#3d4c57";
      c.fill();
      c.fillStyle = "#dbe6ec";
      c.font = "600 12px 'IBM Plex Mono',monospace";
      c.textAlign = "center";
      c.fillText(String(i + 1), p.x, p.y + 4);
      c.textAlign = "left";
    });
    var cur = gridPts[state.gridIndex % gridPts.length];
    c.beginPath();
    c.arc(cur.x, cur.y, 30 + 4 * Math.sin(now / 240), 0, 7);
    c.strokeStyle = "#ff3b30";
    c.lineWidth = 4;
    c.stroke();
    c.beginPath();
    c.arc(cur.x, cur.y, 5, 0, 7);
    c.fillStyle = "#ff3b30";
    c.fill();
  } else if (pat === "moving") {
    c.fillStyle = "#131a20";
    c.fillRect(0, 0, SW, SH);
    var t = state.target;
    t.x += t.vx;
    t.y += t.vy;
    if (t.x < t.r + 8 || t.x > SW - t.r - 8) t.vx *= -1;
    if (t.y < t.r + 8 || t.y > SH - t.r - 8) t.vy *= -1;
    drawTarget(c, t.x, t.y, t.r, now);
    state.curTarget = { x: t.x, y: t.y, r: t.r };
  } else {
    // still
    c.fillStyle = "#131a20";
    c.fillRect(0, 0, SW, SH);
    drawTarget(c, SW / 2, SH / 2, 72, now);
    state.curTarget = { x: SW / 2, y: SH / 2, r: 72 };
  }
  if (
    state.pattern !== "moving" &&
    state.pattern !== "still" &&
    state.pattern !== "busy"
  )
    state.curTarget = null;
  if (state.pattern === "busy") state.curTarget = { x: 720, y: 150, r: 52 };
  if (state.markers && pat !== "sync") {
    drawMarker(c, 34, 34, 17);
    drawMarker(c, SW - 34, 34, 17);
    drawMarker(c, SW - 34, SH - 34, 17);
    drawMarker(c, 34, SH - 34, 17);
  }
  $("screenCap").textContent =
    "pattern: " +
    document.querySelector('#segPattern button[aria-pressed="true"]')
      .textContent;
  $("latScreen").textContent = "#" + (state.frameCount % 1000);
}

/* ---------------- demo camera synthesis ---------------- */
var demoCv = document.createElement("canvas");
demoCv.width = 640;
demoCv.height = 480;
var dctx = demoCv.getContext("2d", { willReadFrequently: true });
var demoQuad = [
  { x: 104, y: 64 },
  { x: 536, y: 44 },
  { x: 560, y: 392 },
  { x: 76, y: 412 },
]; // TL TR BR BL in demo frame
var demoHistory = []; // {t, img:canvas}
function captureDemoFrame(now) {
  var snap = document.createElement("canvas");
  snap.width = 480;
  snap.height = 270;
  snap.getContext("2d").drawImage(screenCv, 0, 0, 480, 270);
  demoHistory.push({ t: now, img: snap });
  while (demoHistory.length && now - demoHistory[0].t > 600)
    demoHistory.shift();
}
function delayedScreen(now) {
  var target = now - state.demoDelayMs,
    best = demoHistory[0];
  for (var i = 0; i < demoHistory.length; i++) {
    if (demoHistory[i].t <= target) best = demoHistory[i];
  }
  return best ? best.img : screenCv;
}
/* draw img into arbitrary quad by grid subdivision (affine per cell) */
function drawWarped(ctx, img, quad, cols, rows) {
  var iw = img.width,
    ih = img.height;
  function lerpPt(a, b, t) {
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  }
  function quadPt(u, v) {
    var top = lerpPt(quad[0], quad[1], u),
      bot = lerpPt(quad[3], quad[2], u);
    return lerpPt(top, bot, v);
  }
  for (var r = 0; r < rows; r++)
    for (var col = 0; col < cols; col++) {
      var u0 = col / cols,
        u1 = (col + 1) / cols,
        v0 = r / rows,
        v1 = (r + 1) / rows;
      var p00 = quadPt(u0, v0),
        p10 = quadPt(u1, v0),
        p01 = quadPt(u0, v1);
      var sx = u0 * iw,
        sy = v0 * ih,
        sw = iw / cols,
        sh = ih / rows;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p00.x, p00.y);
      ctx.lineTo(p10.x, p10.y);
      ctx.lineTo(p01.x, p01.y);
      ctx.closePath();
      ctx.clip();
      var m = [
        (p10.x - p00.x) / sw,
        (p10.y - p00.y) / sw,
        (p01.x - p00.x) / sh,
        (p01.y - p00.y) / sh,
        p00.x - ((p10.x - p00.x) / sw) * sx - ((p01.x - p00.x) / sh) * sy,
        p00.y - ((p10.y - p00.y) / sw) * sx - ((p01.y - p00.y) / sh) * sy,
      ];
      ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
      ctx.drawImage(img, 0, 0);
      ctx.restore();
      /* second triangle */
      var p11 = quadPt(u1, v1);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p10.x, p10.y);
      ctx.lineTo(p11.x, p11.y);
      ctx.lineTo(p01.x, p01.y);
      ctx.closePath();
      ctx.clip();
      var ax = p11.x - p01.x,
        ay = p11.y - p01.y,
        bx = p11.x - p10.x,
        by = p11.y - p10.y;
      var sx2 = u1 * iw,
        sy2 = v1 * ih;
      var m2 = [
        ax / sw,
        ay / sw,
        bx / sh,
        by / sh,
        p11.x - (ax / sw) * sx2 - (bx / sh) * sy2,
        p11.y - (ay / sw) * sx2 - (by / sh) * sy2,
      ];
      ctx.transform(m2[0], m2[1], m2[2], m2[3], m2[4], m2[5]);
      ctx.drawImage(img, 0, 0);
      ctx.restore();
    }
}
function quadMap(quad, u, v) {
  /* bilinear approx for laser placement */
  var top = {
    x: quad[0].x + (quad[1].x - quad[0].x) * u,
    y: quad[0].y + (quad[1].y - quad[0].y) * u,
  };
  var bot = {
    x: quad[3].x + (quad[2].x - quad[3].x) * u,
    y: quad[3].y + (quad[2].y - quad[3].y) * u,
  };
  return { x: top.x + (bot.x - top.x) * v, y: top.y + (bot.y - top.y) * v };
}
function drawDemo(now) {
  var c = dctx;
  c.fillStyle = "#23282c";
  c.fillRect(0, 0, 640, 480);
  c.fillStyle = "#2d3338";
  c.fillRect(0, 0, 640, 40); // desk/wall hint
  var src = delayedScreen(now);
  c.save();
  if (state.sim.ae) {
    var g =
      0.82 +
      0.28 *
        (0.5 + 0.5 * Math.sin(now / 700)) *
        (0.6 + 0.4 * Math.sin(now / 173));
    c.filter = "brightness(" + g.toFixed(2) + ")";
  }
  drawWarped(c, src, demoQuad, 8, 5);
  c.filter = "none";
  c.restore();
  /* frame of the display */
  c.strokeStyle = "#05070a";
  c.lineWidth = 10;
  c.beginPath();
  c.moveTo(demoQuad[0].x, demoQuad[0].y);
  demoQuad.forEach((p) => {
    c.lineTo(p.x, p.y);
  });
  c.closePath();
  c.stroke();
  if (state.sim.glare) {
    var gr = c.createLinearGradient(120, 60, 420, 380);
    gr.addColorStop(0, "rgba(255,255,255,0)");
    gr.addColorStop(0.5, "rgba(255,255,255,0.34)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = gr;
    c.fillRect(80, 40, 480, 400);
  }
  /* laser */
  var L = state.demoLaser;
  if (L.on || L.hold || now < L.until) {
    var p = quadMap(demoQuad, L.sx, L.sy);
    var halo = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, 26);
    halo.addColorStop(0, "rgba(255,255,255,1)");
    halo.addColorStop(0.25, "rgba(255,120,110,0.95)");
    halo.addColorStop(0.6, "rgba(230,40,30,0.55)");
    halo.addColorStop(1, "rgba(230,40,30,0)");
    c.fillStyle = halo;
    c.beginPath();
    c.arc(p.x, p.y, 26, 0, 7);
    c.fill();
    c.fillStyle = "#fff";
    c.beginPath();
    c.arc(p.x, p.y, 4.5, 0, 7);
    c.fill();
  }
  if (state.sim.noise) {
    var id = c.getImageData(0, 0, 640, 480),
      d = id.data;
    for (var i = 0; i < d.length; i += 4) {
      var n = (Math.random() - 0.5) * 36;
      d[i] += n;
      d[i + 1] += n;
      d[i + 2] += n;
    }
    c.putImageData(id, 0, 0);
  }
}

/* ---------------- homography ---------------- */
function solveLinear(A, b) {
  var n = b.length,
    M = A.map((row, i) => row.concat([b[i]]));
  for (var col = 0; col < n; col++) {
    var piv = col;
    for (var r = col + 1; r < n; r++)
      if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    if (Math.abs(M[piv][col]) < 1e-12) return null;
    var tmp = M[col];
    M[col] = M[piv];
    M[piv] = tmp;
    for (var r2 = 0; r2 < n; r2++) {
      if (r2 === col) continue;
      var f = M[r2][col] / M[col][col];
      for (var k = col; k <= n; k++) M[r2][k] -= f * M[col][k];
    }
  }
  return M.map((row, i) => row[n] / row[i]);
}
function computeH(src, dst) {
  var A = [],
    b = [];
  for (var i = 0; i < 4; i++) {
    var x = src[i].x,
      y = src[i].y,
      X = dst[i].x,
      Y = dst[i].y;
    A.push([x, y, 1, 0, 0, 0, -X * x, -X * y]);
    b.push(X);
    A.push([0, 0, 0, x, y, 1, -Y * x, -Y * y]);
    b.push(Y);
  }
  var h = solveLinear(A, b);
  if (!h) return null;
  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
}
function applyH(H, x, y) {
  var w = H[6] * x + H[7] * y + H[8];
  if (Math.abs(w) < 1e-12) w = 1e-12;
  return {
    x: (H[0] * x + H[1] * y + H[2]) / w,
    y: (H[3] * x + H[4] * y + H[5]) / w,
  };
}
function invertH(H) {
  var a = H[0],
    b = H[1],
    c = H[2],
    d = H[3],
    e = H[4],
    f = H[5],
    g = H[6],
    h = H[7],
    i = H[8];
  var A = e * i - f * h,
    B = -(d * i - f * g),
    C = d * h - e * g,
    det = a * A + b * B + c * C;
  if (Math.abs(det) < 1e-12) return null;
  return [
    A / det,
    -(b * i - c * h) / det,
    (b * f - c * e) / det,
    B / det,
    (a * i - c * g) / det,
    -(a * f - c * d) / det,
    C / det,
    -(a * h - b * g) / det,
    (a * e - b * d) / det,
  ];
}
function updateHomography() {
  if (state.calib.points.length === 4) {
    var dst = [
      { x: 0, y: 0 },
      { x: SW, y: 0 },
      { x: SW, y: SH },
      { x: 0, y: SH },
    ];
    state.calib.H = computeH(state.calib.points, dst);
    state.calib.Hinv = state.calib.H ? invertH(state.calib.H) : null;
    $("pillCalib").innerHTML = "キャリブレーション: <b>4点設定済み</b>";
    $("pillCalib").classList.add("ok");
    $("warpInfo").textContent = "ホモグラフィ適用中";
    $("calibBox").textContent =
      "隅（カメラ座標 640×480）: " +
      state.calib.points
        .map((p) => "(" + Math.round(p.x) + "," + Math.round(p.y) + ")")
        .join(" ") +
      "\nH = [" +
      (state.calib.H
        ? state.calib.H.map((v) => v.toExponential(2)).join(", ")
        : "計算失敗") +
      "]";
  } else {
    state.calib.H = null;
    state.calib.Hinv = null;
    $("pillCalib").innerHTML = "キャリブレーション: <b>未実施（全画面）</b>";
    $("pillCalib").classList.remove("ok");
    $("warpInfo").textContent = "未キャリブレーション（全体表示）";
  }
}
function camToScreen(x, y, pw, ph) {
  /* (x,y) in processing-image coords -> screen coords 960x540 */
  if (state.calib.H) return applyH(state.calib.H, x, y);
  return { x: (x / pw) * SW, y: (y / ph) * SH };
}
function screenToCamProc(sx, sy) {
  /* returns CAMERA-space (640x480) coords for a screen point */
  if (state.calib.Hinv) {
    var p = applyH(state.calib.Hinv, sx, sy);
    return p;
  }
  return { x: (sx / SW) * 640, y: (sy / SH) * 480 };
}
/* ================= processing pipeline ================= */
var CAMW = 640,
  CAMH = 480;
var camCv = $("camCanvas"),
  camCtx = camCv.getContext("2d");
var video = $("videoEl");
var procCv = document.createElement("canvas");
var procCtx = procCv.getContext("2d", { willReadFrequently: true });
var idealCv = document.createElement("canvas");
var warpCv = $("warpCanvas"),
  warpCtx = warpCv.getContext("2d", { willReadFrequently: true });
// biome-ignore lint/correctness/noUnusedVariables: 処理結果の保持用に代入される変数。宣言を消すと代入が未宣言変数への代入になるため保持する
var lastProc = null; // {data,w,h,space}
// biome-ignore lint/correctness/noUnusedVariables: 同上（代入のみで読み出しは現行PoCに無い）
var lastFeatures = null;
var detectSpace = "proc"; // or "warp"
var detCount = 0,
  detFpsAt = performance.now(),
  detFps = 0,
  lastDetAt = 0;
var lastShotMark = null; // {sx, sy, t, hit}

function buildCards() {
  var wrap = $("methods");
  METHODS.forEach((m) => {
    var card = document.createElement("div");
    card.className = "mcard" + (state.primary === m.id ? " active" : "");
    card.id = "card-" + m.id;
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.title = "クリックで主方式に設定";
    card.innerHTML =
      "<h4></h4><div class='desc'></div>" +
      "<canvas width='160' height='120'></canvas>" +
      "<div><span class='badge miss' data-r='badge'>未検出</span> <span class='badge' data-r='prim'></span></div>" +
      "<div class='nums' data-r='nums'>—</div>";
    card.querySelector("h4").textContent = m.name;
    card.querySelector(".desc").textContent = m.desc;
    card.addEventListener("click", () => {
      setPrimary(m.id);
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setPrimary(m.id);
      }
    });
    wrap.appendChild(card);
    methodState[m.id] = {
      card: card,
      canvas: card.querySelector("canvas"),
      badge: card.querySelector("[data-r='badge']"),
      prim: card.querySelector("[data-r='prim']"),
      nums: card.querySelector("[data-r='nums']"),
      tmp: document.createElement("canvas"),
      detected: false,
      sx: null,
      sy: null,
      count: 0,
      ms: 0,
    };
  });
  refreshPrimaryBadges();
}
function setPrimary(id) {
  state.primary = id;
  METHODS.forEach((m) => {
    methodState[m.id].card.classList.toggle("active", m.id === id);
  });
  refreshPrimaryBadges();
}
function refreshPrimaryBadges() {
  METHODS.forEach((m) => {
    methodState[m.id].prim.textContent = m.id === state.primary ? "主方式" : "";
  });
}

/* ---- feature extraction: one pass over pixels ---- */
function rgb2hsv(r, g, b) {
  var mx = Math.max(r, g, b),
    mn = Math.min(r, g, b),
    d = mx - mn,
    h = 0;
  if (d) {
    if (mx === r) h = 60 * (((g - b) / d) % 6);
    else if (mx === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  if (h < 0) h += 360;
  return [h / 2, mx === 0 ? 0 : (d / mx) * 255, mx]; // OpenCV scale H:0-179
}
function computeFeatures(imgData, prev, bg, ideal) {
  var d = imgData.data,
    n = imgData.width * imgData.height;
  var F = {
    w: imgData.width,
    h: imgData.height,
    n: n,
    R: new Uint8ClampedArray(n),
    G: new Uint8ClampedArray(n),
    B: new Uint8ClampedArray(n),
    H: new Float32Array(n),
    S: new Uint8ClampedArray(n),
    V: new Uint8ClampedArray(n),
    RN: new Float32Array(n),
    red: new Int16Array(n),
    diffP: new Uint8ClampedArray(n),
    diffB: new Float32Array(n),
    diffI: new Uint8ClampedArray(n),
  };
  for (var i = 0, j = 0; i < n; i++, j += 4) {
    var r = d[j],
      g = d[j + 1],
      b = d[j + 2];
    F.R[i] = r;
    F.G[i] = g;
    F.B[i] = b;
    var hsv = rgb2hsv(r, g, b);
    F.H[i] = hsv[0];
    F.S[i] = hsv[1];
    F.V[i] = hsv[2];
    var sum = r + g + b + 1;
    F.RN[i] = r / sum;
    F.red[i] = r - Math.max(g, b);
    if (prev) {
      F.diffP[i] = Math.max(
        Math.abs(r - prev[j]),
        Math.abs(g - prev[j + 1]),
        Math.abs(b - prev[j + 2]),
      );
    }
    if (bg) {
      var bi = i * 3;
      F.diffB[i] = Math.max(
        Math.abs(r - bg[bi]),
        Math.abs(g - bg[bi + 1]),
        Math.abs(b - bg[bi + 2]),
      );
    }
    if (ideal) {
      var id = ideal.data;
      F.diffI[i] = Math.max(
        Math.abs(r - id[j]),
        Math.abs(g - id[j + 1]),
        Math.abs(b - id[j + 2]),
      );
    }
  }
  return F;
}
function params() {
  return {
    R: +$("pR").value,
    ratio: +$("pRatio").value,
    S: +$("pS").value,
    V: +$("pV").value,
    hue: +$("pHue").value,
    diff: +$("pDiff").value,
    min: +$("pMin").value,
    max: +$("pMax").value,
    cool: +$("pCool").value,
  };
}
function isRedHue(h, w) {
  return h <= w || h >= 180 - w;
}
function runMethod(id, F, P) {
  var chroma = state.corrections.chroma,
    useBg = state.corrections.bg;
  var count = 0,
    wx = 0,
    wy = 0,
    wsum = 0,
    buckets = {},
    maxBucket = 0;
  var mask = new Uint8Array(F.n);
  for (var i = 0; i < F.n; i++) {
    var r = F.R[i],
      g = F.G[i],
      b = F.B[i],
      ok = false;
    if (id === "rgb") {
      ok = chroma
        ? F.RN[i] > 0.4 && F.V[i] > 70 && F.red[i] > 12
        : r > P.R && r > g * P.ratio && r > b * P.ratio;
    } else if (id === "hsv") {
      ok =
        isRedHue(F.H[i], P.hue) &&
        F.S[i] > (chroma ? P.S * 0.7 : P.S) &&
        F.V[i] > P.V;
    } else if (id === "bright") {
      ok = F.V[i] >= 242 && F.S[i] < 110 && F.red[i] >= -12;
    } else if (id === "diff") {
      var dv = useBg ? F.diffB[i] : F.diffP[i];
      ok = dv > P.diff && F.red[i] > 28 && r > 110;
    } else if (id === "ideal") {
      ok = F.diffI[i] > 55 && F.red[i] > 24 && r > 110;
    } else if (id === "composite") {
      var hsvOk =
        isRedHue(F.H[i], P.hue) &&
        F.S[i] > (chroma ? P.S * 0.7 : P.S) &&
        F.V[i] > Math.min(P.V, 150);
      var novel = (useBg ? F.diffB[i] : F.diffP[i]) > P.diff * 0.6;
      var hot = F.V[i] > 195 || novel;
      var core = F.V[i] >= 240 && F.red[i] >= -12; // white-blown core counts if near red handled by halo pixels
      ok = (hsvOk && hot) || (core && novel);
    }
    if (ok) {
      mask[i] = 1;
      count++;
      var wgt = 1 + Math.max(0, F.red[i]) / 60;
      var x = i % F.w,
        y = (i / F.w) | 0;
      wx += x * wgt;
      wy += y * wgt;
      wsum += wgt;
      var bk = ((x >> 4) << 10) + (y >> 4);
      var c = (buckets[bk] || 0) + 1;
      buckets[bk] = c;
      if (c > maxBucket) maxBucket = c;
    }
  }
  /* レーザーは「白飛びした中心＋赤い輪」になり候補がリング状に分布するため、
     集中度は16pxマスで緩めに見る（輪が複数マスに跨っても弾かない） */
  var concentrated = count > 0 && maxBucket >= Math.max(3, count * 0.22);
  var detected = count >= P.min && count <= P.max && concentrated;
  return {
    detected: detected,
    count: count,
    maxBucket: maxBucket,
    cx: wsum ? wx / wsum : null,
    cy: wsum ? wy / wsum : null,
    mask: mask,
  };
}
function drawMask(ms, F, res) {
  var t = ms.tmp;
  t.width = F.w;
  t.height = F.h;
  var tc = t.getContext("2d");
  var img = tc.createImageData(F.w, F.h),
    d = img.data;
  for (var i = 0, j = 0; i < F.n; i++, j += 4) {
    if (res.mask[i]) {
      d[j] = 255;
      d[j + 1] = 70;
      d[j + 2] = 55;
      d[j + 3] = 255;
    } else {
      var v = F.V[i] * 0.35;
      d[j] = v;
      d[j + 1] = v;
      d[j + 2] = v;
      d[j + 3] = 255;
    }
  }
  tc.putImageData(img, 0, 0);
  var c2 = ms.canvas.getContext("2d");
  c2.imageSmoothingEnabled = false;
  c2.clearRect(0, 0, ms.canvas.width, ms.canvas.height);
  c2.drawImage(t, 0, 0, ms.canvas.width, ms.canvas.height);
  if (res.detected && res.cx != null) {
    c2.strokeStyle = "#ffd60a";
    c2.lineWidth = 2;
    var mx = (res.cx / F.w) * ms.canvas.width,
      my = (res.cy / F.h) * ms.canvas.height;
    c2.beginPath();
    c2.arc(mx, my, 7, 0, 7);
    c2.stroke();
  }
}

function buildIdeal(pw, ph) {
  idealCv.width = pw;
  idealCv.height = ph;
  var c = idealCv.getContext("2d");
  c.fillStyle = "#000";
  c.fillRect(0, 0, pw, ph);
  var quad = [
    screenToCamProc(0, 0),
    screenToCamProc(SW, 0),
    screenToCamProc(SW, SH),
    screenToCamProc(0, SH),
  ].map((p) => ({ x: (p.x / CAMW) * pw, y: (p.y / CAMH) * ph }));
  drawWarped(c, screenCv, quad, 8, 5);
  return c.getImageData(0, 0, pw, ph);
}
function buildWarped(procImg) {
  /* warp proc image into 320x180 screen space using Hinv */
  var out = warpCtx.createImageData(320, 180),
    od = out.data,
    sd = procImg.data;
  var pw = procImg.width,
    ph = procImg.height;
  for (var y = 0; y < 180; y++)
    for (var x = 0; x < 320; x++) {
      var sx = (x / 320) * SW,
        sy = (y / 180) * SH;
      var cp = screenToCamProc(sx, sy); // cam space
      var px = Math.round((cp.x / CAMW) * pw),
        py = Math.round((cp.y / CAMH) * ph);
      var oi = (y * 320 + x) * 4;
      if (px >= 0 && px < pw && py >= 0 && py < ph) {
        var si = (py * pw + px) * 4;
        od[oi] = sd[si];
        od[oi + 1] = sd[si + 1];
        od[oi + 2] = sd[si + 2];
        od[oi + 3] = 255;
      } else {
        od[oi + 3] = 255;
      }
    }
  warpCtx.putImageData(out, 0, 0);
  return out;
}

function detectOnce(now) {
  var srcEl = state.source === "cam" ? video : demoCv;
  if (state.source === "cam" && !video.videoWidth) return;
  var pw = +$("selScale").value;
  var sw = state.source === "cam" ? video.videoWidth : CAMW;
  var sh = state.source === "cam" ? video.videoHeight : CAMH;
  var ph = Math.round((pw * sh) / sw);
  if (procCv.width !== pw || procCv.height !== ph) {
    procCv.width = pw;
    procCv.height = ph;
    state.prevData = null;
    state.bgModel = null;
  }
  procCtx.save();
  procCtx.filter = state.corrections.blur ? "blur(1.5px)" : "none";
  procCtx.drawImage(srcEl, 0, 0, pw, ph);
  procCtx.restore();
  procCtx.filter = "none";
  var procImg = procCtx.getImageData(0, 0, pw, ph);
  lastProc = procImg;

  /* warped view (always shown when calibrated) */
  var warpedImg = null;
  if (state.calib.H) warpedImg = buildWarped(procImg);
  else {
    warpCtx.clearRect(0, 0, 320, 180);
    warpCtx.drawImage(procCv, 0, 0, 320, 180);
  }

  var useWarp = state.corrections.warp && !!state.calib.H && !!warpedImg;
  detectSpace = useWarp ? "warp" : "proc";
  var img = useWarp ? warpedImg : procImg;

  /* background EMA (in current space) */
  var key = detectSpace + ":" + img.width + "x" + img.height;
  if (state._bgKey !== key) {
    state.bgModel = null;
    state.prevData = null;
    state._bgKey = key;
  }
  if (!state.bgModel) {
    state.bgModel = new Float32Array(img.width * img.height * 3);
    var d0 = img.data;
    for (var i = 0, j = 0; i < state.bgModel.length; i += 3, j += 4) {
      state.bgModel[i] = d0[j];
      state.bgModel[i + 1] = d0[j + 1];
      state.bgModel[i + 2] = d0[j + 2];
    }
  }
  var ideal = buildIdeal(img.width, img.height);
  if (useWarp) {
    /* in warp space the ideal is the screen itself, scaled */
    var ic = document.createElement("canvas");
    ic.width = img.width;
    ic.height = img.height;
    ic.getContext("2d").drawImage(screenCv, 0, 0, img.width, img.height);
    ideal = ic.getContext("2d").getImageData(0, 0, img.width, img.height);
  }
  var F = computeFeatures(img, state.prevData, state.bgModel, ideal);
  lastFeatures = F;

  var P = params(),
    totalMs = 0,
    primaryRes = null;
  METHODS.forEach((m) => {
    var t0 = performance.now();
    var res = runMethod(m.id, F, P);
    var ms = performance.now() - t0;
    totalMs += ms;
    var st = methodState[m.id];
    st.detected = res.detected;
    st.count = res.count;
    st.ms = ms;
    if (res.detected && res.cx != null) {
      if (useWarp) {
        st.sx = (res.cx / img.width) * SW;
        st.sy = (res.cy / img.height) * SH;
      } else {
        var camX = (res.cx / img.width) * CAMW,
          camY = (res.cy / img.height) * CAMH;
        var sp = camToScreen(camX, camY, CAMW, CAMH);
        st.sx = sp.x;
        st.sy = sp.y;
      }
    } else {
      st.sx = null;
      st.sy = null;
    }
    drawMask(st, F, res);
    st.badge.textContent = res.detected ? "検出" : "未検出";
    st.badge.className = "badge " + (res.detected ? "hit" : "miss");
    st.nums.innerHTML =
      "px " +
      res.count +
      " / 集中 " +
      res.maxBucket +
      "<br>" +
      (res.detected
        ? "画面 (" + Math.round(st.sx) + ", " + Math.round(st.sy) + ")"
        : "座標 —") +
      "<br>" +
      ms.toFixed(1) +
      " ms";
    if (m.id === state.primary) primaryRes = { res: res, st: st };
  });

  /* update background EMA slowly, prev frame */
  var bd = img.data,
    bg = state.bgModel,
    a = 0.04;
  for (var bi = 0, bj = 0; bi < bg.length; bi += 3, bj += 4) {
    bg[bi] += (bd[bj] - bg[bi]) * a;
    bg[bi + 1] += (bd[bj + 1] - bg[bi + 1]) * a;
    bg[bi + 2] += (bd[bj + 2] - bg[bi + 2]) * a;
  }
  state.prevData = img.data;

  /* shot event: rising edge of primary + cooldown */
  var det = primaryRes?.res.detected;
  if (det && !state.wasDetected && now - state.lastShotAt > P.cool) {
    state.lastShotAt = now;
    registerShot(primaryRes.st.sx, primaryRes.st.sy, now);
  }
  state.wasDetected = !!det;

  /* metrics */
  detCount++;
  if (now - detFpsAt >= 500) {
    detFps = Math.round((detCount * 1000) / (now - detFpsAt));
    detCount = 0;
    detFpsAt = now;
    $("mFps").textContent = detFps;
    $("pillFps").innerHTML =
      "処理: <b>" + detFps + " fps / " + totalMs.toFixed(1) + "ms</b>";
  }
  $("mMs").innerHTML = totalMs.toFixed(1) + " <small>ms</small>";
  $("mCoord").textContent =
    det && primaryRes.st.sx != null
      ? "(" +
        Math.round(primaryRes.st.sx) +
        ", " +
        Math.round(primaryRes.st.sy) +
        ")"
      : "—";
  lastDetAt = now;
}

function registerShot(sx, sy, now) {
  state.shots++;
  var hit = false,
    targetDesc = "";
  if (state.pattern === "grid") {
    var gp = gridPts[state.gridIndex % gridPts.length];
    var err = Math.hypot(sx - gp.x, sy - gp.y);
    var diag = Math.hypot(SW, SH),
      pct = (err / diag) * 100;
    state.gridRecords.push({
      idx: state.gridIndex,
      gx: gp.x,
      gy: gp.y,
      dx: Math.round(sx),
      dy: Math.round(sy),
      errPx: Math.round(err),
      pct: +pct.toFixed(2),
    });
    hit = err <= 46;
    targetDesc =
      "格子点" +
      (state.gridIndex + 1) +
      " 誤差 " +
      Math.round(err) +
      "px (" +
      pct.toFixed(2) +
      "%)";
    state.gridIndex++;
    renderGrid();
  } else if (state.curTarget) {
    var t = state.curTarget;
    var dist = Math.hypot(sx - t.x, sy - t.y);
    hit = dist <= t.r;
    targetDesc =
      "ターゲットまで " + Math.round(dist) + "px（半径 " + t.r + "）";
  } else {
    targetDesc = "ターゲットなしパターン";
  }
  if (hit) state.hits++;
  lastShotMark = { sx: sx, sy: sy, t: now, hit: hit };
  var entry = {
    time: new Date().toLocaleTimeString("ja-JP"),
    sx: Math.round(sx),
    sy: Math.round(sy),
    method: state.primary,
    hit: hit,
    note: targetDesc,
  };
  state.shotLog.unshift(entry);
  if (state.shotLog.length > 60) state.shotLog.pop();
  renderShotLog();
  $("pillShot").innerHTML = "発射イベント: <b>" + state.shots + " 発</b>";
  $("mShots").innerHTML = state.shots + " <small>/ " + state.hits + "</small>";
}
function renderShotLog() {
  var ul = $("shotLog");
  if (!state.shotLog.length) {
    ul.innerHTML =
      "<li style='color:var(--ink2)'>まだ発射イベントはありません。</li>";
    return;
  }
  ul.innerHTML = "";
  state.shotLog.forEach((e) => {
    var li = document.createElement("li");
    li.innerHTML = "<span></span><span class=''></span><span></span>";
    li.children[0].textContent = e.time;
    li.children[1].textContent = e.hit ? "HIT" : "MISS";
    li.children[1].className = e.hit ? "hit" : "miss";
    li.children[2].textContent =
      "(" + e.sx + ", " + e.sy + ") " + e.method + " / " + e.note;
    ul.appendChild(li);
  });
}
function renderGrid() {
  var tb = $("gridTable").querySelector("tbody");
  if (!state.gridRecords.length) {
    tb.innerHTML =
      "<tr><td colspan='5' style='color:var(--ink2)'>まだ記録がありません。格子パターンで赤い輪の点を撃ってください。</td></tr>";
  } else {
    tb.innerHTML = "";
    state.gridRecords.forEach((r) => {
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td></td><td></td><td></td><td class='num'></td><td class='num'></td>";
      tr.children[0].textContent = r.idx + 1;
      tr.children[1].textContent = "(" + r.gx + ", " + r.gy + ")";
      tr.children[2].textContent = "(" + r.dx + ", " + r.dy + ")";
      tr.children[3].textContent = r.errPx;
      tr.children[4].textContent = r.pct.toFixed(2);
      tb.appendChild(tr);
    });
  }
  var n = state.gridRecords.length;
  $("gCount").textContent = n;
  if (n) {
    var mean = state.gridRecords.reduce((s, r) => s + r.pct, 0) / n;
    var max = Math.max.apply(
      null,
      state.gridRecords.map((r) => r.pct),
    );
    $("gMean").innerHTML = mean.toFixed(2) + " <small>%</small>";
    $("gMax").innerHTML = max.toFixed(2) + " <small>%</small>";
    var sorted = state.gridRecords.map((r) => r.pct).sort((a, b) => a - b);
    var p95 = sorted[Math.min(n - 1, Math.floor(n * 0.95))];
    var ok = p95 < 1.5;
    $("gJudge").innerHTML =
      (ok ? "目安クリア" : "目安未達") +
      " <small>(p95 " +
      p95.toFixed(2) +
      "%)</small>";
    $("gJudge").style.color = ok ? "var(--ok)" : "var(--ng)";
  }
}

/* ================= main loop ================= */
function loop(now) {
  state.frameCount++;
  drawScreen(now);
  if (state.source === "demo") {
    captureDemoFrame(now);
    drawDemo(now);
  }
  /* camera view */
  camCtx.drawImage(state.source === "cam" ? video : demoCv, 0, 0, CAMW, CAMH);
  /* overlays: calibration points */
  if (state.calib.points.length) {
    camCtx.strokeStyle = "#ffd60a";
    camCtx.lineWidth = 2;
    camCtx.beginPath();
    state.calib.points.forEach((p, i) => {
      if (i === 0) camCtx.moveTo(p.x, p.y);
      else camCtx.lineTo(p.x, p.y);
    });
    if (state.calib.points.length === 4) camCtx.closePath();
    camCtx.stroke();
    state.calib.points.forEach((p, i) => {
      camCtx.fillStyle = "#ffd60a";
      camCtx.beginPath();
      camCtx.arc(p.x, p.y, 6, 0, 7);
      camCtx.fill();
      camCtx.fillStyle = "#000";
      camCtx.font = "700 10px sans-serif";
      camCtx.fillText(String(i + 1), p.x - 3, p.y + 3);
    });
  }
  if (state.calib.active) {
    camCtx.fillStyle = "rgba(0,0,0,0.55)";
    camCtx.fillRect(0, 0, CAMW, 34);
    camCtx.fillStyle = "#ffd60a";
    camCtx.font = "700 16px sans-serif";
    camCtx.fillText(
      "キャリブレーション中: 隅 " +
        (state.calib.points.length + 1) +
        " / 4 をクリック（左上→右上→右下→左下）",
      12,
      23,
    );
  }
  /* last shot marker in camera space */
  if (lastShotMark && now - lastShotMark.t < 900) {
    var cp = screenToCamProc(lastShotMark.sx, lastShotMark.sy);
    camCtx.strokeStyle = lastShotMark.hit ? "#ff3b30" : "#ffd60a";
    camCtx.lineWidth = 3;
    camCtx.beginPath();
    camCtx.arc(cp.x, cp.y, 16, 0, 7);
    camCtx.stroke();
    camCtx.beginPath();
    camCtx.moveTo(cp.x - 22, cp.y);
    camCtx.lineTo(cp.x + 22, cp.y);
    camCtx.moveTo(cp.x, cp.y - 22);
    camCtx.lineTo(cp.x, cp.y + 22);
    camCtx.stroke();
  }
  if (now - lastDetAt >= 50) detectOnce(now);
  requestAnimationFrame(loop);
}

/* ================= camera (real) ================= */
function showCamError(msg) {
  var box = $("camError");
  box.classList.remove("hidden");
  box.querySelector("p").textContent = msg;
}
function hideCamError() {
  $("camError").classList.add("hidden");
}
async function startCamera() {
  hideCamError();
  if (!navigator.mediaDevices?.getUserMedia) {
    showCamError(
      "このブラウザ/環境では getUserMedia が使えません（HTTPS または localhost が必要です）。模擬カメラで検証を続けてください。",
    );
    return;
  }
  try {
    if (state.stream) {
      state.stream.getTracks().forEach((t) => {
        t.stop();
      });
    }
    var res = $("selRes").value.split("x").map(Number);
    var devId = $("selDevice").value;
    var constraints = {
      audio: false,
      video: {
        width: { ideal: res[0] },
        height: { ideal: res[1] },
        frameRate: { ideal: 60 },
        ...(devId ? { deviceId: { exact: devId } } : {}),
      },
    };
    state.stream = await navigator.mediaDevices.getUserMedia(constraints);
    state.track = state.stream.getVideoTracks()[0];
    video.srcObject = state.stream;
    await video.play();
    state.source = "cam";
    $("btnStop").disabled = false;
    $("btnDemo").setAttribute("aria-pressed", "false");
    $("btnCam").setAttribute("aria-pressed", "true");
    $("pillSource").innerHTML = "入力: <b>実カメラ</b>";
    $("pillSource").classList.add("ok");
    $("camCapL").textContent = "CAMERA（実機）";
    $("camCapInfo").textContent = video.videoWidth + "×" + video.videoHeight;
    $("camHint").textContent =
      "実カメラ：映像クリックはキャリブレーション中のみ使います。レーザーを画面に当てると検出が走ります。";
    await listDevices();
    showCaps();
    setupRvfc();
  } catch (e) {
    showCamError(
      "カメラを開始できませんでした: " +
        (e.name || "") +
        " " +
        (e.message || e) +
        "。許可が拒否されたか、他のアプリが使用中かもしれません。模擬カメラで検証を続けてください。",
    );
  }
}
async function listDevices() {
  try {
    var devs = await navigator.mediaDevices.enumerateDevices();
    var sel = $("selDevice"),
      cur = sel.value;
    sel.innerHTML = "";
    devs
      .filter((d) => d.kind === "videoinput")
      .forEach((d, i) => {
        var o = document.createElement("option");
        o.value = d.deviceId;
        o.textContent = d.label || "カメラ " + (i + 1);
        sel.appendChild(o);
      });
    if (cur) sel.value = cur;
    if (state.track) {
      var s = state.track.getSettings();
      if (s.deviceId) sel.value = s.deviceId;
    }
  } catch {
    /* ignore */
  }
}
function showCaps() {
  if (!state.track) {
    $("capsBox").textContent = "実カメラが開始していません。";
    return;
  }
  var caps = {};
  try {
    caps = state.track.getCapabilities ? state.track.getCapabilities() : {};
  } catch {}
  state.caps = caps;
  var settings = {};
  try {
    settings = state.track.getSettings ? state.track.getSettings() : {};
  } catch {}
  var keys = [
    "exposureMode",
    "exposureTime",
    "whiteBalanceMode",
    "colorTemperature",
    "focusMode",
    "focusDistance",
    "iso",
    "brightness",
    "contrast",
    "saturation",
    "sharpness",
    "torch",
  ];
  var lines = keys
    .filter((k) => k in caps || k in settings)
    .map(
      (k) =>
        k +
        ": cap=" +
        JSON.stringify(caps[k]) +
        " / now=" +
        JSON.stringify(settings[k]),
    );
  $("capsBox").textContent = lines.length
    ? lines.join("\n")
    : "capabilities: " + JSON.stringify(caps).slice(0, 600);
}
async function applyLock(lock) {
  if (!state.track) {
    showCamError(
      "先に実カメラを開始してください。固定の成否は実機でのみ確認できます。",
    );
    return;
  }
  hideCamError();
  var adv = lock
    ? [
        { exposureMode: "manual" },
        { whiteBalanceMode: "manual" },
        { focusMode: "manual" },
      ]
    : [
        { exposureMode: "continuous" },
        { whiteBalanceMode: "continuous" },
        { focusMode: "continuous" },
      ];
  var result = "";
  for (var i = 0; i < adv.length; i++) {
    try {
      await state.track.applyConstraints({ advanced: [adv[i]] });
      result += Object.keys(adv[i])[0] + "=適用OK; ";
    } catch (e) {
      result += Object.keys(adv[i])[0] + "=失敗(" + (e.name || e) + "); ";
    }
  }
  showCaps();
  $("capsBox").textContent =
    "applyConstraints 結果: " +
    result +
    "\n--- 現在の settings / capabilities ---\n" +
    $("capsBox").textContent;
}
function setupRvfc() {
  if (!("requestVideoFrameCallback" in HTMLVideoElement.prototype)) {
    $("rvfcBox").textContent =
      "このブラウザは requestVideoFrameCallback に未対応です（遅延対応付けは固定遅延＋窓方式で設計してください）。";
    return;
  }
  var cb = (_now, meta) => {
    state.rvfc = meta;
    $("rvfcBox").textContent =
      "presentedFrames: " +
      meta.presentedFrames +
      "\n" +
      "mediaTime: " +
      (meta.mediaTime != null ? meta.mediaTime.toFixed(3) : "なし") +
      "\n" +
      "presentationTime: " +
      (meta.presentationTime != null
        ? meta.presentationTime.toFixed(1)
        : "なし") +
      "\n" +
      "expectedDisplayTime: " +
      (meta.expectedDisplayTime != null
        ? meta.expectedDisplayTime.toFixed(1)
        : "なし") +
      "\n" +
      "captureTime: " +
      (meta.captureTime != null
        ? meta.captureTime.toFixed(1)
        : "返ってこない（optional のため環境依存）") +
      "\n" +
      "width×height: " +
      meta.width +
      "×" +
      meta.height;
    video.requestVideoFrameCallback(cb);
  };
  video.requestVideoFrameCallback(cb);
}
function stopCamera() {
  if (state.stream) {
    state.stream.getTracks().forEach((t) => {
      t.stop();
    });
  }
  state.stream = null;
  state.track = null;
  video.srcObject = null;
  enableDemo();
  $("btnStop").disabled = true;
}
function enableDemo() {
  state.source = "demo";
  $("btnDemo").setAttribute("aria-pressed", "true");
  $("btnCam").setAttribute("aria-pressed", "false");
  $("pillSource").innerHTML = "入力: <b>模擬カメラ</b>";
  $("pillSource").classList.remove("ok");
  $("camCapL").textContent = "CAMERA（模擬）";
  $("camCapInfo").textContent = "640×480 / 遅延 " + state.demoDelayMs + "ms";
  $("camHint").textContent =
    "模擬モード：この映像をクリックすると、その位置に模擬レーザーを撃ち込めます（キャリブレーション中はクリックが隅の記録に使われます）。";
}

/* ================= wiring ================= */
function bindSlider(id, out, fmt) {
  var el = $(id);
  var upd = () => {
    $(out).textContent = fmt ? fmt(el.value) : el.value;
  };
  el.addEventListener("input", upd);
  upd();
}
function toggleBtn(id, key, group) {
  $(id).addEventListener("click", () => {
    var el = $(id),
      on = el.getAttribute("aria-pressed") !== "true";
    el.setAttribute("aria-pressed", on ? "true" : "false");
    if (group) state.corrections[key] = on;
    else state.sim[key] = on;
  });
}
function init() {
  buildCards();
  bindSlider("pR", "oR");
  bindSlider("pS", "oS");
  bindSlider("pV", "oV");
  bindSlider("pHue", "oHue");
  bindSlider("pDiff", "oDiff");
  bindSlider("pMin", "oMin");
  bindSlider("pMax", "oMax");
  bindSlider("pCool", "oCool");
  bindSlider("pRatio", "oRatio", (v) => (+v).toFixed(2));
  bindSlider("pDemoDelay", "oDemoDelay", (v) => {
    state.demoDelayMs = +v;
    $("latDemoVal").innerHTML = v + " <small>ms</small>";
    if (state.source === "demo")
      $("camCapInfo").textContent = "640×480 / 遅延 " + v + "ms";
    return v;
  });
  toggleBtn("tWarp", "warp", true);
  toggleBtn("tBlur", "blur", true);
  toggleBtn("tChroma", "chroma", true);
  toggleBtn("tBg", "bg", true);
  toggleBtn("tAe", "ae", false);
  toggleBtn("tGlare", "glare", false);
  toggleBtn("tNoise", "noise", false);

  document.querySelectorAll("#segPattern button").forEach((b) => {
    b.addEventListener("click", () => {
      document.querySelectorAll("#segPattern button").forEach((x) => {
        x.setAttribute("aria-pressed", "false");
      });
      b.setAttribute("aria-pressed", "true");
      state.pattern = b.getAttribute("data-pat");
      if (state.pattern === "grid") {
        state.gridIndex = 0;
      }
      if (state.pattern === "sync") {
        state.syncStart = performance.now();
      }
    });
  });
  $("btnMarkers").addEventListener("click", function () {
    var on = this.getAttribute("aria-pressed") !== "true";
    this.setAttribute("aria-pressed", on ? "true" : "false");
    state.markers = on;
  });
  $("btnGridNext").addEventListener("click", () => {
    state.gridIndex = (state.gridIndex + 1) % gridPts.length;
  });

  /* presets */
  document.querySelectorAll("[data-preset]").forEach((b) => {
    b.addEventListener("click", () => {
      var p = b.getAttribute("data-preset");
      function set(id, v) {
        $(id).value = v;
        $(id).dispatchEvent(new Event("input"));
      }
      if (p === "composite") {
        setPrimary("composite");
        set("pS", 90);
        set("pV", 140);
        set("pDiff", 40);
        set("pMin", 3);
      }
      if (p === "hsv") {
        setPrimary("hsv");
      }
      if (p === "rgb") {
        setPrimary("rgb");
      }
      if (p === "ideal") {
        setPrimary("ideal");
      }
      if (p === "loose") {
        set("pS", 55);
        set("pV", 95);
        set("pDiff", 22);
        set("pMin", 2);
        set("pRatio", 1.15);
      }
      if (p === "strict") {
        set("pS", 145);
        set("pV", 190);
        set("pDiff", 70);
        set("pMin", 6);
        set("pRatio", 1.8);
      }
    });
  });

  /* calibration */
  $("btnCalibStart").addEventListener("click", () => {
    state.calib.active = true;
    state.calib.points = [];
    updateHomography();
    $("calibBox").textContent =
      "カメラ映像上で、スクリーンの 左上 → 右上 → 右下 → 左下 を順にクリックしてください。";
  });
  $("btnCalibDemo").addEventListener("click", () => {
    state.calib.points = demoQuad.map((p) => ({ x: p.x, y: p.y }));
    state.calib.active = false;
    updateHomography();
  });
  $("btnCalibClear").addEventListener("click", () => {
    state.calib.points = [];
    state.calib.active = false;
    updateHomography();
    $("calibBox").textContent =
      "隅は未設定です。順序は 左上 → 右上 → 右下 → 左下 です。";
  });
  camCv.addEventListener("click", (e) => {
    var r = camCv.getBoundingClientRect();
    var x = ((e.clientX - r.left) / r.width) * CAMW,
      y = ((e.clientY - r.top) / r.height) * CAMH;
    if (state.calib.active) {
      state.calib.points.push({ x: x, y: y });
      if (state.calib.points.length >= 4) {
        state.calib.active = false;
        state.calib.points = state.calib.points.slice(0, 4);
      }
      updateHomography();
      return;
    }
    if (state.source === "demo") {
      var Hd = computeH(demoQuad, [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ]);
      if (Hd) {
        var uv = applyH(Hd, x, y);
        if (uv.x >= -0.05 && uv.x <= 1.05 && uv.y >= -0.05 && uv.y <= 1.05) {
          state.demoLaser.sx = Math.min(1, Math.max(0, uv.x));
          state.demoLaser.sy = Math.min(1, Math.max(0, uv.y));
          state.demoLaser.until = performance.now() + 300;
        }
      }
    }
  });

  /* demo laser controls */
  function aimAndFire(sx, sy, holdMs) {
    state.demoLaser.sx = sx;
    state.demoLaser.sy = sy;
    state.demoLaser.until = performance.now() + (holdMs || 250);
  }
  $("btnFire").addEventListener("click", () => {
    if (state.pattern === "grid") {
      var gp = gridPts[state.gridIndex % gridPts.length];
      aimAndFire(gp.x / SW, gp.y / SH, 300);
    } else if (state.curTarget) {
      aimAndFire(state.curTarget.x / SW, state.curTarget.y / SH, 300);
    } else
      aimAndFire(0.3 + Math.random() * 0.4, 0.3 + Math.random() * 0.4, 300);
  });
  $("btnHold").addEventListener("click", function () {
    var on = this.getAttribute("aria-pressed") !== "true";
    this.setAttribute("aria-pressed", on ? "true" : "false");
    state.demoLaser.hold = on;
    if (on && state.curTarget) {
      state.demoLaser.sx = state.curTarget.x / SW;
      state.demoLaser.sy = state.curTarget.y / SH;
    }
  });
  $("btnTour").addEventListener("click", () => {
    var spots = [
      [0.2, 0.25],
      [0.8, 0.2],
      [0.5, 0.5],
      [0.25, 0.8],
      [0.85, 0.75],
    ];
    spots.forEach((s, i) => {
      setTimeout(() => {
        aimAndFire(s[0], s[1], 280);
      }, i * 650);
    });
  });

  /* camera controls */
  $("btnCam").addEventListener("click", startCamera);
  $("btnDemo").addEventListener("click", () => {
    if (state.stream) stopCamera();
    else enableDemo();
  });
  $("btnStop").addEventListener("click", stopCamera);
  $("selDevice").addEventListener("change", () => {
    if (state.source === "cam") startCamera();
  });
  $("btnCaps").addEventListener("click", showCaps);
  $("btnLock").addEventListener("click", () => {
    applyLock(true);
  });
  $("btnUnlock").addEventListener("click", () => {
    applyLock(false);
  });

  /* results */
  $("btnClearLog").addEventListener("click", () => {
    state.shotLog = [];
    state.gridRecords = [];
    state.shots = 0;
    state.hits = 0;
    state.gridIndex = 0;
    renderShotLog();
    renderGrid();
    $("pillShot").innerHTML = "発射イベント: <b>0 発</b>";
    $("mShots").innerHTML = "0 <small>/ 0</small>";
    $("gJudge").textContent = "未測定";
    $("gJudge").style.color = "";
    $("gMean").textContent = "—";
    $("gMax").textContent = "—";
  });
  $("btnExport").addEventListener("click", () => {
    var data = {
      exportedAt: new Date().toISOString(),
      source: state.source,
      primaryMethod: state.primary,
      params: params(),
      corrections: state.corrections,
      simConditions: state.sim,
      demoDelayMs: state.demoDelayMs,
      calibrationPointsCamSpace: state.calib.points,
      homography: state.calib.H,
      cameraCapabilities: state.caps,
      gridRecords: state.gridRecords,
      shotLog: state.shotLog,
    };
    var blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "laser-poc-result.json";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 400);
  });

  renderShotLog();
  renderGrid();
  requestAnimationFrame(loop);
}
document.addEventListener("DOMContentLoaded", init);
