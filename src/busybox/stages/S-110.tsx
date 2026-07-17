import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stopMediaStream } from "./shared/media";

type InteractionState = "idle" | "active" | "denied" | "unavailable";

/**
 * S-110
 *
 * Gimmick: Cover the camera, then reveal a bright scene without showing an image.
 * Uses: getUserMedia, an off-DOM video, and coarse canvas luminance sampling.
 * Success: Observe luminance below 55 followed by luminance above 165.
 * Privacy/Permission: Request camera access only from the action; retain no pixels or frames.
 * Cleanup: Stop sampling, every media track, and the video source on retry or exit.
 * Human verification: H-006, H-007, H-019, H-025
 */
export default function S110Stage(props: StageComponentProps) {
  const problem = props.problem("S-110-B01");
  const [status, setStatus] = useState<InteractionState>("idle");
  const [brightness, setBrightness] = useState(0);
  const cleanupRef = useRef<() => void>(() => undefined);

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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 320 },
          height: { ideal: 240 },
        },
        audio: false,
      });
      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.srcObject = stream;
      let timer: number | undefined;
      cleanupRef.current = () => {
        if (timer !== undefined) window.clearInterval(timer);
        stopMediaStream(stream);
        video.srcObject = null;
      };
      if (props.signal.aborted) {
        cleanupRef.current();
        return;
      }
      await video.play();
      if (props.signal.aborted) {
        cleanupRef.current();
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 24;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      let darkSeen = false;
      timer = window.setInterval(() => {
        if (!context || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA)
          return;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const pixels = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
        ).data;
        let total = 0;
        for (let index = 0; index < pixels.length; index += 4) {
          total +=
            ((pixels[index] ?? 0) +
              (pixels[index + 1] ?? 0) +
              (pixels[index + 2] ?? 0)) /
            3;
        }
        const nextBrightness = total / (pixels.length / 4);
        setBrightness(nextBrightness);
        if (nextBrightness < 55) darkSeen = true;
        if (darkSeen && nextBrightness > 165) {
          problem.solve(["camera:dark-light"]);
        }
      }, 200);

      // Derived luminance exists only for this attempt; no pixel leaves memory.
      setStatus("active");
    } catch (error) {
      cleanupRef.current();
      if (props.signal.aborted) return;
      setStatus(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "denied"
          : "unavailable",
      );
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="light-meter" aria-hidden="true">
        <span
          style={{ width: `${Math.min(100, (brightness / 255) * 100)}%` }}
        />
      </div>
      <button
        type="button"
        className="stage-action"
        onClick={() => void start()}
      >
        {props.locale === "ja" ? "光だけを見る" : "See only light"}
      </button>
      <p className="interaction-status" role="status">
        {status}
      </p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
