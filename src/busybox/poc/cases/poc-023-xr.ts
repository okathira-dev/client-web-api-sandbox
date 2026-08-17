import type { PocRoot } from "../contracts";

type XRSessionLike = EventTarget & {
  requestReferenceSpace: (type: string) => Promise<XRReferenceSpaceLike>;
  requestAnimationFrame: (
    callback: (time: number, frame: XRFrameLike) => void,
  ) => number;
  cancelAnimationFrame?: (handle: number) => void;
  end: () => Promise<void>;
};
type XRReferenceSpaceLike = object;
type XRFrameLike = {
  session: XRSessionLike;
  getViewerPose?: (space: XRReferenceSpaceLike) => object | null;
  getPose?: (
    space: object,
    baseSpace: XRReferenceSpaceLike,
  ) => {
    transform?: { position?: { x: number; y: number; z: number } };
  } | null;
};
type XRSystemLike = {
  isSessionSupported?: (mode: string) => Promise<boolean>;
  requestSession: (mode: string) => Promise<XRSessionLike>;
};

export function mount(root: PocRoot): () => void {
  const status = root.querySelector<HTMLOutputElement>("[data-poc-status]");
  const start = root.querySelector<HTMLButtonElement>("[data-xr-start]");
  const end = root.querySelector<HTMLButtonElement>("[data-xr-end]");
  const xr = (navigator as Navigator & { xr?: XRSystemLike }).xr;
  let session: XRSessionLike | undefined;
  let referenceSpace: XRReferenceSpaceLike | undefined;
  let poseSeen = false;
  let frameHandle: number | undefined;
  const render = (message: string) => {
    if (status) status.value = message;
  };
  const onSelect = (event: Event) => {
    const xrEvent = event as Event & {
      frame?: XRFrameLike;
      inputSource?: { targetRaySpace?: object };
    };
    const pose = xrEvent.frame?.getPose?.(
      xrEvent.inputSource?.targetRaySpace ?? {},
      referenceSpace ?? {},
    );
    if (pose?.transform?.position) {
      render(
        `実XRInputSource select rayを観測: origin=${JSON.stringify(pose.transform.position)}`,
      );
      root.dataset.pocState = "pass";
    } else {
      render("selectは届きましたがposeがないため成功にしません。");
    }
  };
  const begin = async () => {
    if (!xr) {
      render("WebXR Device APIがありません。inlineやmouseで代替しません。");
      root.dataset.pocState = "unsupported";
      return;
    }
    try {
      if (
        xr.isSessionSupported &&
        !(await xr.isSessionSupported("immersive-vr"))
      ) {
        render("immersive-vr非対応。AR/VR実機でのみ再試行します。");
        root.dataset.pocState = "unsupported";
        return;
      }
      const startedSession = (await xr.requestSession(
        "immersive-vr",
      )) as unknown as XRSessionLike;
      session = startedSession;
      referenceSpace = await startedSession.requestReferenceSpace("viewer");
      startedSession.addEventListener("select", onSelect);
      const frame = (_time: number, current: XRFrameLike) => {
        if (!session) return;
        const pose = current.getViewerPose?.(referenceSpace ?? {});
        if (pose && !poseSeen) {
          poseSeen = true;
          render(
            "immersive sessionと最初の非null viewer poseを観測。select rayを箱へ向けて選択します。",
          );
          root.dataset.pocState = "partial";
        }
        frameHandle = startedSession.requestAnimationFrame(frame);
      };
      frameHandle = startedSession.requestAnimationFrame(frame);
    } catch (error) {
      render(
        `XR session未開始: ${error instanceof Error ? `${error.name}: ${error.message}` : "error"}`,
      );
      root.dataset.pocState = "partial";
    }
  };
  const cleanup = () => {
    session?.removeEventListener("select", onSelect);
    if (session && frameHandle !== undefined)
      session.cancelAnimationFrame?.(frameHandle);
    void session?.end();
    session = undefined;
    referenceSpace = undefined;
    poseSeen = false;
    frameHandle = undefined;
    delete root.dataset.pocState;
    render("XR sessionを終了しました。");
  };
  const startListener = () => void begin();
  start?.addEventListener("click", startListener);
  end?.addEventListener("click", cleanup);
  return () => {
    session?.removeEventListener("select", onSelect);
    if (session && frameHandle !== undefined)
      session.cancelAnimationFrame?.(frameHandle);
    void session?.end();
    start?.removeEventListener("click", startListener);
    end?.removeEventListener("click", cleanup);
  };
}
