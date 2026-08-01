/** レポートの完了判定と、表示用の集計。 */

import { REPORT_VERSION } from "../consts/inspection";
import { getVideoCandidatesForFamily } from "./plan";
import {
  type InspectionReport,
  type UnitResult,
  VIDEO_FAMILIES,
  type VideoFamily,
  type VideoUnitResult,
} from "./types";

/**
 * 全候補を最後まで処理し終えたレポートだけを「完全」とみなす。
 * 途中結果は表示には使うが、環境の結論として扱ってはならない。
 */
export const isCompleteReport = (
  report: InspectionReport | null | undefined,
): report is InspectionReport =>
  report?.version === REPORT_VERSION &&
  report.status === "complete" &&
  report.totalUnits > 0 &&
  report.completedUnits === report.totalUnits;

/**
 * いま有効な完全レポートを返す。
 * 再検査を中断した場合は、直前に完全完了したレポートへフォールバックする。
 */
export const getEffectiveReport = (
  report: InspectionReport | null | undefined,
): InspectionReport | null => {
  // isCompleteReport は型述語なので、先に読んでおかないと否定側で report が never に狭まる。
  const previous = report?.previousCompleted ?? null;
  if (isCompleteReport(report)) return report;
  return isCompleteReport(previous) ? previous : null;
};

/** 中断済みで、まだ処理していない候補が残っているレポートは再開できる。 */
export const isResumableReport = (
  report: InspectionReport | null | undefined,
): report is InspectionReport =>
  report != null &&
  report.version === REPORT_VERSION &&
  (report.status === "cancelled" || report.status === "failed") &&
  report.completedUnits > 0 &&
  report.completedUnits < report.totalUnits;

export const isVideoResult = (result: UnitResult): result is VideoUnitResult =>
  result.kind === "video";

export type FamilySummary = {
  readonly family: VideoFamily;
  /** 完全レポートに基づく集計かどうか。false のときは「未検査」として扱う。 */
  readonly complete: boolean;
  /** experimental を除いた codec string のうち、どれか 1 つでも通ったものの数。 */
  readonly usableCount: number;
  readonly totalCount: number;
  /** 完全レポートがあり、実用可能な構成が 1 つも無い状態。 */
  readonly unavailable: boolean;
};

/**
 * ファミリー単位の要約。ファミリーで一律に可否を決めず、
 * 「具体的な codec string のうち何件が通ったか」を数える。
 */
export const summarizeFamilies = (
  report: InspectionReport | null | undefined,
): FamilySummary[] => {
  const effective = getEffectiveReport(report);
  const usableCodecs = new Set(
    (effective?.results ?? [])
      .filter((result) => isVideoResult(result) && result.usable)
      .map((result) => result.codec.toLowerCase()),
  );

  return VIDEO_FAMILIES.map((family) => {
    const production = getVideoCandidatesForFamily(family).filter(
      (candidate) => !candidate.experimental,
    );
    const usableCount = production.filter((candidate) =>
      usableCodecs.has(candidate.codec.toLowerCase()),
    ).length;
    return {
      family,
      complete: effective !== null,
      usableCount,
      totalCount: production.length,
      unavailable: effective !== null && usableCount === 0,
    };
  });
};

/**
 * 経過時間。中断していた時間は数えない。
 *
 * `activeMs` はレポートを更新した時点までの累計なので、実行中はそこからの差分を足す。
 * 実行中でないときに足すと、中断して眺めているあいだも時間が進んでしまう。
 */
export const getActiveElapsedMs = ({
  activeMs,
  updatedAt,
  running,
  now,
}: {
  activeMs: number;
  updatedAt: number;
  running: boolean;
  now: number;
}): number => (running ? activeMs + Math.max(0, now - updatedAt) : activeMs);

/**
 * 残りの候補にかかる見込み。1 候補あたりの実働時間から出す。
 * まだ 1 件も終わっていない、または残りが無いときは出さない。
 */
export const getRemainingMs = ({
  elapsedMs,
  completedUnits,
  totalUnits,
}: {
  elapsedMs: number;
  completedUnits: number;
  totalUnits: number;
}): number | null => {
  const remainingUnits = totalUnits - completedUnits;
  if (completedUnits <= 0 || remainingUnits <= 0) return null;
  return (elapsedMs / completedUnits) * remainingUnits;
};

export type ResultCounts = {
  readonly pass: number;
  readonly warning: number;
  readonly fail: number;
};

export const countResults = (results: readonly UnitResult[]): ResultCounts => {
  let pass = 0;
  let warning = 0;
  let fail = 0;
  for (const result of results) {
    if (result.usable) {
      pass += 1;
      if (result.warning) warning += 1;
    } else {
      fail += 1;
    }
  }
  return { pass, warning, fail };
};
