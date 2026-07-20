import type { Locale } from "../i18n";
import type { ClueIconName } from "../ui/ClueIcon";

export type StageCategory =
  | "page"
  | "transition"
  | "storage"
  | "device"
  | "edge";

export type StageMapBranch = "page" | "device" | "storage" | "passage" | "labs";

type StageIdFormat = `S-${number}`;
type ProblemBoxIdFormat = `${StageIdFormat}-B${number}`;

export interface ProblemSpec {
  readonly id: ProblemBoxIdFormat;
  readonly color: string;
  readonly clue: ClueIconName;
  readonly label: Readonly<Record<Locale, string>>;
}

export interface StageSpec {
  readonly id: StageIdFormat;
  // Labels are presentation copy only. IDs remain the sole routing, storage,
  // filename, CSS, and test identity so copy edits cannot break compatibility.
  readonly label: Readonly<Record<Locale, string>>;
  readonly category: StageCategory;
  readonly map: {
    readonly branch: StageMapBranch;
    readonly order: number;
    readonly relatedStageIds?: readonly StageIdFormat[];
    readonly clueFromStageIds?: readonly StageIdFormat[];
  };
  readonly problems: readonly ProblemSpec[];
}

type ProblemFor<TStageId extends StageIdFormat> = Omit<ProblemSpec, "id"> & {
  id: `${TStageId}-B${number}`;
};

function defineStage<
  const TStageId extends StageIdFormat,
  const TProblems extends readonly ProblemFor<TStageId>[],
>(stage: {
  id: TStageId;
  label: Record<Locale, string>;
  category: StageCategory;
  map?: {
    branch?: StageMapBranch;
    order?: number;
    relatedStageIds?: readonly StageIdFormat[];
    clueFromStageIds?: readonly StageIdFormat[];
  };
  problems: TProblems;
}) {
  const branchByCategory: Readonly<Record<StageCategory, StageMapBranch>> = {
    page: "page",
    device: "device",
    storage: "storage",
    transition: "passage",
    edge: "labs",
  };
  return {
    ...stage,
    map: {
      branch: stage.map?.branch ?? branchByCategory[stage.category],
      order: stage.map?.order ?? Number(stage.id.slice(2)),
      relatedStageIds: stage.map?.relatedStageIds,
      clueFromStageIds: stage.map?.clueFromStageIds,
    },
  };
}

