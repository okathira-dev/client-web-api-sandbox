import { useEffect } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/**
 * S-030
 *
 * Gimmick: A DOM Selection, rather than a form value, carries the answer.
 * Uses: Selection API and selectionchange.
 * Success: Select the localized word rendered between brackets.
 * Privacy/Permission: No permission; selected text is not retained.
 * Cleanup: Remove selectionchange listeners on unmount or stage abort.
 * Human verification: H-001, H-003, H-020
 */
export default function S030Stage(props: StageComponentProps) {
  const answer = props.locale === "ja" ? "あいだ" : "between";
  const problem = props.problem("S-030-B01");

  useEffect(() => {
    const observeSelection = () => {
      if (document.getSelection()?.toString().trim().toLowerCase() === answer) {
        problem.solve(["selection"]);
      }
    };
    document.addEventListener("selectionchange", observeSelection);
    props.signal.addEventListener(
      "abort",
      () => document.removeEventListener("selectionchange", observeSelection),
      { once: true },
    );
    return () =>
      document.removeEventListener("selectionchange", observeSelection);
  }, [answer, problem.solve, props.signal]);

  return (
    <div className="puzzle puzzle--centered selection-puzzle">
      <p>
        [ <strong>{answer}</strong> ]
      </p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
