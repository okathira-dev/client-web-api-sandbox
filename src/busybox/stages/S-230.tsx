import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stopMediaStream } from "./shared/media";

type InteractionState = "idle" | "active" | "cancelled" | "unavailable";

/**
 * S-230
 *
 * Gimmick: Lift an animated Busybox canvas into a native floating video window.
 * Uses: Canvas captureStream and the Picture-in-Picture API.
 * Success: Receive enterpictureinpicture for the generated video source.
 * Privacy/Permission: No external media or permission prompt; only generated pixels are used.
 * Cleanup: Stop drawing and media tracks, remove listeners, and close PiP on exit.
 * Human verification: H-012, H-023, H-025
 */
export default function S230Stage(props: StageComponentProps) {
  const problem = props.problem("S-230-B01");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<InteractionState>("idle");

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
      problem.solve(["picture-in-picture:entered"]);
    };
    video.addEventListener("enterpictureinpicture", entered);
    const cleanup = () => {
      window.clearInterval(timer);
      video.removeEventListener("enterpictureinpicture", entered);
      stopMediaStream(stream);
      if (document.pictureInPictureElement === video) {
        void document.exitPictureInPicture();
      }
      video.srcObject = null;
    };
    props.signal.addEventListener("abort", cleanup, { once: true });
    return () => {
      props.signal.removeEventListener("abort", cleanup);
      cleanup();
    };
  }, [problem.solve, props.signal]);

  const open = async () => {
    try {
      const video = videoRef.current;
      if (!video) return;
      await video.requestPictureInPicture();
      if (props.signal.aborted && document.pictureInPictureElement === video) {
        await document.exitPictureInPicture();
      }
    } catch (error) {
      if (props.signal.aborted) return;
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
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
