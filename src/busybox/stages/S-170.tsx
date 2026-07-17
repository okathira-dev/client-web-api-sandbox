import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/**
 * S-170
 *
 * Gimmick: Pause a browser-owned animation near its temporal midpoint.
 * Uses: Web Animations API and computed timing progress.
 * Success: Pause while the iteration progress is within 0.1 of 0.5.
 * Privacy/Permission: No permission or retained timing samples.
 * Cleanup: Cancel the Animation object on unmount.
 * Human verification: H-001, H-020
 */
export default function S170Stage(props: StageComponentProps) {
  const problem = props.problem("S-170-B01");
  const markerRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    const animation = marker.animate(
      [{ transform: "translateX(0)" }, { transform: "translateX(16rem)" }],
      {
        duration: 2400,
        iterations: Number.POSITIVE_INFINITY,
        direction: "alternate",
      },
    );
    animationRef.current = animation;
    return () => animation.cancel();
  }, []);

  const toggle = () => {
    const animation = animationRef.current;
    if (!animation) return;
    if (animation.playState === "paused") {
      animation.play();
      setProgress(null);
      return;
    }
    animation.pause();
    const value = animation.effect?.getComputedTiming().progress;
    const nextProgress = typeof value === "number" ? value : 0;
    setProgress(nextProgress);
    if (Math.abs(nextProgress - 0.5) <= 0.1) {
      problem.solve(["animation:paused-midpoint"]);
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="timeline-clue" aria-hidden="true">
        <span ref={markerRef} />
      </div>
      <p className="measurement" aria-live="polite">
        {progress === null ? "…" : `${Math.round(progress * 100)}%`}
      </p>
      <button type="button" className="stage-action" onClick={toggle}>
        {props.locale === "ja" ? "止める / 動かす" : "Pause / play"}
      </button>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
