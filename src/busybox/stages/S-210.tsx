import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

type PeripheralStatus = "idle" | "active" | "unavailable";

interface BadgeNavigator extends Navigator {
  setAppBadge(contents?: number): Promise<void>;
  clearAppBadge(): Promise<void>;
}

/**
 * S-210
 *
 * Gimmick: Advance the app's OS-level badge through one, two, and three.
 * Uses: Badging API.
 * Success: Three sequential setAppBadge calls complete in this attempt.
 * Privacy/Permission: No permission or retained badge value.
 * Cleanup: Clear the app badge on abort or unmount.
 * Human verification: H-005, H-020, H-023
 */
export default function S210Stage(props: StageComponentProps) {
  const problem = props.problem("S-210-B01");
  const [level, setLevel] = useState(0);
  const [status, setStatus] = useState<PeripheralStatus>("idle");
  const levelRef = useRef(0);

  useEffect(() => {
    const cleanup = () => {
      const badge = navigator as unknown as Partial<BadgeNavigator>;
      void badge.clearAppBadge?.().catch(() => undefined);
    };
    props.signal.addEventListener("abort", cleanup, { once: true });
    return () => {
      props.signal.removeEventListener("abort", cleanup);
      cleanup();
    };
  }, [props.signal]);

  const advance = async () => {
    const badge = navigator as unknown as BadgeNavigator;
    const next = Math.min(3, levelRef.current + 1);
    try {
      await badge.setAppBadge(next);
      levelRef.current = next;
      setLevel(next);
      setStatus("active");
      if (next === 3) problem.solve(["badge:one-two-three"]);
    } catch {
      setStatus("unavailable");
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="badge-preview" aria-hidden="true">
        B<span>{level || "·"}</span>
      </div>
      <button
        type="button"
        className="stage-action"
        onClick={() => void advance()}
      >
        {props.locale === "ja"
          ? "外側の数字を進める"
          : "Advance the outer number"}
      </button>
      <p className="interaction-status" role="status">
        {status}
      </p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
