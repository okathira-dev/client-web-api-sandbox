import type { PocRoot } from "./contracts";

type ExperimentalWindow = Window & {
  documentPictureInPicture?: {
    requestWindow: (options?: {
      width?: number;
      height?: number;
    }) => Promise<Window>;
  };
  EditContext?: typeof EditContext;
  IdleDetector?: typeof IdleDetector;
};

const names: Record<string, string> = {
  "036": "Pointer Lock",
  "037": "Idle Detection",
  "038": "IntersectionObserver",
  "041": "Document Picture-in-Picture",
  "042": "EditContext",
  "046": "File System Access",
  "048": "Compression Streams",
  "051": "Fullscreen viewport",
  "052": "MediaSource chunk append",
  "053": "WebVTT cue editing",
};

function out(root: PocRoot): HTMLOutputElement {
  const existing = root.querySelector<HTMLOutputElement>("[data-poc-status]");
  if (existing) return existing;
  const element = document.createElement("output");
  element.dataset.pocStatus = "true";
  root.append(element);
  return element;
}
function status(
  root: PocRoot,
  value: "partial" | "pass" | "fail" | "unsupported",
  text: string,
) {
  root.dataset.pocState = value;
  out(root).value = text;
}
function button(root: PocRoot, text: string) {
  const element = document.createElement("button");
  element.type = "button";
  element.textContent = text;
  root.prepend(element);
  return element;
}
function surface(root: PocRoot, text: string) {
  const element = document.createElement("div");
  element.className = "advanced-surface";
  element.tabIndex = 0;
  element.textContent = text;
  root.append(element);
  return element;
}

function pointerLock(root: PocRoot, cleanups: Array<() => void>) {
  const target = surface(root, "ここをクリックしてロックし、マウスを3回動かす");
  const start = button(root, "Pointer Lockを開始");
  let moves = 0;
  const move = (event: MouseEvent) => {
    if (document.pointerLockElement !== target || !event.isTrusted) return;
    moves += 1;
    if (moves >= 3)
      status(
        root,
        "pass",
        "lock中のtrusted pointer movementを3件観測しました。Escで解除できます。",
      );
  };
  const begin = () => {
    target.requestPointerLock?.();
    status(
      root,
      "partial",
      "pointer lock待ち。Esc解除と離脱cleanupも確認してください。",
    );
  };
  target.addEventListener("mousemove", move);
  start.addEventListener("click", begin);
  cleanups.push(() => {
    if (document.pointerLockElement === target) document.exitPointerLock();
    target.removeEventListener("mousemove", move);
    start.removeEventListener("click", begin);
  });
}

function idle(root: PocRoot, cleanups: Array<() => void>) {
  const Ctor = (window as ExperimentalWindow).IdleDetector;
  const start = button(root, "Idle Detectionを開始");
  if (!Ctor)
    return status(
      root,
      "unsupported",
      "IdleDetectorがありません。page timerへfallbackしません。",
    );
  let controller: AbortController | undefined;
  const begin = async () => {
    try {
      const permission = await (
        Ctor as unknown as { requestPermission: () => Promise<string> }
      ).requestPermission();
      if (permission !== "granted")
        return status(
          root,
          "partial",
          `idle-detection permission=${permission}`,
        );
      controller = new AbortController();
      const detector = new Ctor();
      detector.addEventListener(
        "change",
        () =>
          status(
            root,
            "pass",
            "実IdleDetector changeを観測しました。timerの経過だけでは開きません。",
          ),
        { signal: controller.signal },
      );
      await detector.start({ threshold: 60_000, signal: controller.signal });
      status(root, "partial", "IdleDetector started: threshold=60000ms");
    } catch (error) {
      status(
        root,
        "partial",
        "Idle Detection未完了: " +
          (error instanceof Error ? error.message : "error"),
      );
    }
  };
  start.addEventListener("click", () => void begin());
  cleanups.push(() => controller?.abort());
}

