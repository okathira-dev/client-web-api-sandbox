import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/** S-430 — only the registered Media Session pause action opens the box. H-004/H-019/H-023. */
export default function S430Stage(props: StageComponentProps) {
  const problem = props.problem("S-430-B01");
  const context = useRef<AudioContext | null>(null);
  const oscillator = useRef<OscillatorNode | null>(null);
  const [status, setStatus] = useState("idle");
  const start = async () => {
    try {
      oscillator.current?.stop();
    } catch {}
    await context.current?.close();
    const audio = new AudioContext();
    const tone = audio.createOscillator();
    const gain = audio.createGain();
    gain.gain.value = 0.035;
    tone.connect(gain).connect(audio.destination);
    tone.start();
    context.current = audio;
    oscillator.current = tone;
    setStatus("playing");
    navigator.mediaSession.metadata = new MediaMetadata({
      title: "Busybox",
      artist: "Outside control",
    });
    navigator.mediaSession.playbackState = "playing";
    navigator.mediaSession.setActionHandler("pause", () => {
      tone.stop();
      void audio.close();
      navigator.mediaSession.playbackState = "paused";
      setStatus("paused outside");
      problem.solve(["media-session:pause-handler"]);
    });
  };
  useEffect(() => {
    const cleanup = () => {
      navigator.mediaSession.setActionHandler("pause", null);
      try {
        oscillator.current?.stop();
      } catch {}
      void context.current?.close();
    };
    props.signal.addEventListener("abort", cleanup, { once: true });
    return () => {
      props.signal.removeEventListener("abort", cleanup);
      cleanup();
    };
  }, [props.signal]);
  return (
    <div className="puzzle puzzle--centered">
      <ProblemGiftBox problem={problem} locale={props.locale} />
      <button
        type="button"
        className="stage-action"
        onClick={() => void start()}
      >
        {props.locale === "ja" ? "音を始める" : "Start sound"}
      </button>
      <p role="status">{status}</p>
    </div>
  );
}
