import { useMemo, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

type InteractionState = "idle" | "active" | "cancelled" | "unavailable";

/**
 * S-240
 *
 * Gimmick: Hand an ephemeral mark to an OS share target.
 * Uses: Web Share API.
 * Success: navigator.share resolves after the user completes the share flow.
 * Privacy/Permission: Share only the displayed attempt mark from an explicit action.
 * Cleanup: The mark is discarded with the component; cancellation is not success.
 * Human verification: H-004, H-014, H-025
 */
export default function S240Stage(props: StageComponentProps) {
  const problem = props.problem("S-240-B01");
  const mark = useMemo(() => crypto.randomUUID().slice(0, 6).toUpperCase(), []);
  const [status, setStatus] = useState<InteractionState>("idle");

  const share = async () => {
    try {
      await navigator.share({
        title: "Busybox",
        text:
          props.locale === "ja"
            ? `箱の印: ${mark}`
            : `A mark from the box: ${mark}`,
      });
      // Only a resolved OS flow counts; opening and cancelling the sheet does not.
      problem.solve(["web-share:completed"]);
      setStatus("active");
    } catch (error) {
      setStatus(
        error instanceof DOMException && error.name === "AbortError"
          ? "cancelled"
          : "unavailable",
      );
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <code className="clipboard-token">{mark}</code>
      <button
        type="button"
        className="stage-action"
        onClick={() => void share()}
      >
        {props.locale === "ja" ? "印を渡す" : "Share the mark"}
      </button>
      <p className="interaction-status" role="status">
        {status}
      </p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