function intersection(root: PocRoot, cleanups: Array<() => void>) {
  const scroll = surface(
    root,
    "横にスクロールし、A/B/Cを同時に枠内（各60%以上）へ入れる。",
  );
  scroll.classList.add("advanced-scroll-surface");
  for (const label of ["window A", "window B", "window C"]) {
    const item = document.createElement("div");
    item.className = "advanced-intersection-window";
    item.textContent = label;
    scroll.append(item);
  }
  const start = button(root, "IntersectionObserverを開始");
  const items = [
    ...scroll.querySelectorAll<HTMLElement>(".advanced-intersection-window"),
  ];
  let observer: IntersectionObserver | undefined;
  const begin = () => {
    const ratios = new Map<Element, number>();
    observer?.disconnect();
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          ratios.set(entry.target, entry.intersectionRatio);
        if (items.every((item) => (ratios.get(item) ?? 0) >= 0.6))
          status(
            root,
            "pass",
            "3対象の実intersectionRatioが同時に0.60以上です。",
          );
      },
      { root: scroll, threshold: [0, 0.6, 1] },
    );
    items.forEach((item) => {
      observer?.observe(item);
    });
    status(
      root,
      "partial",
      "横にスクロールしてA/B/Cを同時に枠内へ入れてください。",
    );
  };
  start.addEventListener("click", begin);
  cleanups.push(() => observer?.disconnect());
}

function documentPip(root: PocRoot, cleanups: Array<() => void>) {
  const start = button(root, "Document PiPを開く");
  let pip: Window | undefined;
  const begin = async () => {
    const api = (window as ExperimentalWindow).documentPictureInPicture;
    if (!api)
      return status(
        root,
        "unsupported",
        "documentPictureInPictureがありません。",
      );
    try {
      pip = await api.requestWindow({ width: 360, height: 220 });
      pip.document.body.textContent = "PiP fragment: BUSYBOX WINDOW";
      pip.addEventListener(
        "pagehide",
        () => status(root, "pass", "PiPの実windowとpagehideを観測しました。"),
        { once: true },
      );
      status(root, "partial", "PiPを閉じてpagehideを観測してください。");
    } catch (error) {
      status(
        root,
        "partial",
        "Document PiP未完了: " +
          (error instanceof Error ? error.message : "error"),
      );
    }
  };
  start.addEventListener("click", () => void begin());
  cleanups.push(() => pip?.close());
}

function editContext(root: PocRoot, cleanups: Array<() => void>) {
  const start = button(root, "EditContextを開始");
  const target = surface(root, "IME composition surface");
  const begin = () => {
    const Ctor = (window as ExperimentalWindow).EditContext;
    if (!Ctor || !("editContext" in target))
      return status(
        root,
        "unsupported",
        "EditContextがありません。textarea fallbackはしません。",
      );
    const context = new Ctor();
    target.editContext = context;
    const update = () =>
      status(
        root,
        "pass",
        `実EditContext textupdateを観測しました: ${context.text ?? ""}`,
      );
    context.addEventListener("textupdate", update);
    target.focus();
    status(root, "partial", "OS IMEで文字をcompositionしてください。");
    cleanups.push(() => context.removeEventListener("textupdate", update));
  };
  start.addEventListener("click", begin);
}

function fileSystem(root: PocRoot) {
  const start = button(root, "seed fileを選ぶ");
  const begin = async () => {
    if (!("showSaveFilePicker" in window))
      return status(root, "unsupported", "File System Accessがありません。");
    try {
      const picker = window.showSaveFilePicker as (options: {
        suggestedName: string;
      }) => Promise<FileSystemFileHandle>;
      const handle = await picker({ suggestedName: "busybox-poc.txt" });
      const writable = await handle.createWritable();
      await writable.write("BUSYBOX seed");
      await writable.close();
      const value = await (await handle.getFile()).text();
      status(
        root,
        value === "BUSYBOX seed" ? "pass" : "fail",
        `同じfile handleを再読込しました: ${value}`,
      );
    } catch (error) {
      status(
        root,
        "partial",
        "File System Access未完了: " +
          (error instanceof Error ? error.message : "error"),
      );
    }
  };
  start.addEventListener("click", () => void begin());
}

function compression(root: PocRoot) {
  const start = button(root, "gzipを展開");
  const begin = async () => {
    if (!("DecompressionStream" in window))
      return status(root, "unsupported", "DecompressionStreamがありません。");
    try {
      const response = await fetch("../fixtures/s880/assets/parcel-a.gz");
      const text = await new Response(
        response.body?.pipeThrough(new DecompressionStream("gzip")),
      ).text();
      status(
        root,
        text.includes("BUSYBOX") ? "pass" : "fail",
        `gzip展開結果を照合しました: ${text.slice(0, 80)}`,
      );
    } catch (error) {
      status(
        root,
        "fail",
        "Compression failed: " +
          (error instanceof Error ? error.message : "error"),
      );
    }
  };
  start.addEventListener("click", () => void begin());
}

