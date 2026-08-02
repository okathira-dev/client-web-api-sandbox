/**
 * 検査の実行制御（メインスレッド側）。
 *
 * 重い処理はワーカーへ委ね、ここは「候補を順に投げる・進捗を配る・終端で保存する」だけを持つ。
 */

import {
  LIVE_SOURCE_CLOSE_TIMEOUT_MS,
  REPORT_VERSION,
} from "../../consts/inspection";
import {
  buildFullInspectionPlan,
  findInspectionUnits,
} from "../../domain/plan";
import { getEffectiveReport, isResumableReport } from "../../domain/report";
import type {
  InspectionReport,
  InspectionUnit,
  LiveSourceInfo,
  ReportStatus,
  UnitResult,
} from "../../domain/types";
import { collectMainEnvironment } from "../../utils/environment";
import { withInspectionLock } from "../../utils/inspectionLock";
import { loadReport, saveReport } from "../../utils/reportStore";
import { isAbortError, wait } from "../../workers/async";
import {
  createInspectionWorkerClient,
  type InspectionWorkerClient,
} from "../../workers/client";

export type ProgressListener = (report: InspectionReport) => void;

const terminalStatusFor = (error: unknown): ReportStatus =>
  isAbortError(error) ? "cancelled" : "failed";

const describe = (error: unknown): string =>
  (error instanceof Error ? error.message : String(error)).slice(0, 300);

/**
 * ライブ入力を解放してからワーカーを終了する。応答しないワーカーでも finally が
 * 進むように、close の待機には短い上限を設ける。
 */
