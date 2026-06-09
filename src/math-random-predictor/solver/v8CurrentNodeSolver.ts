import {
  buildV8CacheLifoRawConstraintPlanForOffset,
  type RawObservationConstraintPlan,
} from "../domain/constraints";
import { advanceV8State } from "../domain/v8Current";
import { resolveCandidateLimit, toSolverResult } from "./solverResult";
import type { SolverCandidate, SolverResult } from "./types";
import { buildV8CacheOffsetPlans } from "./v8CacheOffsetPlans";
import {
  enumerateV8RawLinearSolutionVectors,
  solutionVectorToV8State,
  solveV8RawObservationLinearSystem,
} from "./v8CurrentLinearSolver";

export type V8CurrentSolverCandidate = SolverCandidate;
export type V8CurrentSolverResult = SolverResult;

export type V8CurrentSolverOptions = {
  /** 候補 preview の上限。`"all"` の場合は列挙可能な範囲で internal state 候補を全列挙する。 */
  readonly maxCandidates?: number | "all";
  /** SolverAdapter 互換の予約 option。現行 GF(2) raw solver では時間制限には使わない。 */
  readonly timeoutMs?: number;
  /** 観測開始位置の cache offset。未知の場合は代表 offset 候補を探索する。 */
  readonly cacheOffset?: number | "unknown";
};

const DEFAULT_MAX_CANDIDATES = 2;
const DEFAULT_CACHE_OFFSET = "unknown";
const MAX_EXHAUSTIVE_FREE_BITS = 20;

/**
 * 候補 state と制約計画から、次に観測される mantissa を計算する。
 */
const predictNextObservedMantissa = (
  candidate: V8CurrentSolverCandidate,
  plan: RawObservationConstraintPlan,
): bigint => {
  if (plan.nextUsesPreStateS0) {
    return candidate.preState.s0 >> BigInt(plan.rightShiftBits);
  }
  if (plan.nextRelativeStep !== undefined) {
    return (
      advanceV8State(candidate.preState, plan.nextRelativeStep).s0 >>
      BigInt(plan.rightShiftBits)
    );
  }
  throw new Error("次値予測に必要な相対 step を決定できません。");
};

/**
 * 候補 state と制約計画から、次に観測される `Math.random()` 値を計算する。
 */
const predictNextObservedValue = (
  candidate: V8CurrentSolverCandidate,
  plan: RawObservationConstraintPlan,
): number => {
  return Number(predictNextObservedMantissa(candidate, plan)) / 2 ** 53;
};

/**
 * 解空間の自由変数数から、今回列挙する候補数を決める。
 *
 * 全列挙モードで候補が多すぎる場合は `undefined` を返し、呼び出し側で `unknown` にする。
 */
const getEnumerableSolutionCount = (
  freeVariableCount: number,
  exhaustive: boolean,
  remainingCandidateSlots: number,
): number | undefined => {
  if (freeVariableCount > MAX_EXHAUSTIVE_FREE_BITS && exhaustive) {
    return undefined;
  }
  const solutionCount = 2 ** freeVariableCount;
  return exhaustive
    ? solutionCount
    : Math.min(solutionCount, remainingCandidateSlots);
};

/**
 * V8 current cache/LIFO モデルの raw observation から、内部 state 候補と次値候補を推論する。
 *
 * `cacheOffset` が未知の場合は代表 offset ごとの制約計画を試し、
 * `maxCandidates: "all"` では列挙可能な範囲で internal state 候補を全列挙する。
 */
export const solveV8CurrentRawObservations = async (
  observations: readonly number[],
  options: V8CurrentSolverOptions = {},
): Promise<V8CurrentSolverResult> => {
  const exhaustive = options.maxCandidates === "all";
  const maxCandidates = resolveCandidateLimit(
    options.maxCandidates,
    DEFAULT_MAX_CANDIDATES,
  );
  const cacheOffset = options.cacheOffset ?? DEFAULT_CACHE_OFFSET;
  const plans = buildV8CacheOffsetPlans(
    observations.length,
    cacheOffset,
    (offset) =>
      buildV8CacheLifoRawConstraintPlanForOffset(observations, offset),
  );

  const candidates: V8CurrentSolverCandidate[] = [];

  for (const plan of plans) {
    const solution = solveV8RawObservationLinearSystem(plan);
    if (!solution.consistent) {
      continue;
    }

    const solutionCount = getEnumerableSolutionCount(
      solution.basis.length,
      exhaustive,
      maxCandidates - candidates.length,
    );

    if (solutionCount === undefined) {
      return toSolverResult(
        "unknown",
        candidates,
        maxCandidates,
        exhaustive,
        "候補数が多すぎるため全列挙できません。",
      );
    }

    for (const vector of enumerateV8RawLinearSolutionVectors(
      solution,
      solutionCount,
    )) {
      const preState = solutionVectorToV8State(vector);
      const candidate: V8CurrentSolverCandidate = {
        cacheOffset: plan.cacheOffset,
        preState,
      };
      const candidateWithPrediction = {
        ...candidate,
        nextPrediction: predictNextObservedValue(candidate, plan),
      };
      candidates.push(candidateWithPrediction);

      if (!exhaustive && candidates.length >= maxCandidates) {
        return toSolverResult(
          "multiple",
          candidates,
          maxCandidates,
          exhaustive,
        );
      }
    }
  }

  if (candidates.length === 0) {
    return toSolverResult("unsat", candidates, maxCandidates, exhaustive);
  }
  if (candidates.length === 1) {
    return toSolverResult("unique", candidates, maxCandidates, exhaustive);
  }
  return toSolverResult("multiple", candidates, maxCandidates, exhaustive);
};