export const stageCatalogue = [
  defineStage({
    id: "S-000",
    label: { ja: "最初の箱", en: "The first box" },
    category: "page",
    problems: [
      {
        id: "S-000-B01",
        color: "#a78bfa",
        clue: "click",
        label: { ja: "クリックする箱", en: "Click box" },
      },
    ],
  }),
  defineStage({
    id: "S-010",
    label: { ja: "三つの手", en: "Three hands" },
    category: "device",
    problems: [
      {
        id: "S-010-B01",
        color: "#60a5fa",
        clue: "mouse",
        label: { ja: "マウスの箱", en: "Mouse box" },
      },
      {
        id: "S-010-B02",
        color: "#fb7185",
        clue: "touch",
        label: { ja: "タッチの箱", en: "Touch box" },
      },
      {
        id: "S-010-B03",
        color: "#34d399",
        clue: "pen",
        label: { ja: "ペンの箱", en: "Pen box" },
      },
    ],
  }),
  defineStage({
    id: "S-020",
    label: { ja: "枠に合わせる", en: "Fit the frame" },
    category: "page",
    problems: [
      {
        id: "S-020-B01",
        color: "#818cf8",
        clue: "resize",
        label: { ja: "画面幅の箱", en: "Viewport box" },
      },
    ],
  }),
  defineStage({
    id: "S-030",
    label: { ja: "選ばれた範囲", en: "The selected range" },
    category: "page",
    problems: [
      {
        id: "S-030-B01",
        color: "#fbbf24",
        clue: "selection",
        label: { ja: "選択範囲の箱", en: "Selection box" },
      },
    ],
  }),
  defineStage({
    id: "S-040",
    label: { ja: "見ない時間", en: "Time unseen" },
    category: "transition",
    problems: [
      {
        id: "S-040-B01",
        color: "#94a3b8",
        clue: "hidden",
        label: { ja: "見ない時間の箱", en: "Hidden-time box" },
      },
      {
        id: "S-040-B02",
        color: "#64748b",
        clue: "hidden",
        label: { ja: "長い不在の箱", en: "Long-absence box" },
      },
    ],
  }),
  defineStage({
    id: "S-050",
    label: { ja: "二つの窓", en: "Two windows" },
    category: "transition",
    problems: [
      {
        id: "S-050-B01",
        color: "#38bdf8",
        clue: "windows",
        label: { ja: "二つの窓の箱", en: "Two-window box" },
      },
    ],
  }),
  defineStage({
    id: "S-060",
    label: { ja: "帰ってくる箱", en: "The returning box" },
    category: "storage",
    problems: [
      {
        id: "S-060-B01",
        color: "#c084fc",
        clue: "return",
        label: { ja: "再訪の箱", en: "Return box" },
      },
    ],
  }),
  defineStage({
    id: "S-070",
    label: { ja: "通信のない返事", en: "An offline reply" },
    category: "storage",
    problems: [
      {
        id: "S-070-B01",
        color: "#2dd4bf",
        clue: "offline",
        label: { ja: "オフラインの箱", en: "Offline box" },
      },
    ],
  }),
  defineStage({
    id: "S-080",
    label: { ja: "別の入口", en: "Another entrance" },
    category: "edge",
    problems: [
      {
        id: "S-080-B01",
        color: "#f59e0b",
        clue: "install",
        label: { ja: "別の入口の箱", en: "Installed-app box" },
      },
    ],
  }),
  defineStage({
    id: "S-090",
    label: { ja: "外からの呼び声", en: "A call from outside" },
    category: "transition",
    problems: [
      {
        id: "S-090-B01",
        color: "#f472b6",
        clue: "notification",
        label: { ja: "通知の箱", en: "Notification box" },
      },
    ],
  }),
  defineStage({
    id: "S-100",
    label: { ja: "傾けて止める", en: "Tilt and hold" },
    category: "device",
    problems: [
      {
        id: "S-100-B01",
        color: "#fb7185",
        clue: "orientation",
        label: { ja: "端末姿勢の箱", en: "Orientation box" },
      },
    ],
  }),
  defineStage({
    id: "S-110",
    label: { ja: "光だけを見る", en: "See only light" },
    category: "device",
    problems: [
      {
        id: "S-110-B01",
        color: "#facc15",
        clue: "light",
        label: { ja: "光の箱", en: "Light box" },
      },
    ],
  }),
  defineStage({
    id: "S-120",
    label: { ja: "音のかたち", en: "The shape of sound" },
    category: "device",
    problems: [
      {
        id: "S-120-B01",
        color: "#22d3ee",
        clue: "sound",
        label: { ja: "音の箱", en: "Sound box" },
      },
    ],
  }),
  defineStage({
    id: "S-130",
    label: { ja: "箱の外の鍵", en: "A key outside the box" },
    category: "storage",
    problems: [
      {
        id: "S-130-B01",
        color: "#34d399",
        clue: "export",
        label: { ja: "鍵を外へ出す箱", en: "Export-key box" },
      },
      {
        id: "S-130-B02",
        color: "#10b981",
        clue: "import",
        label: { ja: "鍵を戻す箱", en: "Import-key box" },
      },
    ],
  }),
  defineStage({
    id: "S-140",
    label: { ja: "もう一つの端末", en: "Another device" },
    category: "edge",
    problems: [
      {
        id: "S-140-B01",
        color: "#60a5fa",
        clue: "backup",
        label: { ja: "バックアップの箱", en: "Backup box" },
      },
      {
        id: "S-140-B02",
        color: "#a78bfa",
        clue: "devices",
        label: { ja: "別端末の箱", en: "Remote-device box" },
      },
    ],
  }),
  defineStage({
    id: "S-150",
    label: { ja: "文書の順番", en: "Document order" },
    category: "page",
    problems: [
      {
        id: "S-150-B01",
        color: "#c084fc",
        clue: "dom",
        label: { ja: "文書構造の箱", en: "Document-structure box" },
      },
    ],
  }),
  defineStage({
    id: "S-160",
    label: { ja: "速さの軌跡", en: "A trace of speed" },
    category: "page",
    problems: [
      {
        id: "S-160-B01",
        color: "#38bdf8",
        clue: "path",
        label: { ja: "入力軌跡の箱", en: "Pointer-trace box" },
      },
    ],
  }),
  defineStage({
    id: "S-170",
    label: { ja: "止まった時間", en: "Paused time" },
    category: "page",
    problems: [
      {
        id: "S-170-B01",
        color: "#fbbf24",
        clue: "time",
        label: { ja: "時間の箱", en: "Animation-time box" },
      },
    ],
  }),
  defineStage({
    id: "S-180",
    label: { ja: "見えない受け渡し", en: "An invisible handoff" },
    category: "transition",
    problems: [
      {
        id: "S-180-B01",
        color: "#a78bfa",
        clue: "copy",
        label: { ja: "コピーの箱", en: "Copy box" },
      },
    ],
  }),
  defineStage({
    id: "S-190",
    label: { ja: "画面の中の画面", en: "A screen within the screen" },
    category: "device",
    problems: [
      {
        id: "S-190-B01",
        color: "#22d3ee",
        clue: "screen",
        label: { ja: "再帰画面の箱", en: "Recursive-screen box" },
      },
      {
        id: "S-190-B02",
        color: "#38bdf8",
        clue: "screen",
        label: { ja: "録画の箱", en: "Recording box" },
      },
      {
        id: "S-190-B03",
        color: "#818cf8",
        clue: "windows",
        label: { ja: "中継の箱", en: "Relay box" },
      },
      {
        id: "S-190-B04",
        color: "#facc15",
        clue: "eyedropper",
        label: { ja: "外縁の印の箱", en: "Edge-marker box" },
      },
    ],
  }),
  defineStage({
    id: "S-200",
    label: { ja: "同時に押す", en: "Press together" },
    category: "device",
    problems: [
      {
        id: "S-200-B01",
        color: "#fb7185",
        clue: "gamepad",
        label: { ja: "同時入力の箱", en: "Simultaneous-input box" },
      },
    ],
  }),
  defineStage({
    id: "S-210",
    label: { ja: "外側の数字", en: "The number outside" },
    category: "edge",
    problems: [
      {
        id: "S-210-B01",
        color: "#fbbf24",
        clue: "badge",
        label: { ja: "外側の数字の箱", en: "Outer-number box" },
      },
    ],
  }),
  defineStage({
    id: "S-220",
    label: { ja: "戻る道", en: "The path back" },
    category: "transition",
    problems: [
      {
        id: "S-220-B01",
        color: "#fb7185",
        clue: "history",
        label: { ja: "履歴の箱", en: "History box" },
      },
      {
        id: "S-220-B02",
        color: "#f59e0b",
        clue: "return",
        label: { ja: "戻る・進むの箱", en: "Back-forward box" },
      },
      {
        id: "S-220-B03",
        color: "#fbbf24",
        clue: "transition",
        label: { ja: "再読込の箱", en: "Reload box" },
      },
    ],
  }),
  defineStage({
    id: "S-230",
    label: { ja: "浮かぶ窓", en: "The floating window" },
    category: "edge",
    problems: [
      {
        id: "S-230-B01",
        color: "#60a5fa",
        clue: "pip",
        label: { ja: "小窓の箱", en: "Picture-in-picture box" },
      },
    ],
  }),
  defineStage({
    id: "S-240",
    label: { ja: "渡した印", en: "The shared mark" },
    category: "transition",
    problems: [
      {
        id: "S-240-B01",
        color: "#34d399",
        clue: "share",
        label: { ja: "共有の箱", en: "Share box" },
      },
      {
        id: "S-240-B02",
        color: "#10b981",
        clue: "install",
        label: { ja: "共有先の箱", en: "Share-target box" },
      },
    ],
  }),
  defineStage({
    id: "S-250",
    label: { ja: "一つだけの鍵", en: "The one lock" },
    category: "transition",
    problems: [
      {
        id: "S-250-B01",
        color: "#fbbf24",
        clue: "lock",
        label: { ja: "白になる箱", en: "White-light box" },
      },
      {
        id: "S-250-B02",
        color: "#fb7185",
        clue: "wait",
        label: { ja: "閉じる順番の箱", en: "Closing-order box" },
      },
    ],
  }),
  defineStage({
    id: "S-260",
    label: { ja: "画面の一滴", en: "A drop from the screen" },
    category: "device",
    problems: [
      {
        id: "S-260-B01",
        color: "#a78bfa",
        clue: "eyedropper",
        label: { ja: "色を採る箱", en: "Color-picker box" },
      },
    ],
  }),
  defineStage({
    id: "S-270",
    label: { ja: "並列の捜索", en: "The parallel search" },
    category: "edge",
    problems: [
      {
        id: "S-270-B01",
        color: "#34d399",
        clue: "gpu",
        label: { ja: "並列計算の箱", en: "Parallel-compute box" },
      },
    ],
  }),
  defineStage({
    id: "S-280",
    label: { ja: "近くの電池", en: "A nearby battery" },
    category: "device",
    problems: [
      {
        id: "S-280-B01",
        color: "#22d3ee",
        clue: "bluetooth",
        label: { ja: "近くの電池の箱", en: "Nearby-battery box" },
      },
    ],
  }),
  defineStage({
    id: "S-290",
    label: { ja: "生の入力", en: "Raw input" },
    category: "device",
    problems: [
      {
        id: "S-290-B01",
        color: "#60a5fa",
        clue: "hid",
        label: { ja: "入力レポートの箱", en: "Input-report box" },
      },
    ],
  }),
  defineStage({
    id: "S-300",
    label: { ja: "線の向こう", en: "Across the wire" },
    category: "device",
    problems: [
      {
        id: "S-300-B01",
        color: "#818cf8",
        clue: "usb",
        label: { ja: "USB転送の箱", en: "USB-transfer box" },
      },
    ],
  }),
  defineStage({
    id: "S-310",
    label: { ja: "もう一度の起動", en: "Launch once more" },
    category: "edge",
    problems: [
      {
        id: "S-310-B01",
        color: "#c084fc",
        clue: "launch",
        label: { ja: "再起動の箱", en: "Launch-handler box" },
      },
      {
        id: "S-310-B02",
        color: "#a78bfa",
        clue: "launch",
        label: { ja: "ショートカットの箱", en: "Shortcut box" },
      },
      {
        id: "S-310-B03",
        color: "#818cf8",
        clue: "launch",
        label: { ja: "新しいメモの箱", en: "New-note box" },
      },
    ],
  }),
  defineStage({
    id: "S-320",
    label: { ja: "折れ目をまたぐ", en: "Across the fold" },
    category: "device",
    problems: [
      {
        id: "S-320-B01",
        color: "#c084fc",
        clue: "fold",
        label: { ja: "折れ目の箱", en: "Fold box" },
      },
    ],
  }),
  defineStage({
    id: "S-330",
    label: { ja: "消えない灯り", en: "The light that stays" },
    category: "edge",
    problems: [
      {
        id: "S-330-B01",
        color: "#facc15",
        clue: "wake",
        label: { ja: "灯りを保つ箱", en: "Wake-lock box" },
      },
      {
        id: "S-330-B02",
        color: "#fde68a",
        clue: "return",
        label: { ja: "灯りを戻す箱", en: "Wake-lock return box" },
      },
    ],
  }),
  defineStage({
    id: "S-340",
    label: { ja: "形をつなぐ", en: "Connect the shapes" },
    category: "page",
    problems: [
      {
        id: "S-340-B01",
        color: "#34d399",
        clue: "transition",
        label: { ja: "画面遷移の箱", en: "View-transition box" },
      },
    ],
  }),
  defineStage({
    id: "S-350",
    label: { ja: "映像の手触り", en: "Touching the timeline" },
    category: "page",
    problems: [
      {
        id: "S-350-B01",
        color: "#60a5fa",
        clue: "time",
        label: { ja: "シークの箱", en: "Seek box" },
      },
      {
        id: "S-350-B02",
        color: "#f472b6",
        clue: "sound",
        label: { ja: "ミュートの箱", en: "Mute box" },
      },
      {
        id: "S-350-B03",
        color: "#34d399",
        clue: "pip",
        label: { ja: "再生と停止の箱", en: "Play-pause box" },
      },
    ],
  }),
  defineStage({
    id: "S-360",
    label: { ja: "窓を渡る音", en: "Sound across windows" },
    category: "transition",
    problems: [
      {
        id: "S-360-B01",
        color: "#22d3ee",
        clue: "sound",
        label: { ja: "接続の箱", en: "Connection box" },
      },
      {
        id: "S-360-B02",
        color: "#fb7185",
        clue: "windows",
        label: { ja: "切断の箱", en: "Disconnect box" },
      },
    ],
  }),
  defineStage({
    id: "S-370",
    label: { ja: "電気の境目", en: "Battery boundaries" },
    category: "device",
    problems: [
      {
        id: "S-370-B01",
        color: "#34d399",
        clue: "wake",
        label: { ja: "接続の箱", en: "Plugged-in box" },
      },
      {
        id: "S-370-B02",
        color: "#fb7185",
        clue: "wake",
        label: { ja: "取り外しの箱", en: "Unplugged box" },
      },
      {
        id: "S-370-B03",
        color: "#facc15",
        clue: "badge",
        label: { ja: "75%以上の箱", en: "75% or more box" },
      },
      {
        id: "S-370-B04",
        color: "#f59e0b",
        clue: "badge",
        label: { ja: "75%未満の箱", en: "Below 75% box" },
      },
    ],
  }),
  defineStage({
    id: "S-380",
    label: { ja: "三つの資格情報", en: "Three credentials" },
    category: "edge",
    problems: [
      {
        id: "S-380-B01",
        color: "#a78bfa",
        clue: "export",
        label: { ja: "保存の箱", en: "Create box" },
      },
      {
        id: "S-380-B02",
        color: "#34d399",
        clue: "lock",
        label: { ja: "利用成功の箱", en: "Use-success box" },
      },
      {
        id: "S-380-B03",
        color: "#fb7185",
        clue: "lock",
        label: { ja: "利用失敗の箱", en: "Use-failure box" },
      },
    ],
  }),
  defineStage({
    id: "S-390",
    label: { ja: "待つ資格情報", en: "A waiting credential" },
    category: "edge",
    problems: [
      {
        id: "S-390-B01",
        color: "#f59e0b",
        clue: "wait",
        label: { ja: "一致なしの箱", en: "No-match box" },
      },
      {
        id: "S-390-B02",
        color: "#94a3b8",
        clue: "wait",
        label: { ja: "中断の箱", en: "Abort box" },
      },
    ],
  }),
  defineStage({
    id: "S-400",
    label: { ja: "一時間ずれた時計", en: "A clock one hour away" },
    category: "device",
    problems: [
      {
        id: "S-400-B01",
        color: "#818cf8",
        clue: "time",
        label: { ja: "巻き戻しの箱", en: "Rewind box" },
      },
      {
        id: "S-400-B02",
        color: "#34d399",
        clue: "return",
        label: { ja: "現在へ戻す箱", en: "Return-to-now box" },
      },
    ],
  }),
  defineStage({
    id: "S-410",
    label: { ja: "通知の迷路", en: "Notification maze" },
    category: "edge",
    problems: [
      {
        id: "S-410-B01",
        color: "#f472b6",
        clue: "notification",
        label: { ja: "通知操作の箱", en: "Notification-actions box" },
      },
    ],
  }),
  defineStage({
    id: "S-420",
    label: { ja: "通知の金庫", en: "Notification vault" },
    category: "edge",
    problems: [
      {
        id: "S-420-B01",
        color: "#fbbf24",
        clue: "lock",
        label: { ja: "金庫の箱", en: "Vault box" },
      },
    ],
  }),
  defineStage({
    id: "S-430",
    label: { ja: "外側から止める", en: "Pause from outside" },
    category: "edge",
    problems: [
      {
        id: "S-430-B01",
        color: "#22d3ee",
        clue: "sound",
        label: { ja: "外部停止の箱", en: "External-pause box" },
      },
    ],
  }),
  defineStage({
    id: "S-440",
    label: { ja: ".busyboxの入口", en: "The .busybox entrance" },
    category: "edge",
    problems: [
      {
        id: "S-440-B01",
        color: "#a78bfa",
        clue: "import",
        label: { ja: "ファイル起動の箱", en: "File-launch box" },
      },
    ],
  }),
  defineStage({
    id: "S-450",
    label: { ja: "専用の合図", en: "A private signal" },
    category: "edge",
    problems: [
      {
        id: "S-450-B01",
        color: "#60a5fa",
        clue: "launch",
        label: { ja: "プロトコルの箱", en: "Protocol box" },
      },
    ],
  }),
  defineStage({
    id: "S-460",
    label: { ja: "タイトルバーの内側", en: "Inside the title bar" },
    category: "edge",
    problems: [
      {
        id: "S-460-B01",
        color: "#c084fc",
        clue: "windows",
        label: { ja: "オーバーレイの箱", en: "Overlay box" },
      },
    ],
  }),
  defineStage({
    id: "S-480",
    label: { ja: "文字の四季", en: "Four text scales" },
    category: "device",
    problems: [
      {
        id: "S-480-B01",
        color: "#60a5fa",
        clue: "resize",
        label: { ja: "小の箱", en: "Small box" },
      },
      {
        id: "S-480-B02",
        color: "#34d399",
        clue: "resize",
        label: { ja: "標準の箱", en: "Standard box" },
      },
      {
        id: "S-480-B03",
        color: "#fbbf24",
        clue: "resize",
        label: { ja: "大の箱", en: "Large box" },
      },
      {
        id: "S-480-B04",
        color: "#fb7185",
        clue: "resize",
        label: { ja: "特大の箱", en: "Extra-large box" },
      },
    ],
  }),
  defineStage({
    id: "S-490",
    label: { ja: "名前を置く", en: "Place the name" },
    category: "page",
    map: { clueFromStageIds: [] },
    problems: [
      {
        id: "S-490-B01",
        color: "#a78bfa",
        clue: "dom",
        label: { ja: "busyboxの箱", en: "busybox box" },
      },
    ],
  }),
  defineStage({
    id: "S-500",
    label: { ja: "暗号の受け渡し", en: "A cipher handoff" },
    category: "transition",
    map: { clueFromStageIds: ["S-180", "S-490"] },
    problems: [
      {
        id: "S-500-B01",
        color: "#818cf8",
        clue: "selection",
        label: { ja: "選び出す箱", en: "Select-it box" },
      },
    ],
  }),
  defineStage({
    id: "S-510",
    label: { ja: "窓を越えるファイル", en: "A file across windows" },
    category: "transition",
    problems: [
      {
        id: "S-510-B01",
        color: "#34d399",
        clue: "export",
        label: { ja: "ドロップの箱", en: "Drop box" },
      },
    ],
  }),
  defineStage({
    id: "S-520",
    label: { ja: "すぐそば", en: "Very near" },
    category: "device",
    problems: [
      {
        id: "S-520-B01",
        color: "#f472b6",
        clue: "devices",
        label: { ja: "近接の箱", en: "Proximity box" },
      },
    ],
  }),
  defineStage({
    id: "S-530",
    label: { ja: "三方向の加速", en: "Acceleration in three directions" },
    category: "device",
    problems: [
      {
        id: "S-530-B01",
        color: "#fb7185",
        clue: "path",
        label: { ja: "X軸の箱", en: "X-axis box" },
      },
      {
        id: "S-530-B02",
        color: "#34d399",
        clue: "path",
        label: { ja: "Y軸の箱", en: "Y-axis box" },
      },
      {
        id: "S-530-B03",
        color: "#60a5fa",
        clue: "path",
        label: { ja: "Z軸の箱", en: "Z-axis box" },
      },
    ],
  }),
  defineStage({
    id: "S-540",
    label: { ja: "光の両端", en: "Both ends of light" },
    category: "device",
    problems: [
      {
        id: "S-540-B01",
        color: "#0f172a",
        clue: "light",
        label: { ja: "暗闇の箱", en: "Darkness box" },
      },
      {
        id: "S-540-B02",
        color: "#fef08a",
        clue: "light",
        label: { ja: "眩光の箱", en: "Bright-light box" },
      },
    ],
  }),
  defineStage({
    id: "S-550",
    label: { ja: "重さが消える瞬間", en: "When weight disappears" },
    category: "device",
    problems: [
      {
        id: "S-550-B01",
        color: "#c084fc",
        clue: "wait",
        label: { ja: "低加速度の箱", en: "Low-acceleration box" },
      },
    ],
  }),
  defineStage({
    id: "S-560",
    label: { ja: "三軸の一回転", en: "One turn on each axis" },
    category: "device",
    problems: [
      {
        id: "S-560-B01",
        color: "#fb7185",
        clue: "orientation",
        label: { ja: "X回転の箱", en: "X-turn box" },
      },
      {
        id: "S-560-B02",
        color: "#34d399",
        clue: "orientation",
        label: { ja: "Y回転の箱", en: "Y-turn box" },
      },
      {
        id: "S-560-B03",
        color: "#60a5fa",
        clue: "orientation",
        label: { ja: "Z回転の箱", en: "Z-turn box" },
      },
    ],
  }),
  defineStage({
    id: "S-570",
    label: { ja: "姿勢の巡回", en: "An orientation circuit" },
    category: "device",
    problems: [
      {
        id: "S-570-B01",
        color: "#22d3ee",
        clue: "orientation",
        label: { ja: "巡回の箱", en: "Circuit box" },
      },
    ],
  }),
  defineStage({
    id: "S-580",
    label: { ja: "箱の名前を呼ぶ", en: "Call the box by name" },
    category: "device",
    map: { clueFromStageIds: ["S-490"] },
    problems: [
      {
        id: "S-580-B01",
        color: "#f472b6",
        clue: "sound",
        label: { ja: "発話の箱", en: "Speech box" },
      },
    ],
  }),
  defineStage({
    id: "S-590",
    label: { ja: "出発点から", en: "From the starting point" },
    category: "device",
    problems: [
      {
        id: "S-590-B01",
        color: "#34d399",
        clue: "path",
        label: { ja: "5mの箱", en: "5 m box" },
      },
      {
        id: "S-590-B02",
        color: "#fbbf24",
        clue: "path",
        label: { ja: "25mの箱", en: "25 m box" },
      },
      {
        id: "S-590-B03",
        color: "#fb7185",
        clue: "path",
        label: { ja: "100mの箱", en: "100 m box" },
      },
    ],
  }),
  defineStage({
    id: "S-600",
    label: { ja: "高さの三層", en: "Three altitude layers" },
    category: "device",
    problems: [
      {
        id: "S-600-B01",
        color: "#34d399",
        clue: "path",
        label: { ja: "100m未満の箱", en: "Below 100 m box" },
      },
      {
        id: "S-600-B02",
        color: "#fbbf24",
        clue: "path",
        label: { ja: "100〜500mの箱", en: "100–500 m box" },
      },
      {
        id: "S-600-B03",
        color: "#60a5fa",
        clue: "path",
        label: { ja: "500m以上の箱", en: "500 m or more box" },
      },
    ],
  }),
] as const satisfies readonly StageSpec[];

export type StageId = (typeof stageCatalogue)[number]["id"];
export type ProblemBoxId =
  (typeof stageCatalogue)[number]["problems"][number]["id"];

export const stageById = Object.fromEntries(
  stageCatalogue.map((stage) => [stage.id, stage]),
) as Readonly<Record<StageId, (typeof stageCatalogue)[number]>>;

export const problemById = Object.fromEntries(
  stageCatalogue.flatMap((stage) =>
    stage.problems.map((problem) => [problem.id, problem]),
  ),
) as Readonly<
  Record<ProblemBoxId, (typeof stageCatalogue)[number]["problems"][number]>
>;

export const totalBoxCount = stageCatalogue.reduce(
  (total, stage) => total + stage.problems.length,
  0,
);