const closeLiveSourceBeforeTerminate = async (
  client: InspectionWorkerClient,
): Promise<void> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, LIVE_SOURCE_CLOSE_TIMEOUT_MS);
  try {
    await client.closeLiveSource(controller.signal);
  } catch {
    // 中断直後やタイムアウト時は terminate で確実に解放する。
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * 候補間の待機。0ms のときはタイマーを張らず、待機処理そのものを行わない（仕様 3.9）。
 * 最後の候補のあとにも待機しない。
 */
const pauseBetweenCandidates = async (
  pauseMs: number,
  index: number,
  total: number,
): Promise<void> => {
  if (pauseMs > 0 && index < total - 1) await wait(pauseMs);
};

// ---------------------------------------------------------------------------
// Full inspection
// ---------------------------------------------------------------------------

export const runFullInspection = async ({
  candidatePauseMs,
  resume,
  signal,
  onProgress,
}: {
  candidatePauseMs: number;
  resume: boolean;
  signal: AbortSignal;
  onProgress: ProgressListener;
}): Promise<InspectionReport> =>
  withInspectionLock(async () => {
    const plan = buildFullInspectionPlan();
    const stored = await loadReport();
    const existing = resume && isResumableReport(stored) ? stored : null;

    // 完全に完了した直近のレポートは、この実行が中断されても残るように引き継ぐ。
    // 入れ子は 1 段に限る。
    const lastComplete = getEffectiveReport(stored);
    const previousCompleted: InspectionReport | null = lastComplete
      ? { ...lastComplete, previousCompleted: null }
      : null;

    const completedIds = new Set(
      (existing?.results ?? []).map((result) => result.id),
    );
    const pending = plan.filter((unit) => !completedIds.has(unit.id));

    /*
      経過時間は「実際に検査していた時間」で数える。
      中断して再開すると `startedAt` からの経過には止まっていた時間が入ってしまい、
      経過表示も、そこから割り出す残り見込みも狂う。
    */
    const runStartedAt = Date.now();
    const activeMsBefore = existing?.activeMs ?? 0;

    let report: InspectionReport = {
      version: REPORT_VERSION,
      status: "running",
      startedAt: existing?.startedAt ?? runStartedAt,
      updatedAt: runStartedAt,
      completedAt: null,
      activeMs: activeMsBefore,
      environment: {
        ...collectMainEnvironment(),
        gpu: null,
        webCodecs: {
          videoEncoder: false,
          videoDecoder: false,
          audioEncoder: false,
          audioDecoder: false,
          offscreenCanvas: false,
        },
      },
      totalUnits: plan.length,
      completedUnits: completedIds.size,
      candidatePauseMs,
      results: existing?.results ?? [],
      current: null,
      error: null,
      previousCompleted,
      sustained: null,
    };
    const emit = () => {
      onProgress(report);
    };
    /** `updatedAt` と実働時間は必ず同じ時刻で更新する。UI が両者の差分を足すため。 */
    const touch = (next: InspectionReport): InspectionReport => {
      const at = Date.now();
      return {
        ...next,
        updatedAt: at,
        activeMs: activeMsBefore + (at - runStartedAt),
      };
    };

    let client: InspectionWorkerClient | null = null;
    try {
      client = createInspectionWorkerClient();
      const workerEnvironment = await client.getEnvironment(signal);
      report = touch({
        ...report,
        environment: { ...report.environment, ...workerEnvironment },
      });
      emit();

      for (const [index, unit] of pending.entries()) {
        if (signal.aborted) throw new DOMException("cancelled", "AbortError");

        report = touch({
          ...report,
          current: {
            id: unit.id,
            kind: unit.kind,
            codec: unit.codec,
            label: unit.label,
            stage: "declared",
          },
        });
        emit();

        const result = await client.runUnit({
          unit,
          testMode: "compatibility",
          durationMs: 0,
          signal,
          onStage: (stage) => {
            // 結果配列の参照は保つので、この更新で結果一覧は再描画されない。
            report = {
              ...report,
              current: report.current ? { ...report.current, stage } : null,
            };
            emit();
          },
        });

        report = touch({
          ...report,
          results: [result, ...report.results],
          completedUnits: report.completedUnits + 1,
          current: null,
        });
        emit();

        await pauseBetweenCandidates(candidatePauseMs, index, pending.length);
      }

      report = touch({
        ...report,
        status: "complete",
        completedAt: Date.now(),
        current: null,
        // 完全完了したので、これ以上前のレポートを持ち回る必要がない。
        previousCompleted: null,
      });
      await saveReport(report);
      emit();
      return report;
    } catch (error) {
      report = touch({
        ...report,
        status: terminalStatusFor(error),
        error: describe(error),
        current: null,
      });
      await saveReport(report);
      emit();
      throw error;
    } finally {
      client?.terminate();
    }
  });

// ---------------------------------------------------------------------------
// Sustained test
// ---------------------------------------------------------------------------

export type LiveCapture = {
  readonly video: ReadableStream<VideoFrame>;
  readonly audio: ReadableStream<AudioData> | null;
  readonly info: LiveSourceInfo;
};

const mergeSustainedResult = (
  results: readonly UnitResult[],
  unitId: string,
  sustained: UnitResult,
): UnitResult[] =>
  // 継続検査の返り値は基本検査の情報を持ち直すため、既存行の sustained 部分だけ置換する。
  results.map((result) =>
    result.id === unitId ? { ...result, sustained } : result,
  );

export const runSustainedInspection = async ({
  unitIds,
  durationSeconds,
  candidatePauseMs,
  inputMode,
  liveCapture,
  signal,
  onProgress,
}: {
  unitIds: readonly string[];
  durationSeconds: number;
  candidatePauseMs: number;
  inputMode: "synthetic" | "live";
  liveCapture: LiveCapture | null;
  signal: AbortSignal;
  onProgress: ProgressListener;
}): Promise<InspectionReport> =>
  withInspectionLock(async () => {
    const units: InspectionUnit[] = findInspectionUnits(unitIds);
    if (units.length === 0) throw new Error("no-units-selected");
    if (inputMode === "live") {
      if (!liveCapture) throw new Error("live-capture-unavailable");
      // 音声の共有は利用者が選ぶもの。選ばなかったなら音声候補は検査できない。
      if (!liveCapture.audio && units.some((unit) => unit.kind === "audio")) {
        throw new Error("live-capture-audio-track-unavailable");
      }
    }

    const stored = await loadReport();
    if (!stored) throw new Error("capability-report-not-found");

    const durationMs = Math.round(durationSeconds * 1000);
    let report: InspectionReport = {
      ...stored,
      sustained: {
        status: "running",
        startedAt: Date.now(),
        updatedAt: Date.now(),
        completedAt: null,
        durationSeconds,
        inputMode,
        source: liveCapture?.info ?? null,
        candidatePauseMs,
        totalUnits: units.length,
        completedUnits: 0,
        unitIds: units.map((unit) => unit.id),
        current: null,
        error: null,
      },
    };
    const emit = () => {
      onProgress(report);
    };
    const updateSustained = (
      patch: Partial<NonNullable<InspectionReport["sustained"]>>,
    ) => {
      if (!report.sustained) return;
      report = {
        ...report,
        sustained: { ...report.sustained, ...patch, updatedAt: Date.now() },
      };
    };

    let client: InspectionWorkerClient | null = null;
    try {
      client = createInspectionWorkerClient();
      if (inputMode === "live" && liveCapture) {
        await client.setupLiveSource({
          video: liveCapture.video,
          audio: liveCapture.audio,
          source: liveCapture.info,
          signal,
        });
      }

      for (const [index, unit] of units.entries()) {
        if (signal.aborted) throw new DOMException("cancelled", "AbortError");

        updateSustained({
          current: {
            id: unit.id,
            kind: unit.kind,
            codec: unit.codec,
            label: unit.label,
            stage: "declared",
          },
        });
        emit();

        const result = await client.runUnit({
          unit,
          testMode: "sustained",
          durationMs,
          signal,
          onStage: (stage) => {
            if (!report.sustained?.current) return;
            updateSustained({
              current: { ...report.sustained.current, stage },
            });
            emit();
          },
        });

        report = {
          ...report,
          results: mergeSustainedResult(report.results, unit.id, result),
        };
        updateSustained({
          completedUnits: (report.sustained?.completedUnits ?? 0) + 1,
          current: null,
        });
        emit();

        await pauseBetweenCandidates(candidatePauseMs, index, units.length);
      }

      updateSustained({ status: "complete", completedAt: Date.now() });
      await saveReport(report);
      emit();
      return report;
    } catch (error) {
      updateSustained({
        status: terminalStatusFor(error),
        error: describe(error),
        current: null,
      });
      await saveReport(report);
      emit();
      throw error;
    } finally {
      if (inputMode === "live" && client) {
        // トラック停止だけでは、ワーカーが掴んだままの reader が解放されない。
        await closeLiveSourceBeforeTerminate(client);
      }
      client?.terminate();
    }
  });
