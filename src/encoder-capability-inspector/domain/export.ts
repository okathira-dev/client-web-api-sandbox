/**
 * レポートを持ち出せる形へ整える。
 *
 * 環境ごとの結果を他の環境と突き合わせたり、報告に添えたりするためのもの。
 * 保存済みレポートをそのまま出すのではなく、持ち出しに要らないものを落として封筒を付ける。
 */

import type { InspectionReport } from "./types";

export type ReportExport = {
  readonly tool: "encoder-capability-inspector";
  /** レポート形式の版数。候補行列や計測の意味が変わると上がる。 */
  readonly reportVersion: number;
  readonly exportedAt: string;
  readonly report: Omit<InspectionReport, "previousCompleted" | "version">;
};

/**
 * `previousCompleted` は落とす。
 * 直前の完全レポートを丸ごと抱えているので、外へ出すと同じ内容が二重になる。
 */
export const buildReportExport = (
  report: InspectionReport,
  exportedAt: Date = new Date(),
): ReportExport => {
  const { previousCompleted: _previousCompleted, version, ...rest } = report;
  return {
    tool: "encoder-capability-inspector",
    reportVersion: version,
    exportedAt: exportedAt.toISOString(),
    report: rest,
  };
};

const pad = (value: number): string => String(value).padStart(2, "0");

/** 並べたときに時系列で揃うよう、ローカル時刻を年月日-時分で入れる。 */
export const buildExportFileName = (exportedAt: Date = new Date()): string =>
  `encoder-capability-${exportedAt.getFullYear()}${pad(
    exportedAt.getMonth() + 1,
  )}${pad(exportedAt.getDate())}-${pad(exportedAt.getHours())}${pad(
    exportedAt.getMinutes(),
  )}.json`;
