import type { PocRoot } from "../contracts";

type AudioSessionLike = EventTarget & {
  type?: string;
  state?: string;
};

export function mount(root: PocRoot): () => void {
  const status = root.querySelector<HTMLOutputElement>("[data-poc-status]");
  const audio = root.querySelector<HTMLAudioElement>(
    "[data-audio-session-player]",
  );
  const start = root.querySelector<HTMLButtonElement>(
    "[data-audio-session-start]",
  );
  const stop = root.querySelector<HTMLButtonElement>(
    "[data-audio-session-stop]",
  );
  const navigatorWithAudioSession = navigator as Navigator & {
    audioSession?: AudioSessionLike;
  };
  const session = navigatorWithAudioSession.audioSession;
  const states: string[] = [];
  const render = (message: string) => {
    if (status) status.value = message;
  };
  const onStateChange = () => {
    if (!session?.state) return;
    states.push(session.state);
    render(`Audio Session states: ${states.join(" → ")}`);
    if (states.includes("interrupted") && states.at(-1) === "active") {
      root.dataset.pocState = "pass";
    }
  };
  const begin = async () => {
    if (!session || !audio) {
      render(
        "Audio Session APIまたはplayerがありません。通常pauseでは代替しません。",
      );
      root.dataset.pocState = "unsupported";
      return;
    }
    session.addEventListener("statechange", onStateChange);
    if ("type" in session) session.type = "playback";
    states.length = 0;
    try {
      await audio.play();
      render(
        "active後に外部audio focusを奪ってinterrupted→active復帰を確認してください。",
      );
      root.dataset.pocState = "partial";
    } catch (error) {
      render(
        `再生開始失敗: ${error instanceof Error ? error.message : "error"}`,
      );
    }
  };
  const cleanup = () => {
    audio?.pause();
    if (audio) audio.currentTime = 0;
    session?.removeEventListener("statechange", onStateChange);
    states.length = 0;
    delete root.dataset.pocState;
    render("停止・listener解除・type復元を実施しました。");
  };
  const startListener = () => void begin();
  start?.addEventListener("click", startListener);
  stop?.addEventListener("click", cleanup);
  return () => {
    audio?.pause();
    session?.removeEventListener("statechange", onStateChange);
    start?.removeEventListener("click", startListener);
    stop?.removeEventListener("click", cleanup);
  };
}
