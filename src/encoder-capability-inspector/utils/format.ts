/** 表示用の整形。 */

import type { PerformanceMetrics } from "../domain/types";

export const formatDuration = (milliseconds: number | null): string => {
  if (milliseconds === null || !Number.isFinite(milliseconds)) return "—";
  const totalSeconds = Math.max(0, Math.round(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const paddedSeconds = String(seconds).padStart(2, "0");
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${paddedSeconds}`
    : `${minutes}:${paddedSeconds}`;
};

export const formatMilliseconds = (milliseconds: number | null): string =>
  milliseconds === null || !Number.isFinite(milliseconds)
    ? "—"
    : `${Math.round(milliseconds)} ms`;

/** ビットレートは検査値・公式実装の制約値のどちらにも同じ表記を使う。 */
export const formatBitrate = (bitsPerSecond: number): string =>
  bitsPerSecond >= 1_000_000
    ? `${bitsPerSecond / 1_000_000} Mbps`
    : `${bitsPerSecond / 1000} kbps`;

/** フレーム予算に対する処理時間の割合。100% を超えると要求 FPS に追いつけない。 */
export const formatFrameBudget = (
  performance: PerformanceMetrics | null,
): string => {
  if (!performance || !Number.isFinite(performance.frameTimePercent)) {
    return "—";
  }
  return `${performance.frameTimePercent}% (${performance.averageProcessingMs} / ${performance.frameBudgetMs} ms)`;
};

export const formatBytes = (bytes: number | null): string => {
  if (bytes === null || !Number.isFinite(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

export const formatTimestamp = (timestamp: number | null): string =>
  timestamp === null || !Number.isFinite(timestamp)
    ? "—"
    : new Date(timestamp).toLocaleString();
