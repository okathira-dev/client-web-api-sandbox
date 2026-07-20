import { useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/**
 * S-180
 *
 * Gimmick: Copy a reversed name, repair it outside the page, then let the box inspect the clipboard.
 * Uses: Async Clipboard read/write.
 * Success: A click on the box-side check reads exactly `busybox` after this page wrote `xobysub`.
 * Privacy/Permission: Clipboard access is user-initiated; clipboard text is never persisted.
 * Cleanup: The entry-scoped armed flag disappears on exit.
 * Human verification: H-006, H-014, H-020, H-025
 */
export default function S180Stage(props: StageComponentProps) {
  const problem = props.problem("S-180-B01");
  const [armed, setArmed] = useState(false);
  const [status, setStatus] = useState("");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText("xobysub");
      if (props.signal.aborted) return;
      setArmed(true);
      setStatus(
        props.locale === "ja" ? "逆さの名前を渡した" : "Sent the reversed name",
      );
    } catch {
      if (!props.signal.aborted)
        setStatus(
          props.locale === "ja" ? "コピーできない" : "Copy unavailable",
        );
    }
  };

  const inspect = async () => {
    try {
      const value = await navigator.clipboard.readText();
      if (props.signal.aborted) return;
      if (armed && value === "busybox") {
        problem.solve(["clipboard:reversed-repaired"]);
        setStatus(
          props.locale === "ja" ? "正しい向きで戻った" : "It returned upright",
        );
      }
    } catch {
      if (!props.signal.aborted)
        setStatus(
          props.locale === "ja" ? "読み取れない" : "Clipboard unreadable",
        );
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <ProblemGiftBox problem={problem} locale={props.locale} />
      <button
        type="button"
        className="stage-action"
        onClick={() => void copy()}
      >
        {props.locale === "ja"
          ? "逆さの名前をコピー"
          : "Copy the reversed name"}
      </button>
      <button
        type="button"
        className="stage-action"
        onClick={() => void inspect()}
      >
        {props.locale === "ja" ? "箱を調べる" : "Inspect the box"}
      </button>
      <p className="interaction-status" role="status">
        {status}
      </p>
    </div>
  );
}
