import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

type InteractionState = "idle" | "active" | "cancelled" | "unavailable";

export function RecursiveCaptureStage(props: StageComponentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cleanupRef = useRef<() => void>(() => undefined);
  const [status, setStatus] = useState<InteractionState>("idle");
  const [frames, setFrames] = useState(0);
  const boxId = "S-190-B01";

  useEffect(() => () => cleanupRef.current(), []);

  const start = async () => {
    cleanupRef.current();
    try {
      // preferCurrentTab is a progressive hint. The selected surface is still
      // entirely controlled by the browser's explicit user-facing picker.
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
        preferCurrentTab: true,
        selfBrowserSurface: "include",
      } as DisplayMediaStreamOptions);
      const video = videoRef.current;
      if (!video) {
        for (const track of stream.getTracks()) track.stop();
        return;
      }
      video.srcObject = stream;
      await video.play();
      const track = stream.getVideoTracks()[0];
      let observedFrames = 0;
      const timer = window.setInterval(() => {
        if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
        observedFrames += 1;
        setFrames(observedFrames);
        if (
          observedFrames >= 12 &&
          track?.getSettings().displaySurface === "browser"
        ) {
          props.solve(boxId, ["display-capture:browser-surface"]);
        }
      }, 120);
      const cleanup = () => {
        window.clearInterval(timer);
        for (const mediaTrack of stream.getTracks()) mediaTrack.stop();
        video.srcObject = null;
      };
      cleanupRef.current = cleanup;
      track?.addEventListener("ended", cleanup, { once: true });
      props.signal.addEventListener("abort", cleanup, { once: true });
      setStatus("active");
    } catch (error) {
      setStatus(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "cancelled"
          : "unavailable",
      );
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <video
        ref={videoRef}
        className="capture-preview"
        muted
        playsInline
        aria-label={
          props.locale === "ja"
            ? "共有画面の再帰表示"
            : "Recursive screen preview"
        }
      >
        <track
          kind="captions"
          src="data:text/vtt,WEBVTT"
          srcLang="en"
          label="No audio"
          default
        />
      </video>
      <button
        type="button"
        className="stage-action"
        onClick={() => void start()}
      >
        {props.locale === "ja" ? "このタブを映す" : "Capture this tab"}
      </button>
      <p className="interaction-status" role="status">
        {status} · {frames}
      </p>
      <ProblemGiftBox
        boxId={boxId}
        state={props.problemState(boxId)}
        locale={props.locale}
      />
    </div>
  );
}

export function PictureInPictureStage(props: StageComponentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cleanupRef = useRef<() => void>(() => undefined);
  const [status, setStatus] = useState<InteractionState>("idle");
  const boxId = "S-230-B01";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 180;
    const context = canvas.getContext("2d");
    let tick = 0;
    const draw = () => {
      if (!context) return;
      tick += 1;
      context.fillStyle = "#171329";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = tick % 2 === 0 ? "#a78bfa" : "#34d399";
      context.fillRect(30, 30, 260, 120);
      context.fillStyle = "#ffffff";
      context.font = "bold 28px sans-serif";
      context.fillText("BUSYBOX", 86, 104);
    };
    draw();
    const timer = window.setInterval(draw, 400);
    const stream = canvas.captureStream(4);
    video.srcObject = stream;
    void video.play();
    const entered = () => {
      setStatus("active");
      props.solve(boxId, ["picture-in-picture:entered"]);
    };
    video.addEventListener("enterpictureinpicture", entered);
    const cleanup = () => {
      window.clearInterval(timer);
      video.removeEventListener("enterpictureinpicture", entered);
      for (const track of stream.getTracks()) track.stop();
      if (document.pictureInPictureElement === video) {
        void document.exitPictureInPicture();
      }
      video.srcObject = null;
    };
    cleanupRef.current = cleanup;
    props.signal.addEventListener("abort", cleanup, { once: true });
    return cleanup;
  }, [props.signal, props.solve]);

  const open = async () => {
    try {
      const video = videoRef.current;
      if (!video) return;
      await video.requestPictureInPicture();
    } catch (error) {
      setStatus(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "cancelled"
          : "unavailable",
      );
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <video
        ref={videoRef}
        className="pip-preview"
        muted
        playsInline
        aria-label="Busybox picture-in-picture source"
      >
        <track
          kind="captions"
          src="data:text/vtt,WEBVTT"
          srcLang="en"
          label="No audio"
          default
        />
      </video>
      <button
        type="button"
        className="stage-action"
        onClick={() => void open()}
      >
        {props.locale === "ja" ? "窓を浮かべる" : "Float the window"}
      </button>
      <p className="interaction-status" role="status">
        {status}
      </p>
      <ProblemGiftBox
        boxId={boxId}
        state={props.problemState(boxId)}
        locale={props.locale}
      />
    </div>
  );
}

