/** レポートの完了判定と、表示用の集計。 */

import { REPORT_VERSION } from "../consts/inspection";
import type { MediaKind } from "./families";
import {
  getAudioCandidatesForFamily,
  getVideoCandidatesForFamily,
} from "./plan";
import {
  AUDIO_FAMILIES,
  type AudioFamily,
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
  readonly family: VideoFamily | AudioFamily;
  readonly kind: MediaKind;
  /** 完全レポートに基づく集計かどうか。false のときは「未検査」として扱う。 */
  readonly complete: boolean;
  /** 数え上げの対象のうち、どれか 1 つでも通ったものの数。 */
  readonly usableCount: number;
  readonly totalCount: number;
  /** 完全レポートがあり、実用可能な構成が 1 つも無い状態。 */
  readonly unavailable: boolean;
};

/**
 * ファミリー単位の要約。ファミリーで一律に可否を決めず、
 * 「具体的な設定のうち何件が通ったか」を数える。
 *
 * 映像は codec string 単位で数える（ハードウェア方針が違っても 1 件）。
 * 音声は codec string が設定を区別しない（AAC はどのビットレートでも `mp4a.40.2`）ため、
 * ビットレートとチャンネル数まで含んだ候補単位で数える。
 *
 * `includeExperimental` を立てると、10bit や Level 6.x なども分母に入れる。
 * 既定で除いているのは、対応が期待しにくい構成で割合が下がると実態を読み違えるため。
 */
export const summarizeFamilies = (
  report: InspectionReport | null | undefined,
  { includeExperimental = false }: { includeExperimental?: boolean } = {},
): FamilySummary[] => {
  const effective = getEffectiveReport(report);
  const results = effective?.results ?? [];
  const usableCodecs = new Set(
    results
      .filter((result) => isVideoResult(result) && result.usable)
      .map((result) => result.codec.toLowerCase()),
  );
  const usableAudioCandidates = new Set(
    results
      .filter((result) => result.kind === "audio" && result.usable)
      .map((result) => result.candidateId),
  );

  const summarize = (
    family: VideoFamily | AudioFamily,
    kind: MediaKind,
    usableCount: number,
    totalCount: number,
  ): FamilySummary => ({
    family,
    kind,
    complete: effective !== null,
    usableCount,
    totalCount,
    unavailable: effective !== null && usableCount === 0,
  });

  return [
    ...VIDEO_FAMILIES.map((family) => {
      const candidates = getVideoCandidatesForFamily(family).filter(
        (candidate) => includeExperimental || !candidate.experimental,
      );
      return summarize(
        family,
        "video",
        candidates.filter((candidate) =>
          usableCodecs.has(candidate.codec.toLowerCase()),
        ).length,
        candidates.length,
      );
    }),
    ...AUDIO_FAMILIES.map((family) => {
      const candidates = getAudioCandidatesForFamily(family);
      return summarize(
        family,
        "audio",
        candidates.filter((candidate) =>
          usableAudioCandidates.has(candidate.candidateId),
        ).length,
        candidates.length,
      );
    }),
  ];
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
