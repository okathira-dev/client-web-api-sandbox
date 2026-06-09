import type { SolverCandidate, SolverResult, SolverStatus } from "./types";

/**
 * 数値配列から重複を取り除き、出現順を保った配列を返す。
 */
export const uniqueNumbers = (values: readonly number[]): number[] => [
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
export const resolveCandidateLimit = (
  maxCandidates: number | "all" | undefined,
  defaultLimit: number,
): number => {
  if (maxCandidates === "all") {
    return Number.POSITIVE_INFINITY;
  }
  return maxCandidates ?? defaultLimit;
};

/**
 * solver 内部で集めた候補配列を、CLI/UI 共通の `SolverResult` へ整形する。
 */
export const toSolverResult = (
  status: SolverStatus,
  candidates: readonly SolverCandidate[],
  maxCandidates: number,
  exhaustive: boolean,
  reason?: string,
): SolverResult => {
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
