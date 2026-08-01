/** 結果一覧の並べ替え。絞り込みと同じく UI から切り離しておき、単体テストで担保する。 */

import { getFamilyOrder } from "./families";
import {
  type DetailsTextResolver,
  getBasicFrameTimePercent,
  getResultDetails,
  getResultStatus,
  getResultVariant,
  getSustainedFrameTimePercent,
} from "./filters";
import type { UnitResult } from "./types";

export type SortField =
  | "family"
  | "codec"
  | "variant"
  | "status"
  | "details"
  | "budget"
  | "sustained"
  | "time";

export type SortDirection = "asc" | "desc";

export type ResultSort = {
  readonly field: SortField;
  readonly direction: SortDirection;
};

/** 成功 → 警告 → 失敗。文字列ではなく等級として意味のある順に並べる。 */
const STATUS_RANK = { pass: 0, warning: 1, fail: 2 } as const;

type Comparator = (left: UnitResult, right: UnitResult) => number;

const byText =
  (select: (result: UnitResult) => string): Comparator =>
  (left, right) =>
    select(left).localeCompare(select(right));

const byNumber =
  (select: (result: UnitResult) => number): Comparator =>
  (left, right) =>
    select(left) - select(right);

const getComparator = (
  field: SortField,
  detailsText: DetailsTextResolver,
): Comparator => {
  switch (field) {
    case "family":
      // 名前順だと映像と音声が混ざるので、種別でまとめてから並べる。
      return byNumber((result) => getFamilyOrder(result.family));
    case "codec":
      return byText((result) => result.codec);
    case "variant":
      return byText(getResultVariant);
    case "status":
      return byNumber((result) => STATUS_RANK[getResultStatus(result)]);
    case "details":
      return byText(detailsText);
    case "budget":
      return byNumber(getBasicFrameTimePercent);
    case "sustained":
      return byNumber(getSustainedFrameTimePercent);
    case "time":
      return byNumber((result) => result.elapsedMs);
  }
};

/**
 * `sort` が null のときは元の並び（新しい候補が先頭）をそのまま保つ。
 * 同値の候補どうしの順序も元の並びのままにしたいので、安定ソートに依存する。
 */
export const sortResults = (
  results: readonly UnitResult[],
  sort: ResultSort | null,
  detailsText: DetailsTextResolver = getResultDetails,
): UnitResult[] => {
  if (!sort) return [...results];
  const compare = getComparator(sort.field, detailsText);
  const sign = sort.direction === "asc" ? 1 : -1;
  return [...results].sort((left, right) => sign * compare(left, right));
};

/**
 * 見出しを押したときの遷移。昇順 → 降順 → 解除 と一巡させ、
 * 解除で「新しい候補が先頭」の既定の並びへ戻せるようにする。
 */
export const cycleSort = (
  current: ResultSort | null,
  field: SortField,
): ResultSort | null => {
  if (current?.field !== field) return { field, direction: "asc" };
  if (current.direction === "asc") return { field, direction: "desc" };
  return null;
};