export function ShareMarkStage(props: StageComponentProps) {
  const mark = useMemo(() => crypto.randomUUID().slice(0, 6).toUpperCase(), []);
  const [status, setStatus] = useState<InteractionState>("idle");
  const boxId = "S-240-B01";

  const share = async () => {
    try {
      await navigator.share({
        title: "Busybox",
        text:
          props.locale === "ja"
            ? `箱の印: ${mark}`
            : `A mark from the box: ${mark}`,
      });
      // A resolved share promise means the user completed the browser/OS share
      // flow; merely opening and cancelling the sheet never opens the box.
      props.solve(boxId, ["web-share:completed"]);
      setStatus("active");
    } catch (error) {
      setStatus(
        error instanceof DOMException && error.name === "AbortError"
          ? "cancelled"
          : "unavailable",
      );
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <code className="clipboard-token">{mark}</code>
      <button
        type="button"
        className="stage-action"
        onClick={() => void share()}
      >
        {props.locale === "ja" ? "印を渡す" : "Share the mark"}
      </button>
      <p className="interaction-status" role="status">
        {status}
      </p>
      <ProblemGiftBox
        boxId={boxId}
        state={props.problemState(boxId)}
        locale={props.locale}
      />
    </div>
  );
}

export function WebLockStage(props: StageComponentProps) {
  const [status, setStatus] = useState("waiting");

  useEffect(() => {
    const channel = new BroadcastChannel("busybox-stage-S-250");
    let releaseHold: () => void = () => undefined;
    const hold = new Promise<void>((resolve) => {
      releaseHold = resolve;
    });
    const receive = (event: MessageEvent<unknown>) => {
      if (event.data === "blocked") {
        props.solve("S-250-B02", ["web-lock:peer-blocked"]);
      }
    };
    channel.addEventListener("message", receive);
    void navigator.locks
      .request("busybox-stage-S-250", { ifAvailable: true }, async (lock) => {
        if (!lock) {
          setStatus("blocked");
          channel.postMessage("blocked");
          return;
        }
        setStatus("holding");
        props.solve("S-250-B01", ["web-lock:holding"]);
        channel.postMessage("holding");
        await hold;
      })
      .catch(() => setStatus("unavailable"));
    const cleanup = () => {
      releaseHold();
      channel.removeEventListener("message", receive);
      channel.close();
    };
    props.signal.addEventListener("abort", cleanup, { once: true });
    return cleanup;
  }, [props.signal, props.solve]);

  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        <ProblemGiftBox
          boxId="S-250-B01"
          state={props.problemState("S-250-B01")}
          locale={props.locale}
        />
        <ProblemGiftBox
          boxId="S-250-B02"
          state={props.problemState("S-250-B02")}
          locale={props.locale}
        />
      </div>
      <button
        type="button"
        className="stage-action"
        onClick={() => window.open(window.location.href, "_blank", "noopener")}
      >
        {props.locale === "ja" ? "競争相手を開く" : "Open a contender"}
      </button>
      <p className="interaction-status" role="status">
        {status}
      </p>
    </div>
  );
}

interface LaunchParamsLike {
  targetURL?: string;
}

interface LaunchQueueLike {
  setConsumer(consumer: (params: LaunchParamsLike) => void): void;
}

