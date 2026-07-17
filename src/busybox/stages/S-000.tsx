import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/**
 * S-000
 *
 * Gimmick: Activate the shared gift box directly.
 * Uses: Trusted click activation.
 * Success: A trusted click opens S-000-B01 for the current attempt.
 * Privacy/Permission: No permission or retained input data.
 * Cleanup: No external resource.
 * Human verification: H-001, H-002, H-003, H-020
 */
export default function S000Stage(props: StageComponentProps) {
  const problem = props.problem("S-000-B01");
  return (
    <div className="puzzle puzzle--centered">
      <ProblemGiftBox
        problem={problem}
        locale={props.locale}
        onClick={() => problem.solve(["activation"])}
      />
    </div>
  );
}
