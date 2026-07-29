/** 結果一覧の派生値と絞り込み。UI から切り離しておき、単体テストで担保する。 */

import type { UnitResult, VideoFamily } from "./types";

export type ResultStatus = "pass" | "warning" | "fail";

export const getResultStatus = (result: UnitResult): ResultStatus => {
  if (!result.usable) return "fail";
  return result.warning ? "warning" : "pass";
};

/**
 * 映像はハードウェア方針、音声はチャンネル数で 1 列にまとめる。
 * どちらも「同じ codec string でも結果が割れる軸」なので同じ列で扱える。
 */
export const getResultVariant = (result: UnitResult): string =>
  result.kind === "video"
    ? result.hardwareAcceleration
    : `${result.channels}ch`;

/** 失敗理由・警告理由を Sustained test の分も含めて 1 行にまとめる。 */
export const getResultDetails = (result: UnitResult): string =>
  [
    result.error,
    result.warning,
    result.sustained?.error,
    result.sustained?.warning,
  ]
    .filter((detail): detail is string => Boolean(detail))
    .join(" · ");

/** 基本検査と Sustained test のうち、フレーム予算に対して厳しいほうを代表値にする。 */
export const getPeakFrameTimePercent = (result: UnitResult): number =>
  Math.max(
    result.performance?.frameTimePercent ?? 0,
    result.sustained?.performance?.frameTimePercent ?? 0,
  );

export type BudgetFilter = "" | "sustained" | "over";
export type TimeFilter = "" | "quick" | "slow";

export type ResultFilters = {
  readonly family: VideoFamily | string;
  readonly codec: string;
  readonly variant: string;
  readonly status: ResultStatus | "";
  readonly details: string;
  readonly budget: BudgetFilter;
  readonly time: TimeFilter;
};

export const EMPTY_RESULT_FILTERS: ResultFilters = {
  family: "",
  codec: "",
  variant: "",
  status: "",
  details: "",
  budget: "",
  time: "",
};

/** 「実行時間が長い」の境界。1 秒未満なら概ね即座に判定できた候補とみなす。 */
const SLOW_RESULT_THRESHOLD_MS = 1000;

export const matchesFilters = (
  result: UnitResult,
  filters: ResultFilters,
): boolean => {
  if (filters.family && result.family !== filters.family) return false;

  const codecFilter = filters.codec.trim().toLowerCase();
  if (codecFilter && !result.codec.toLowerCase().includes(codecFilter)) {
    return false;
  }

  if (filters.variant && getResultVariant(result) !== filters.variant) {
    return false;
  }

  if (filters.status && getResultStatus(result) !== filters.status) {
    return false;
  }

  const detailsFilter = filters.details.trim().toLowerCase();
  if (
    detailsFilter &&
    !getResultDetails(result).toLowerCase().includes(detailsFilter)
  ) {
    return false;
  }

  if (filters.budget === "sustained" && !result.sustained) return false;
  if (filters.budget === "over" && getPeakFrameTimePercent(result) <= 100) {
    return false;
  }

  if (
    filters.time === "quick" &&
    result.elapsedMs >= SLOW_RESULT_THRESHOLD_MS
  ) {
    return false;
  }
  if (filters.time === "slow" && result.elapsedMs < SLOW_RESULT_THRESHOLD_MS) {
    return false;
  }

  return true;
};

export const filterResults = (
  results: readonly UnitResult[],
  filters: ResultFilters,
): UnitResult[] => results.filter((result) => matchesFilters(result, filters));

export const isFiltersEmpty = (filters: ResultFilters): boolean =>
  filters.family === "" &&
  filters.codec.trim() === "" &&
  filters.variant === "" &&
  filters.status === "" &&
  filters.details.trim() === "" &&
  filters.budget === "" &&
  filters.time === "";