export function LaunchHandlerStage(props: StageComponentProps) {
  const [status, setStatus] = useState("waiting");
  const targetUrl = useMemo(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("stage", "S-310");
    url.searchParams.set("launch", "busybox");
    return url.href;
  }, []);
  const boxId = "S-310-B01";

  useEffect(() => {
    let active = true;
    const queue = (
      window as unknown as Window & { launchQueue: LaunchQueueLike }
    ).launchQueue;
    queue.setConsumer((params) => {
      if (!active || !params.targetURL) return;
      const url = new URL(params.targetURL);
      if (
        url.searchParams.get("stage") === "S-310" &&
        url.searchParams.get("launch") === "busybox"
      ) {
        setStatus("launched");
        props.solve(boxId, ["launch-handler:target-url"]);
      }
    });
    return () => {
      active = false;
    };
  }, [props.solve]);

  return (
    <div className="puzzle puzzle--centered">
      <p className="measurement">
        {props.locale === "ja"
          ? "インストールしたBusyboxへ、このURLからもう一度入る。"
          : "Open this URL into the installed Busybox again."}
      </p>
      <a className="stage-action" href={targetUrl}>
        {props.locale === "ja" ? "起動用URL" : "Launch URL"}
      </a>
      <p className="launch-url">{targetUrl}</p>
      <p className="interaction-status" role="status">
        {status}
      </p>
      <ProblemGiftBox
        boxId={boxId}
        state={props.problemState(boxId)}
        locale={props.locale}
      />
    </div>
  );
}

export function WakeLockStage(props: StageComponentProps) {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const releasedOnce = useRef(false);
  const activeRef = useRef(true);
  const [status, setStatus] = useState("idle");

  const acquire = useCallback(
    async (returning: boolean) => {
      if (document.visibilityState !== "visible" || sentinelRef.current) return;
      try {
        const sentinel = await navigator.wakeLock.request("screen");
        if (!activeRef.current) {
          await sentinel.release();
          return;
        }
        sentinelRef.current = sentinel;
        setStatus(returning ? "reacquired" : "holding");
        props.solve(returning ? "S-330-B02" : "S-330-B01", [
          returning ? "wake-lock:reacquired" : "wake-lock:acquired",
        ]);
        sentinel.addEventListener(
          "release",
          () => {
            sentinelRef.current = null;
            if (!activeRef.current) return;
            releasedOnce.current = true;
            setStatus("released");
          },
          { once: true },
        );
      } catch {
        setStatus("unavailable");
      }
    },
    [props.solve],
  );

  useEffect(() => {
    activeRef.current = true;
    const visibility = () => {
      if (document.visibilityState === "visible" && releasedOnce.current) {
        void acquire(true);
      }
    };
    document.addEventListener("visibilitychange", visibility);
    const cleanup = () => {
      activeRef.current = false;
      document.removeEventListener("visibilitychange", visibility);
      if (sentinelRef.current) void sentinelRef.current.release();
      sentinelRef.current = null;
    };
    props.signal.addEventListener("abort", cleanup, { once: true });
    return cleanup;
  }, [acquire, props.signal]);

  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        <ProblemGiftBox
          boxId="S-330-B01"
          state={props.problemState("S-330-B01")}
          locale={props.locale}
        />
        <ProblemGiftBox
          boxId="S-330-B02"
          state={props.problemState("S-330-B02")}
          locale={props.locale}
        />
      </div>
      <div
        className="wake-light"
        data-active={status === "holding" || status === "reacquired"}
        aria-hidden="true"
      />
      <button
        type="button"
        className="stage-action"
        onClick={() => void acquire(false)}
      >
        {props.locale === "ja" ? "灯りを保つ" : "Keep the light awake"}
      </button>
      <p className="measurement">
        {props.locale === "ja"
          ? "取得後にタブを隠し、戻る。"
          : "After acquiring, hide the tab and return."}
      </p>
      <p className="interaction-status" role="status">
        {status}
      </p>
    </div>
  );
}
