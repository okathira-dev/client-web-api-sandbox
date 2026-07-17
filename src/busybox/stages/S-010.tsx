import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

const problemIds = {
  mouse: "S-010-B01",
  touch: "S-010-B02",
  pen: "S-010-B03",
} as const;

/**
 * S-010
 *
 * Gimmick: Pointer Events distinguish mouse, touch, and pen input.
 * Uses: Pointer Events and pointerType.
 * Success: Each pointerType opens only its matching problem box.
 * Privacy/Permission: No permission; pointer coordinates are not retained.
 * Cleanup: React removes the pointer handlers with the problem boxes.
 * Human verification: H-004, H-020, H-024
 */
export default function S010Stage(props: StageComponentProps) {
  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row" aria-live="polite">
        {Object.entries(problemIds).map(([pointerType, problemId]) => {
          const problem = props.problem(problemId);
          return (
            <ProblemGiftBox
              key={problemId}
              problem={problem}
              locale={props.locale}
              onPointerDown={(event) => {
                if (event.pointerType === pointerType) {
                  problem.solve([`pointer:${event.pointerType}`]);
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
