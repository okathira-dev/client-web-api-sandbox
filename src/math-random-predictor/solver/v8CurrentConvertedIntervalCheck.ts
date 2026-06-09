import type { ConvertedObservationConstraintPlan } from "../domain/constraints";
import { advanceV8State, floorRandom, type V8State } from "../domain/v8Current";
import type { SolverCandidate } from "./types";

/**
 * 候補 state が step 上の mantissa 区間制約をすべて満たすかを検証する。
 */
export const candidateSatisfiesConvertedPlan = (
  preState: V8State,
  plan: ConvertedObservationConstraintPlan,
): boolean => {
  for (const constraint of plan.constraints) {
    const state = advanceV8State(preState, constraint.relativeStep);
    const mantissa = state.s0 >> BigInt(plan.rightShiftBits);
    if (
      mantissa < constraint.lowerInclusive ||
      mantissa >= constraint.upperExclusive
    ) {
      return false;
    }
  }
  return true;
};

/**
 * 候補が変換系列 plan を満たす場合に、次の観測値 `floor(random * N)` を返す。
 */
export const predictNextConvertedValueForCandidate = (
  candidate: SolverCandidate,
  plan: ConvertedObservationConstraintPlan,
): number => {
  let mantissa: bigint;
  if (plan.nextUsesPreStateS0) {
    mantissa = candidate.preState.s0 >> BigInt(plan.rightShiftBits);
  } else if (plan.nextRelativeStep !== undefined) {
    mantissa =
      advanceV8State(candidate.preState, plan.nextRelativeStep).s0 >>
      BigInt(plan.rightShiftBits);
  } else {
    throw new Error("次値予測に必要な相対 step を決定できません。");
  }
  const raw = Number(mantissa) / 2 ** plan.outputBits;
  return floorRandom(raw, plan.n);
};

/**
 * 候補が plan を満たすかを検証し、満たす場合は次値付き候補を返す。
 */
export const toConvertedCandidateIfValid = (
  preState: V8State,
  plan: ConvertedObservationConstraintPlan,
): SolverCandidate | undefined => {
  if (!candidateSatisfiesConvertedPlan(preState, plan)) {
    return undefined;
  }
  const candidate: SolverCandidate = {
    cacheOffset: plan.cacheOffset,
    preState,
  };
  return {
    ...candidate,
    nextPrediction: predictNextConvertedValueForCandidate(candidate, plan),
  };
};
