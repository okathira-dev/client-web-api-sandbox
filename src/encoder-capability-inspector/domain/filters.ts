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

/** 基本検査のフレーム予算比。未計測は 0 として扱う。 */
export const getBasicFrameTimePercent = (result: UnitResult): number =>
  result.performance?.frameTimePercent ?? 0;

/** Sustained test のフレーム予算比。未実施・未計測は 0 として扱う。 */
export const getSustainedFrameTimePercent = (result: UnitResult): number =>
  result.sustained?.performance?.frameTimePercent ?? 0;

/** フレーム予算比のしきい値による絞り込み。100% を超えると要求 FPS に追いつけない。 */
export type BudgetFilter = "" | "over" | "under";
/** Sustained test 列の絞り込み。実施の有無とフレーム予算比を同じ列で扱う。 */
export type SustainedFilter = "" | "done" | "none" | "over" | "under";
export type TimeFilter = "" | "quick" | "slow";

export type ResultFilters = {
  readonly family: VideoFamily | string;
  readonly codec: string;
  readonly variant: string;
  readonly status: ResultStatus | "";
  readonly details: string;
  readonly budget: BudgetFilter;
  readonly sustained: SustainedFilter;
  readonly time: TimeFilter;
};

export const EMPTY_RESULT_FILTERS: ResultFilters = {
  family: "",
  codec: "",
  variant: "",
  status: "",
  details: "",
  budget: "",
  sustained: "",
  time: "",
};

/** 「実行時間が長い」の境界。1 秒未満なら概ね即座に判定できた候補とみなす。 */
const SLOW_RESULT_THRESHOLD_MS = 1000;

/**
 * 詳細列の照合に使う文字列を差し替えられるようにしておく。
 * UI では訳文も検索対象にしたいが、この層は表示言語を知らないでいたい。
 */
export type DetailsTextResolver = (result: UnitResult) => string;

export const matchesFilters = (
  result: UnitResult,
  filters: ResultFilters,
  detailsText: DetailsTextResolver = getResultDetails,
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
    !detailsText(result).toLowerCase().includes(detailsFilter)
  ) {
    return false;
  }

  const basicPercent = getBasicFrameTimePercent(result);
  if (filters.budget === "over" && basicPercent <= 100) return false;
  if (filters.budget === "under" && basicPercent > 100) return false;

  // 実施の有無を先に見る。未実施の候補は予算比 0 なので「100% 以下」に紛れてしまう。
  if (filters.sustained === "done" && !result.sustained) return false;
  if (filters.sustained === "none" && result.sustained) return false;
  if (filters.sustained === "over" || filters.sustained === "under") {
    if (!result.sustained) return false;
    const sustainedPercent = getSustainedFrameTimePercent(result);
    if (filters.sustained === "over" && sustainedPercent <= 100) return false;
    if (filters.sustained === "under" && sustainedPercent > 100) return false;
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
  detailsText: DetailsTextResolver = getResultDetails,
): UnitResult[] =>
  results.filter((result) => matchesFilters(result, filters, detailsText));

export const isFiltersEmpty = (filters: ResultFilters): boolean =>
  filters.family === "" &&
  filters.codec.trim() === "" &&
  filters.variant === "" &&
  filters.status === "" &&
  filters.details.trim() === "" &&
  filters.budget === "" &&
  filters.sustained === "" &&
  filters.time === "";
