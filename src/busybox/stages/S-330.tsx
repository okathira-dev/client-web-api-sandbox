import { useCallback, useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/**
 * S-330
 *
 * Gimmick: Acquire a screen wake lock, hide the page, then reacquire after returning.
 * Uses: Screen Wake Lock and Page Visibility APIs.
 * Success: Acquire once, then reacquire after a visibility-triggered release.
 * Privacy/Permission: Request wake lock only from the action; retain no device data.
 * Cleanup: Remove visibility listeners and release any held sentinel on abort or unmount.
 * Human verification: H-005, H-022, H-023, H-025
 */
export default function S330Stage(props: StageComponentProps) {
  const acquireProblem = props.problem("S-330-B01");
  const returnProblem = props.problem("S-330-B02");
  const solveAcquire = acquireProblem.solve;
  const solveReturn = returnProblem.solve;
  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const releasedOnce = useRef(false);
  const activeRef = useRef(true);
  const [status, setStatus] = useState("idle");

  const acquire = useCallback(
    async (returning: boolean) => {
      if (document.visibilityState !== "visible" || sentinelRef.current) return;
      try {
        const sentinel = await navigator.wakeLock.request("screen");
        if (!activeRef.current) {
          await sentinel.release();
          return;
        }
        sentinelRef.current = sentinel;
        setStatus(returning ? "reacquired" : "holding");
        (returning ? solveReturn : solveAcquire)([
          returning ? "wake-lock:reacquired" : "wake-lock:acquired",
        ]);
        sentinel.addEventListener(
          "release",
          () => {
            sentinelRef.current = null;
            if (!activeRef.current) return;
            releasedOnce.current = true;
            setStatus("released");
          },
          { once: true },
        );
      } catch {
        setStatus("unavailable");
      }
    },
    [solveAcquire, solveReturn],
  );

  useEffect(() => {
    activeRef.current = true;
    const visibility = () => {
      if (document.visibilityState === "visible" && releasedOnce.current) {
        void acquire(true);
      }
    };
    document.addEventListener("visibilitychange", visibility);
    const cleanup = () => {
      activeRef.current = false;
      document.removeEventListener("visibilitychange", visibility);
      if (sentinelRef.current) void sentinelRef.current.release();
      sentinelRef.current = null;
    };
    props.signal.addEventListener("abort", cleanup, { once: true });
    return () => {
      props.signal.removeEventListener("abort", cleanup);
      cleanup();
    };
  }, [acquire, props.signal]);

  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        <ProblemGiftBox problem={acquireProblem} locale={props.locale} />
        <ProblemGiftBox problem={returnProblem} locale={props.locale} />
      </div>
      <div
        className="wake-light"
        data-active={status === "holding" || status === "reacquired"}
        aria-hidden="true"
      />
      <button
        type="button"
        className="stage-action"
        onClick={() => void acquire(false)}
      >
        {props.locale === "ja" ? "灯りを保つ" : "Keep the light awake"}
      </button>
      <p className="measurement">
        {props.locale === "ja"
          ? "取得後にタブを隠し、戻る。"
          : "After acquiring, hide the tab and return."}
      </p>
      <p className="interaction-status" role="status">
        {status}
      </p>
    </div>
  );
}
