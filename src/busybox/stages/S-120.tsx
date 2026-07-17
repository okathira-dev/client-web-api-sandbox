import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stopMediaStream } from "./shared/media";

type InteractionState = "idle" | "active" | "denied" | "unavailable";

/**
 * S-120
 *
 * Gimmick: Draw only the loudness shape of a quiet-loud-quiet sound sequence.
 * Uses: getUserMedia, Web Audio AnalyserNode, and requestAnimationFrame.
 * Success: Observe RMS below 0.05, above 0.2, then below 0.06.
 * Privacy/Permission: Request microphone access only from the action; retain no audio samples.
 * Cleanup: Cancel sampling, disconnect audio, stop tracks, and close AudioContext on exit.
 * Human verification: H-006, H-007, H-019, H-025
 */
export default function S120Stage(props: StageComponentProps) {
  const problem = props.problem("S-120-B01");
  const [status, setStatus] = useState<InteractionState>("idle");
  const [level, setLevel] = useState(0);
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
        audio: true,
        video: false,
      });
      const context = new AudioContext();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const samples = new Uint8Array(analyser.fftSize);
      let phase = 0;
      let animationFrame = 0;
      let lastPaint = 0;

      const sample = (time: number) => {
        analyser.getByteTimeDomainData(samples);
        let sum = 0;
        for (const value of samples) {
          const normalized = (value - 128) / 128;
          sum += normalized * normalized;
        }
        const rms = Math.sqrt(sum / samples.length);
        if (time - lastPaint > 100) {
          setLevel(rms);
          lastPaint = time;
        }
        if (phase === 0 && rms < 0.05) phase = 1;
        else if (phase === 1 && rms > 0.2) phase = 2;
        else if (phase === 2 && rms < 0.06) {
          problem.solve(["audio:quiet-loud-quiet"]);
        }
        animationFrame = requestAnimationFrame(sample);
      };
      animationFrame = requestAnimationFrame(sample);

      // Only the RMS scalar reaches React state; samples are never persisted or sent.
      cleanupRef.current = () => {
        cancelAnimationFrame(animationFrame);
        source.disconnect();
        stopMediaStream(stream);
        void context.close();
      };
      setStatus("active");
    } catch (error) {
      setStatus(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "denied"
          : "unavailable",
      );
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <div
        className="sound-ring"
        style={{ transform: `scale(${1 + Math.min(1, level * 3)})` }}
        aria-hidden="true"
      />
      <button
        type="button"
        className="stage-action"
        onClick={() => void start()}
      >
        {props.locale === "ja" ? "音の形を見る" : "See the sound"}
      </button>
      <p className="interaction-status" role="status">
        {status}
      </p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
