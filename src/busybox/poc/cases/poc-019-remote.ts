import type { PocRoot } from "../contracts";

type RemotePlaybackLike = EventTarget & {
  state?: string;
  prompt?: () => Promise<void>;
  cancelWatchAvailability?: () => Promise<void>;
};
type BarcodeDetectorLike = new (options?: {
  formats: string[];
}) => {
  detect: (source: CanvasImageSource) => Promise<Array<{ rawValue?: string }>>;
};

export function mount(root: PocRoot): () => void {
  const status = root.querySelector<HTMLOutputElement>("[data-poc-status]");
  const video = root.querySelector<HTMLVideoElement>("[data-remote-video]");
  const camera = root.querySelector<HTMLVideoElement>("[data-remote-camera]");
  const connect = root.querySelector<HTMLButtonElement>(
    "[data-remote-connect]",
  );
  const scan = root.querySelector<HTMLButtonElement>("[data-remote-scan]");
  const reset = root.querySelector<HTMLButtonElement>("[data-remote-reset]");
  const expected = root.dataset.remoteRound ?? "BUSYBOX_REMOTE_QR";
  const remote = (video as HTMLVideoElement & { remote?: RemotePlaybackLike })
    ?.remote;
  let stream: MediaStream | undefined;
  let scanning = false;
  const render = (message: string) => {
    if (status) status.value = message;
  };
  const connectRemote = async () => {
    if (!remote?.prompt) {
      render(
        "RemotePlayback APIまたはpromptがありません。local再生では成功にしません。",
      );
      root.dataset.pocState = "unsupported";
      return;
    }
    try {
      await remote.prompt();
      render(`RemotePlayback prompt完了。state=${remote.state ?? "unknown"}`);
      root.dataset.pocState =
        remote.state === "connected" ? "partial" : "partial";
    } catch (error) {
      render(
        `RemotePlayback未接続: ${error instanceof Error ? `${error.name}: ${error.message}` : "error"}`,
      );
    }
  };
  const scanQr = async () => {
    const Detector = (
      window as Window & { BarcodeDetector?: BarcodeDetectorLike }
    ).BarcodeDetector;
    if (!Detector || !camera) {
      render(
        "BarcodeDetectorまたはcameraがありません。jsQRへfallbackしません。",
      );
      root.dataset.pocState = "unsupported";
      return;
    }
    if (scanning) return;
    scanning = true;
    delete root.dataset.pocState;
    let detectedValue = false;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      camera.srcObject = stream;
      await camera.play();
      const detector = new Detector({ formats: ["qr_code"] });
      const started = performance.now();
      while (scanning && performance.now() - started < 10_000) {
        const detected = await detector.detect(camera);
        const value = detected[0]?.rawValue;
        if (value) {
          detectedValue = true;
          render(
            `BarcodeDetector rawValue=${value}; current round一致=${value === expected}`,
          );
          root.dataset.pocState = value === expected ? "pass" : "partial";
          break;
        }
        await new Promise((resolve) => window.setTimeout(resolve, 100));
      }
      if (scanning && !detectedValue)
        render("10秒以内にqr_codeを検出できませんでした。");
    } catch (error) {
      render(
        `camera / BarcodeDetector未完了: ${error instanceof Error ? `${error.name}: ${error.message}` : "error"}`,
      );
    } finally {
      scanning = false;
      stream?.getTracks().forEach((track) => {
        track.stop();
      });
      stream = undefined;
      if (camera) camera.srcObject = null;
    }
  };
  const clear = () => {
    scanning = false;
    stream?.getTracks().forEach((track) => {
      track.stop();
    });
    stream = undefined;
    if (camera) camera.srcObject = null;
    delete root.dataset.pocState;
    render(`未実行。current round=${expected}（カメラで読んだ値だけを比較）`);
  };
  const onConnect = () => void connectRemote();
  const onScan = () => void scanQr();
  connect?.addEventListener("click", onConnect);
  scan?.addEventListener("click", onScan);
  reset?.addEventListener("click", clear);
  render(`未実行。current round=${expected}`);
  return () => {
    scanning = false;
    stream?.getTracks().forEach((track) => {
      track.stop();
    });
    void remote?.cancelWatchAvailability?.();
    connect?.removeEventListener("click", onConnect);
    scan?.removeEventListener("click", onScan);
    reset?.removeEventListener("click", clear);
  };
}
