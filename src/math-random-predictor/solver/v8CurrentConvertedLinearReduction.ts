import type { ConvertedObservationConstraintPlan } from "../domain/constraints";
import { extractFixedMantissaBitsFromInterval } from "../domain/convertedLinearization";
import {
  buildLinearRowsFromFixedMantissaBits,
  type StepFixedMantissaBits,
  solveV8LinearSystemFromRows,
  type V8RawLinearSolution,
} from "./v8CurrentLinearSolver";

/**
 * 変換系列 plan の各区間から確定 bit だけを GF(2) 線形方程式に落とし、解空間を求める。
 */
export const solveV8ConvertedObservationLinearSystem = (
  plan: ConvertedObservationConstraintPlan,
): V8RawLinearSolution => {
  const stepsByKey = new Map<string, StepFixedMantissaBits>();

  for (const constraint of plan.constraints) {
    const fixedBits = extractFixedMantissaBitsFromInterval(
      constraint.lowerInclusive,
      constraint.upperExclusive,
      plan.outputBits,
    );
    if (fixedBits.length === 0) {
      continue;
    }
    const key = `${constraint.relativeStep}`;
    const existing = stepsByKey.get(key);
    if (existing === undefined) {
      stepsByKey.set(key, {
        relativeStep: constraint.relativeStep,
        fixedBits,
      });
      continue;
    }
    const merged = new Map(existing.fixedBits.map((bit) => [bit.bit, bit]));
    for (const bit of fixedBits) {
      merged.set(bit.bit, bit);
    }
    stepsByKey.set(key, {
      relativeStep: constraint.relativeStep,
      fixedBits: [...merged.values()].sort(
        (left, right) => left.bit - right.bit,
      ),
    });
  }

  const rows = buildLinearRowsFromFixedMantissaBits(plan, [
    ...stepsByKey.values(),
  ]);
  return solveV8LinearSystemFromRows(rows);
};
