import { useEffect, useLayoutEffect, useRef } from "react";
import { hasRevisitFlag, setRevisitFlag } from "../infra/synchronousFlags";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/**
 * S-060
 *
 * Gimmick: A synchronous flag and persisted observation make a later visit input.
 * Uses: A local synchronous revisit flag and the progress observation API.
 * Success: Re-enter after the first visit has recorded its observation.
 * Privacy/Permission: No permission; only an entered/returned fact is retained.
 * Cleanup: No external resource.
 * Human verification: H-001, H-018, H-025
 */
export default function S060Stage(props: StageComponentProps) {
  const observationId = "S-060:entered";
  const problem = props.problem("S-060-B01");
  const seenBefore = useRef(
    props.observations[observationId] !== undefined || hasRevisitFlag(),
  );

  useLayoutEffect(() => {
    if (!seenBefore.current) {
      setRevisitFlag();
      props.observe(observationId, ["entered"]);
    }
  }, [props.observe]);

  useEffect(() => {
    // Returning is itself the replay action, but solve after the first paint so
    // the shared box visibly transitions from closed to open on every visit.
    if (seenBefore.current) problem.solve(["returned"]);
  }, [problem.solve]);

  return (
    <div className="puzzle puzzle--centered">
      <div className="return-clue" aria-hidden="true">
        ↪
      </div>
      <p>{props.locale === "ja" ? "また、ここで。" : "See you here again."}</p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