function fullscreen(root: PocRoot, cleanups: Array<() => void>) {
  const target = surface(root, "fullscreenでだけ整列するviewport");
  const start = button(root, "fullscreenへ入る");
  const change = () => {
    if (document.fullscreenElement === target)
      status(
        root,
        "pass",
        "実fullscreen elementとviewport変化を観測しました。",
      );
  };
  document.addEventListener("fullscreenchange", change);
  start.addEventListener(
    "click",
    () =>
      void target
        .requestFullscreen?.()
        .catch(() =>
          status(root, "partial", "fullscreenを開始できませんでした。"),
        ),
  );
  cleanups.push(() => {
    document.removeEventListener("fullscreenchange", change);
    if (document.fullscreenElement === target) void document.exitFullscreen();
  });
}

function mediaSource(root: PocRoot, cleanups: Array<() => void>) {
  const start = button(root, "MediaSourceへchunkをappend");
  const video = document.createElement("video");
  video.controls = true;
  video.muted = true;
  video.className = "poc-small-video";
  root.append(video);
  let url: string | undefined;
  const begin = async () => {
    if (!MediaSource.isTypeSupported('video/webm; codecs="vp8"'))
      return status(root, "unsupported", "VP8 WebM MediaSourceがありません。");
    try {
      const source = new MediaSource();
      url = URL.createObjectURL(source);
      video.src = url;
      await new Promise<void>((resolve) =>
        source.addEventListener("sourceopen", () => resolve(), { once: true }),
      );
      const buffer = source.addSourceBuffer('video/webm; codecs="vp8"');
      const data = await (
        await fetch("../fixtures/media/assets/reel-320x180.webm")
      ).arrayBuffer();
      await new Promise<void>((resolve) => {
        buffer.addEventListener("updateend", () => resolve(), { once: true });
        buffer.appendBuffer(data);
      });
      source.endOfStream();
      status(
        root,
        "pass",
        `固定動画をSourceBufferへappendしました: bytes=${data.byteLength}`,
      );
    } catch (error) {
      status(
        root,
        "fail",
        "MediaSource failed: " +
          (error instanceof Error ? error.message : "error"),
      );
    }
  };
  start.addEventListener("click", () => void begin());
  cleanups.push(() => {
    video.removeAttribute("src");
    video.load();
    if (url) URL.revokeObjectURL(url);
  });
}

function webVtt(root: PocRoot, cleanups: Array<() => void>) {
  const start = button(root, "WebVTT cueを編集");
  const video = document.createElement("video");
  video.controls = true;
  video.muted = true;
  video.className = "poc-small-video";
  video.src = "../fixtures/media/assets/reel-320x180.webm";
  root.append(video);
  const preview = surface(root, "active cue: none");
  const begin = () => {
    const track = video.addTextTrack("subtitles", "PoC cues", "en");
    track.mode = "showing";
    track.addCue(new VTTCue(0, 1, "BUSYBOX_CUE_A"));
    track.addCue(new VTTCue(1, 2, "BUSYBOX_CUE_B"));
    const changed = () => {
      const cues = [...(track.activeCues ?? [])].map(
        (cue) => (cue as VTTCue).text,
      );
      preview.textContent = `active cue: ${cues.join(", ") || "none"}`;
      status(root, "pass", "実TextTrack cueとactive cue列を観測しました。");
    };
    track.addEventListener("cuechange", changed);
    status(
      root,
      "partial",
      "動画を再生し、native字幕とactive cue表示の変化を確認してください。",
    );
    cleanups.push(() => {
      track.removeEventListener("cuechange", changed);
      track.mode = "disabled";
    });
  };
  start.addEventListener("click", begin, { once: true });
}

const mounts: Record<
  string,
  (root: PocRoot, cleanups: Array<() => void>) => void
> = {
  "036": pointerLock,
  "037": idle,
  "038": intersection,
  "041": documentPip,
  "042": editContext,
  "046": fileSystem,
  "048": compression,
  "051": fullscreen,
  "052": mediaSource,
  "053": webVtt,
};

export function mount(root: PocRoot): () => void {
  const id = root.dataset.poc ?? "";
  const cleanups: Array<() => void> = [];
  const children = new Set(Array.from(root.children));
  delete root.dataset.pocState;
  out(root).value = `${names[id] ?? "experimental"} PoCを読み込みました。`;
  const current = mounts[id];
  if (!current) {
    status(root, "fail", `未登録のadvanced PoC: ${id}`);
    return () => undefined;
  }
  current(root, cleanups);
  return () => {
    for (const cleanup of cleanups.splice(0)) cleanup();
    for (const child of Array.from(root.children))
      if (!children.has(child)) child.remove();
  };
}
