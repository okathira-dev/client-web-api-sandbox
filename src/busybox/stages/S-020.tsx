import { useEffect, useMemo, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/**
 * S-020
 *
 * Gimmick: The browser viewport itself is the input.
 * Uses: innerWidth and the window resize event.
 * Success: Resize within 18px of a target 80px away from the entry width.
 * Privacy/Permission: No permission; only the success fact is retained.
 * Cleanup: Remove the resize listener on unmount or stage abort.
 * Human verification: H-001, H-002, H-003, H-025
 */
export default function S020Stage(props: StageComponentProps) {
  const initialWidth = useRef(window.innerWidth);
  const targetWidth = useMemo(
    () =>
      initialWidth.current <= 420
        ? initialWidth.current + 80
        : initialWidth.current - 80,
    [],
  );
  const [width, setWidth] = useState(window.innerWidth);
  const problem = props.problem("S-020-B01");

  useEffect(() => {
    const observe = () => {
      const nextWidth = window.innerWidth;
      setWidth(nextWidth);
      if (Math.abs(nextWidth - targetWidth) <= 18) {
        problem.solve(["viewport-resized"]);
      }
    };
    window.addEventListener("resize", observe);
    props.signal.addEventListener(
      "abort",
      () => window.removeEventListener("resize", observe),
      { once: true },
    );
    return () => window.removeEventListener("resize", observe);
  }, [problem.solve, props.signal, targetWidth]);

  return (
    <div className="puzzle puzzle--centered">
      <div className="resize-ruler" aria-hidden="true">
        <span
          className="resize-ruler__fill"
          style={{ width: `${Math.min(100, (width / targetWidth) * 100)}%` }}
        />
      </div>
      <p className="measurement" aria-live="polite">
        {width} → {targetWidth}
      </p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
