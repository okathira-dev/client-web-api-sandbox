import {
  buildV8CacheLifoRawConstraintPlanForOffset,
  type RawObservationConstraintPlan,
} from "../domain/constraints";
import { advanceV8State, V8_CURRENT_MODEL } from "../domain/v8Current";
import type { SolverCandidate, SolverResult } from "./types";
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
 * 数値配列から重複を取り除き、出現順を保った配列を返す。
 */
const uniqueNumbers = (values: readonly number[]): number[] => [
  ...new Set(values),
];

/**
 * 次値候補が 1 種類だけなら、その値を単一予測として返す。
 */
const getSingleNextPrediction = (
  nextPredictions: readonly number[],
): number | undefined => {
  const predictions = uniqueNumbers(nextPredictions);
  return predictions.length === 1 ? predictions[0] : undefined;
};

/**
 * `maxCandidates` option を、列挙上限として扱いやすい数値へ変換する。
 */
const resolveCandidateLimit = (
  maxCandidates: V8CurrentSolverOptions["maxCandidates"],
): number => {
  if (maxCandidates === "all") {
    return Number.POSITIVE_INFINITY;
  }
  return maxCandidates ?? DEFAULT_MAX_CANDIDATES;
};

/**
 * solver 内部で集めた候補配列を、CLI/UI 共通の `SolverResult` へ整形する。
 */
const toSolverResult = (
  status: V8CurrentSolverResult["status"],
  candidates: readonly V8CurrentSolverCandidate[],
  maxCandidates: number,
  exhaustive: boolean,
  reason?: string,
): V8CurrentSolverResult => {
  const unique = status === "unique";
  const nextPredictions = uniqueNumbers(
    candidates
      .map((candidate) => candidate.nextPrediction)
      .filter((value): value is number => value !== undefined),
  );
  return {
    status,
    unique,
    uniqueConfirmed: status !== "unknown" && status !== "timeout",
    candidateCount: candidates.length,
    candidatesPreview: candidates.slice(0, maxCandidates),
    candidates,
    nextPrediction:
      status === "unknown" ||
      status === "timeout" ||
      (status === "multiple" && !exhaustive)
        ? undefined
        : getSingleNextPrediction(nextPredictions),
    nextPredictions,
    reason,
  };
};

/**
 * cache offset option から、solver が試す制約計画の集合を作る。
 *
 * offset 不明時は cache 先頭 offset と、観測列が境界をまたぎ得る offset を代表として試す。
 */
const buildPlans = (
  observations: readonly number[],
  cacheOffset: number | "unknown",
): RawObservationConstraintPlan[] => {
  if (cacheOffset === "unknown") {
    const firstBoundaryOffset = Math.max(
      0,
      V8_CURRENT_MODEL.cacheSize - observations.length,
    );
    const boundaryOffsets = Array.from(
      { length: V8_CURRENT_MODEL.cacheSize - firstBoundaryOffset },
      (_, index) => firstBoundaryOffset + index,
    ).sort((left, right) => {
      const pivot = V8_CURRENT_MODEL.cacheSize - 4;
      return Math.abs(left - pivot) - Math.abs(right - pivot);
    });
    const offsets = new Set([0, ...boundaryOffsets]);
    return [...offsets].map((offset) =>
      buildV8CacheLifoRawConstraintPlanForOffset(observations, offset),
    );
  }
  return [
    buildV8CacheLifoRawConstraintPlanForOffset(observations, cacheOffset),
  ];
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
  const maxCandidates = resolveCandidateLimit(options.maxCandidates);
  const cacheOffset = options.cacheOffset ?? DEFAULT_CACHE_OFFSET;
  const plans = buildPlans(observations, cacheOffset);

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
