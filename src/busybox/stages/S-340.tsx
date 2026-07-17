import { useState } from "react";
import { flushSync } from "react-dom";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/**
 * S-340
 *
 * Gimmick: Reorder three shapes across browser-managed view transitions.
 * Uses: View Transition API and synchronous React commit inside its callback.
 * Success: Finish three transitions during the current attempt.
 * Privacy/Permission: No permission or retained transition state.
 * Cleanup: Await each transition; the browser owns transition pseudo-elements.
 * Human verification: H-001, H-020, H-030
 */
export default function S340Stage(props: StageComponentProps) {
  const problem = props.problem("S-340-B01");
  const [step, setStep] = useState(0);
  const tokens = ["◆", "●", "▲"];

  const move = async () => {
    const next = step + 1;
    const transition = document.startViewTransition(() => {
      flushSync(() => setStep(next));
    });
    await transition.finished;
    if (next >= 3) problem.solve(["view-transition:three-moves"]);
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="transition-tiles" data-step={step % 3} aria-hidden="true">
        {tokens.map((token, index) => (
          <span key={token} style={{ order: (index + step) % 3 }}>
            {token}
          </span>
        ))}
      </div>
      <button
        type="button"
        className="stage-action"
        onClick={() => void move()}
      >
        {props.locale === "ja" ? "形をつなぐ" : "Connect the shapes"}
      </button>
      <p className="measurement">{Math.min(step, 3)} / 3</p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
