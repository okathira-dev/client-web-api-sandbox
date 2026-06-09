import type { SolverCandidate, SolverResult } from "./types";
import { solveV8CurrentConvertedObservationsOptimized } from "./v8CurrentConvertedOptimizedSolver";
import {
  solveV8CurrentConvertedObservationsWithBitVecZ3,
  type V8CurrentConvertedSolverOptions as V8CurrentConvertedZ3SolverOptions,
} from "./v8CurrentConvertedZ3Solver";

export type V8CurrentConvertedSolverCandidate = SolverCandidate;
export type V8CurrentConvertedSolverResult = SolverResult;

export type V8CurrentConvertedSolverOptions =
  V8CurrentConvertedZ3SolverOptions & {
    /** 実行 strategy。既定は GF(2)+TS の `optimized`。 */
    readonly strategy?: "optimized" | "bitvec";
    /** optimized strategy で全列挙する自由変数 bit の上限。 */
    readonly maxExhaustiveFreeBits?: number;
    /** 自由変数が多い場合に Z3 fallback するか（Phase 2 用、現状は未使用）。 */
    readonly z3Fallback?: boolean;
  };

/** 最大 2 モデルまで探索して一意性を判定した結果。 */
export type V8CurrentConvertedUniquenessProbeResult = {
  readonly status: SolverResult["status"];
  /** 2 個目の候補が存在しないことまで確認できたときのみ true。 */
  readonly uniquenessConfirmed: boolean;
  readonly candidateCount: number;
  readonly candidates: readonly V8CurrentConvertedSolverCandidate[];
  readonly nextPrediction?: number;
  readonly reason?: string;
};

const UNIQUENESS_PROBE_MAX_MODELS = 2;
const DEFAULT_STRATEGY = "optimized";

const shouldFallbackToZ3 = (
  result: SolverResult,
  z3Fallback: boolean | undefined,
): boolean => {
  if (z3Fallback === false || result.status !== "unknown") {
    return false;
  }
  const reason = result.reason ?? "";
  return (
    reason.includes("自由変数") ||
    reason.includes("全列挙") ||
    reason.includes("列挙上限")
  );
};

/**
 * 変換系列観測を strategy に応じて推論する。
 */
export const solveV8CurrentConvertedObservations = async (
  observations: readonly number[],
  n: number,
  options: V8CurrentConvertedSolverOptions = {},
): Promise<V8CurrentConvertedSolverResult> => {
  const strategy = options.strategy ?? DEFAULT_STRATEGY;
  if (strategy === "bitvec") {
    return solveV8CurrentConvertedObservationsWithBitVecZ3(
      observations,
      n,
      options,
    );
  }
  const optimized = solveV8CurrentConvertedObservationsOptimized(
    observations,
    n,
    options,
  );
  if (shouldFallbackToZ3(optimized, options.z3Fallback ?? true)) {
    return solveV8CurrentConvertedObservationsWithBitVecZ3(
      observations,
      n,
      options,
    );
  }
  return optimized;
};

/**
 * 全列挙せず、最大 2 候補まで探索して一意性を判定する。
 */
export const probeV8CurrentConvertedUniqueness = async (
  observations: readonly number[],
  n: number,
  options: Omit<
    V8CurrentConvertedSolverOptions,
    "maxCandidates" | "maxZ3Candidates"
  > = {},
): Promise<V8CurrentConvertedUniquenessProbeResult> => {
  const result = await solveV8CurrentConvertedObservations(observations, n, {
    ...options,
    maxCandidates: UNIQUENESS_PROBE_MAX_MODELS,
    maxZ3Candidates: UNIQUENESS_PROBE_MAX_MODELS,
  });
  const uniquenessConfirmed =
    result.status === "unique" &&
    result.candidateCount === 1 &&
    result.uniqueConfirmed;
  return {
    status: result.status,
    uniquenessConfirmed,
    candidateCount: result.candidateCount,
    candidates: result.candidates,
    nextPrediction: result.nextPrediction,
    reason: result.reason,
  };
};

export { candidateSatisfiesConvertedPlan } from "./v8CurrentConvertedIntervalCheck";
// re-export for tests comparing strategies
export { solveV8CurrentConvertedObservationsOptimized } from "./v8CurrentConvertedOptimizedSolver";
export { solveV8CurrentConvertedObservationsWithBitVecZ3 } from "./v8CurrentConvertedZ3Solver";
