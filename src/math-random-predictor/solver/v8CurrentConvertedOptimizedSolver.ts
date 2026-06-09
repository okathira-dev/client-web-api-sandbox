import {
  buildV8CacheLifoConvertedConstraintPlanForOffset,
  type ConvertedObservationConstraintPlan,
} from "../domain/constraints";
import { resolveCandidateLimit, toSolverResult } from "./solverResult";
import type { SolverCandidate, SolverResult } from "./types";
import { buildV8CacheOffsetPlans } from "./v8CacheOffsetPlans";
import { toConvertedCandidateIfValid } from "./v8CurrentConvertedIntervalCheck";
import { solveV8ConvertedObservationLinearSystem } from "./v8CurrentConvertedLinearReduction";
import {
  enumerateV8RawLinearSolutionVectors,
  solutionVectorToV8State,
} from "./v8CurrentLinearSolver";

export type V8CurrentConvertedOptimizedSolverOptions = {
  readonly maxCandidates?: number | "all";
  readonly cacheOffset?: number | "unknown";
  readonly maxExhaustiveFreeBits?: number;
};

export type V8CurrentConvertedOptimizedSolverResult = SolverResult;

const DEFAULT_MAX_CANDIDATES = 2;
const DEFAULT_CACHE_OFFSET = "unknown";
const DEFAULT_MAX_EXHAUSTIVE_FREE_BITS = 20;
const MAX_EXHAUSTIVE_CANDIDATE_BITS = 12;

const getEnumerableSolutionCount = (
  freeVariableCount: number,
  exhaustive: boolean,
  remainingCandidateSlots: number,
): number | undefined => {
  if (freeVariableCount > MAX_EXHAUSTIVE_CANDIDATE_BITS && exhaustive) {
    return undefined;
  }
  const solutionCount = 2 ** freeVariableCount;
  return exhaustive
    ? solutionCount
    : Math.min(solutionCount, remainingCandidateSlots);
};

const shouldSkipExhaustiveEnumeration = (
  plan: ConvertedObservationConstraintPlan,
): boolean => {
  if (plan.observationCount < 2) {
    return true;
  }
  const intervalBits = plan.constraints.reduce(
    (bits, constraint) =>
      bits +
      Math.ceil(
        Math.log2(
          Number(constraint.upperExclusive - constraint.lowerInclusive),
        ),
      ),
    0,
  );
  const estimatedFreeBits =
    plan.outputBits * plan.observationCount - intervalBits;
  return estimatedFreeBits > MAX_EXHAUSTIVE_CANDIDATE_BITS;
};

const enumerateCandidatesForPlan = (
  plan: ConvertedObservationConstraintPlan,
  options: {
    readonly exhaustive: boolean;
    readonly maxCandidates: number;
    readonly maxExhaustiveFreeBits: number;
    readonly remainingSlots: number;
  },
):
  | { readonly kind: "ok"; readonly candidates: SolverCandidate[] }
  | { readonly kind: "skip" }
  | { readonly kind: "unknown"; readonly reason: string } => {
  const solution = solveV8ConvertedObservationLinearSystem(plan);
  if (!solution.consistent) {
    return { kind: "skip" };
  }

  if (solution.basis.length > options.maxExhaustiveFreeBits) {
    return {
      kind: "unknown",
      reason: `GF(2) 簡約後の自由変数が ${solution.basis.length} 個あり、列挙上限 ${options.maxExhaustiveFreeBits} を超えました。`,
    };
  }

  const solutionCount = getEnumerableSolutionCount(
    solution.basis.length,
    options.exhaustive,
    options.remainingSlots,
  );
  if (solutionCount === undefined) {
    return {
      kind: "unknown",
      reason: "候補数が多すぎるため全列挙できません。",
    };
  }

  const candidates: SolverCandidate[] = [];
  for (const vector of enumerateV8RawLinearSolutionVectors(
    solution,
    solutionCount,
  )) {
    const preState = solutionVectorToV8State(vector);
    const candidate = toConvertedCandidateIfValid(preState, plan);
    if (candidate === undefined) {
      continue;
    }
    candidates.push(candidate);
    if (!options.exhaustive && candidates.length >= options.maxCandidates) {
      break;
    }
  }

  return { kind: "ok", candidates };
};

/**
 * GF(2) 簡約 + TS 区間検証で変換系列観測を推論する（本番 optimized strategy）。
 */
export const solveV8CurrentConvertedObservationsOptimized = (
  observations: readonly number[],
  n: number,
  options: V8CurrentConvertedOptimizedSolverOptions = {},
): V8CurrentConvertedOptimizedSolverResult => {
  const exhaustive = options.maxCandidates === "all";
  const maxCandidates = resolveCandidateLimit(
    options.maxCandidates,
    DEFAULT_MAX_CANDIDATES,
  );
  const maxExhaustiveFreeBits =
    options.maxExhaustiveFreeBits ?? DEFAULT_MAX_EXHAUSTIVE_FREE_BITS;
  const cacheOffset = options.cacheOffset ?? DEFAULT_CACHE_OFFSET;

  if (exhaustive && observations.length < 2) {
    return toSolverResult(
      "unknown",
      [],
      maxCandidates,
      exhaustive,
      "候補数が多すぎるため全列挙できません。",
    );
  }

  const plans = buildV8CacheOffsetPlans(
    observations.length,
    cacheOffset,
    (offset) =>
      buildV8CacheLifoConvertedConstraintPlanForOffset(observations, n, offset),
  );

  const candidates: SolverCandidate[] = [];

  for (const plan of plans) {
    if (exhaustive && shouldSkipExhaustiveEnumeration(plan)) {
      return toSolverResult(
        "unknown",
        candidates,
        maxCandidates,
        exhaustive,
        "候補数が多すぎるため全列挙できません。",
      );
    }

    const remainingSlots = exhaustive
      ? Number.POSITIVE_INFINITY
      : maxCandidates - candidates.length;
    if (remainingSlots <= 0 && !exhaustive) {
      return toSolverResult("multiple", candidates, maxCandidates, exhaustive);
    }

    const planResult = enumerateCandidatesForPlan(plan, {
      exhaustive,
      maxCandidates,
      maxExhaustiveFreeBits,
      remainingSlots: exhaustive ? maxExhaustiveFreeBits : remainingSlots,
    });

    if (planResult.kind === "skip") {
      continue;
    }
    if (planResult.kind === "unknown") {
      return toSolverResult(
        "unknown",
        candidates,
        maxCandidates,
        exhaustive,
        planResult.reason,
      );
    }

    for (const candidate of planResult.candidates) {
      candidates.push(candidate);
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
