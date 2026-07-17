import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stopMediaStream } from "./shared/media";

type InteractionState = "idle" | "active" | "cancelled" | "unavailable";

/**
 * S-190
 *
 * Gimmick: Select the current browser tab and observe its recursive live preview.
 * Uses: getDisplayMedia, browser-surface settings, and an in-page video element.
 * Success: Sample 12 playable frames from a captured browser display surface.
 * Privacy/Permission: The browser picker controls selection; no frame is persisted or sent.
 * Cleanup: Stop the timer, capture tracks, and video source on retry, end, abort, or unmount.
 * Human verification: H-006, H-007, H-012, H-019, H-025
 */
export default function S190Stage(props: StageComponentProps) {
  const problem = props.problem("S-190-B01");
  const videoRef = useRef<HTMLVideoElement>(null);
  const cleanupRef = useRef<() => void>(() => undefined);
  const [status, setStatus] = useState<InteractionState>("idle");
  const [frames, setFrames] = useState(0);

  useEffect(() => {
    const cleanup = () => cleanupRef.current();
    props.signal.addEventListener("abort", cleanup, { once: true });
    return () => {
      props.signal.removeEventListener("abort", cleanup);
      cleanup();
    };
  }, [props.signal]);

  const start = async () => {
    cleanupRef.current();
    try {
      // These fields are progressive hints; the browser's picker remains the
      // only authority deciding which display surface is shared.
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
        preferCurrentTab: true,
        selfBrowserSurface: "include",
      } as DisplayMediaStreamOptions);
      const video = videoRef.current;
      if (!video) {
        stopMediaStream(stream);
        return;
      }
      video.srcObject = stream;
      let timer: number | undefined;
      const cleanup = () => {
        if (timer !== undefined) window.clearInterval(timer);
        stopMediaStream(stream);
        video.srcObject = null;
      };
      cleanupRef.current = cleanup;
      if (props.signal.aborted) {
        cleanup();
        return;
      }
      await video.play();
      if (props.signal.aborted) {
        cleanup();
        return;
      }
      const track = stream.getVideoTracks()[0];
      let observedFrames = 0;
      timer = window.setInterval(() => {
        if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
        observedFrames += 1;
        setFrames(observedFrames);
        if (
          observedFrames >= 12 &&
          track?.getSettings().displaySurface === "browser"
        ) {
          problem.solve(["display-capture:browser-surface"]);
        }
      }, 120);
      track?.addEventListener("ended", cleanup, { once: true });
      setStatus("active");
    } catch (error) {
      cleanupRef.current();
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
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
