/**
 * 検査レポートの共有状態。
 *
 * 実行中の更新はここへ流し、IndexedDB へは終端状態でだけ書く。
 * 結果配列は候補が 1 件完了したときにだけ差し替えるので、ステージ更新では
 * `useResults` の値が変わらず、結果一覧が再描画されない。
 */

import { atom, useAtomValue, useSetAtom } from "jotai";

import { countResults, summarizeFamilies } from "../domain/report";
import type { InspectionReport, UnitResult } from "../domain/types";

const reportAtom = atom<InspectionReport | null>(null);

const EMPTY_RESULTS: readonly UnitResult[] = [];

const resultsAtom = atom<readonly UnitResult[]>(
  (get) => get(reportAtom)?.results ?? EMPTY_RESULTS,
);

const currentInspectionAtom = atom((get) => get(reportAtom)?.current ?? null);

const sustainedAtom = atom((get) => get(reportAtom)?.sustained ?? null);

const progressAtom = atom((get) => {
  const report = get(reportAtom);
  return {
    status: report?.status ?? null,
    startedAt: report?.startedAt ?? null,
    completedAt: report?.completedAt ?? null,
    updatedAt: report?.updatedAt ?? 0,
    activeMs: report?.activeMs ?? 0,
    completedUnits: report?.completedUnits ?? 0,
    totalUnits: report?.totalUnits ?? 0,
    candidatePauseMs: report?.candidatePauseMs ?? 0,
    error: report?.error ?? null,
  };
});

const countsAtom = atom((get) => countResults(get(resultsAtom)));

const familySummariesAtom = atom((get) => summarizeFamilies(get(reportAtom)));

const environmentAtom = atom((get) => get(reportAtom)?.environment ?? null);

export const useReport = () => useAtomValue(reportAtom);
export const useSetReport = () => useSetAtom(reportAtom);
export const useResults = () => useAtomValue(resultsAtom);
export const useCurrentInspection = () => useAtomValue(currentInspectionAtom);
export const useSustainedState = () => useAtomValue(sustainedAtom);
export const useProgress = () => useAtomValue(progressAtom);
export const useResultCounts = () => useAtomValue(countsAtom);
export const useFamilySummaries = () => useAtomValue(familySummariesAtom);
export const useEnvironment = () => useAtomValue(environmentAtom);
