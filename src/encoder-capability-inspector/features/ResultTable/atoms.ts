/** 結果一覧の絞り込み・並べ替えと、Sustained test の対象選択。 */

import { atom, useAtomValue, useSetAtom } from "jotai";

import {
  EMPTY_RESULT_FILTERS,
  filterResults,
  getResultVariant,
  type ResultFilters,
} from "../../domain/filters";
import {
  cycleSort,
  type ResultSort,
  type SortField,
  sortResults,
} from "../../domain/sorting";
import type { UnitResult } from "../../domain/types";

const filtersAtom = atom<ResultFilters>(EMPTY_RESULT_FILTERS);
const sortAtom = atom<ResultSort | null>(null);
const selectedIdsAtom = atom<ReadonlySet<string>>(new Set<string>());

/**
 * フィルターの対象になる結果一覧。
 * 呼び出し側から現在の結果を渡す形にして、レポート atom と結合させない。
 */
export const useResultFilters = () => useAtomValue(filtersAtom);

const setFilterAtom = atom(
  null,
  (get, set, update: { field: keyof ResultFilters; value: string }) => {
    set(filtersAtom, {
      ...get(filtersAtom),
      [update.field]: update.value,
    } as ResultFilters);
  },
);

const clearFiltersAtom = atom(null, (_get, set) => {
  set(filtersAtom, EMPTY_RESULT_FILTERS);
});

export const useSetResultFilter = () => useSetAtom(setFilterAtom);
export const useClearResultFilters = () => useSetAtom(clearFiltersAtom);

export const useResultSort = () => useAtomValue(sortAtom);

/** 見出しを押すたびに 昇順 → 降順 → 解除 と一巡させる。 */
const cycleSortAtom = atom(null, (get, set, field: SortField) => {
  set(sortAtom, cycleSort(get(sortAtom), field));
});

export const useCycleResultSort = () => useSetAtom(cycleSortAtom);

export const useSelectedIds = () => useAtomValue(selectedIdsAtom);

const toggleSelectionAtom = atom(null, (get, set, unitId: string) => {
  const next = new Set(get(selectedIdsAtom));
  if (!next.delete(unitId)) next.add(unitId);
  set(selectedIdsAtom, next);
});

const setSelectionAtom = atom(null, (_get, set, unitIds: Iterable<string>) => {
  set(selectedIdsAtom, new Set(unitIds));
});

/** フィルター結果をまとめて選択・解除する。 */
const toggleManyAtom = atom(
  null,
  (get, set, update: { unitIds: readonly string[]; selected: boolean }) => {
    const next = new Set(get(selectedIdsAtom));
    for (const unitId of update.unitIds) {
      if (update.selected) next.add(unitId);
      else next.delete(unitId);
    }
    set(selectedIdsAtom, next);
  },
);

export const useToggleSelection = () => useSetAtom(toggleSelectionAtom);
export const useSetSelection = () => useSetAtom(setSelectionAtom);
export const useToggleManySelection = () => useSetAtom(toggleManyAtom);

/** 表示中の結果から、絞り込み用の選択肢を作る。 */
export const getFilterOptions = (results: readonly UnitResult[]) => ({
  families: [...new Set(results.map((result) => result.family))].sort(),
  variants: [...new Set(results.map(getResultVariant))].sort(),
});

export { filterResults, sortResults };
