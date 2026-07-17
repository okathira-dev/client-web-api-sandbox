import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/**
 * S-040
 *
 * Gimmick: Page Visibility makes time spent unobserved the input.
 * Uses: Page Visibility API and visibilitychange.
 * Success: Return after the document remained hidden for at least two seconds.
 * Privacy/Permission: No permission; only the threshold fact is retained.
 * Cleanup: Remove visibilitychange listeners on unmount or stage abort.
 * Human verification: H-013, H-022
 */
export default function S040Stage(props: StageComponentProps) {
  const hiddenAt = useRef<number | null>(null);
  const [hiddenSeconds, setHiddenSeconds] = useState(0);
  const problem = props.problem("S-040-B01");

  useEffect(() => {
    const observeVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt.current = Date.now();
        return;
      }
      if (hiddenAt.current !== null) {
        const duration = Date.now() - hiddenAt.current;
        setHiddenSeconds(Math.floor(duration / 1000));
        if (duration >= 2000) problem.solve(["hidden:2s"]);
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
  }, [problem.solve, props.signal]);

  return (
    <div className="puzzle puzzle--centered">
      <div className="eye-clue" aria-hidden="true">
        ◉
      </div>
      <p className="measurement" aria-live="polite">
        {hiddenSeconds || "…"}
      </p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
