import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/**
 * S-040
 *
 * Gimmick: Page Visibility makes time spent unobserved the input.
 * Uses: Page Visibility API and visibilitychange.
 * Success: Return after the document remained hidden for two seconds and 25 minutes.
 * Privacy/Permission: No permission; only the threshold fact is retained.
 * Cleanup: Remove visibilitychange listeners on unmount or stage abort.
 * Human verification: H-013, H-022, H-025
 */
export default function S040Stage(props: StageComponentProps) {
  const hiddenAt = useRef<number | null>(null);
  const [hiddenSeconds, setHiddenSeconds] = useState(0);
  const problem = props.problem("S-040-B01");
  const longProblem = props.problem("S-040-B02");

  useEffect(() => {
    const observeVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt.current = performance.now();
        return;
      }
      if (hiddenAt.current !== null) {
        const duration = performance.now() - hiddenAt.current;
        setHiddenSeconds(Math.floor(duration / 1000));
        if (duration >= 2000) problem.solve(["hidden:2s"]);
        if (duration >= 25 * 60 * 1000) longProblem.solve(["hidden:25m"]);
        hiddenAt.current = null;
      }
    };
    document.addEventListener("visibilitychange", observeVisibility);
    props.signal.addEventListener(
      "abort",
      () => document.removeEventListener("visibilitychange", observeVisibility),
      { once: true },
    );
    return () =>
      document.removeEventListener("visibilitychange", observeVisibility);
  }, [longProblem.solve, problem.solve, props.signal]);

  return (
    <div className="puzzle puzzle--centered">
      <div className="eye-clue" aria-hidden="true">
        ◉
      </div>
      <p className="measurement" aria-live="polite">
        {hiddenSeconds || "…"}
      </p>
      <div className="problem-row">
        <ProblemGiftBox problem={problem} locale={props.locale} />
        <ProblemGiftBox problem={longProblem} locale={props.locale} />
      </div>
    </div>
  );
}
