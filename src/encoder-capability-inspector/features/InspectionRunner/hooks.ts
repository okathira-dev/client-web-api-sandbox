/** 検査の開始・再開・キャンセル・破棄をまとめたフック。 */

import { useCallback, useEffect, useRef } from "react";

import { useSetReport } from "../../atoms/report";
import { useSetRunError, useSetRunKind } from "../../atoms/runState";
import { clearReport, loadReport } from "../../utils/reportStore";
import { isAbortError } from "../../workers/async";
import type { AcquiredLiveCapture } from "../SustainedTest/functions";
import { runFullInspection, runSustainedInspection } from "./functions";

const describe = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const useInspectionControls = () => {
  const setReport = useSetReport();
  const setRunKind = useSetRunKind();
  const setError = useSetRunError();
  const abortRef = useRef<AbortController | null>(null);

  // ページを離れるときに走りっぱなしのワーカーを残さない。
  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    [],
  );

  const startFull = useCallback(
    async ({
      candidatePauseMs,
      resume,
    }: {
      candidatePauseMs: number;
      resume: boolean;
    }) => {
      setError(null);
      setRunKind("full");
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        await runFullInspection({
          candidatePauseMs,
          resume,
          signal: controller.signal,
          onProgress: setReport,
        });
      } catch (error) {
        // キャンセルは利用者の操作なので、失敗として表示しない。
        if (!isAbortError(error)) setError(describe(error));
      } finally {
        abortRef.current = null;
        setRunKind(null);
      }
    },
    [setError, setReport, setRunKind],
  );

  const startSustained = useCallback(
    async ({
      unitIds,
      durationSeconds,
      candidatePauseMs,
      inputMode,
      liveCapture,
    }: {
      unitIds: readonly string[];
      durationSeconds: number;
      candidatePauseMs: number;
      inputMode: "synthetic" | "live";
      liveCapture: AcquiredLiveCapture | null;
    }) => {
      setError(null);
      setRunKind("sustained");
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        await runSustainedInspection({
          unitIds,
          durationSeconds,
          candidatePauseMs,
          inputMode,
          liveCapture: liveCapture
            ? { readable: liveCapture.readable, info: liveCapture.info }
            : null,
          signal: controller.signal,
          onProgress: setReport,
        });
      } catch (error) {
        if (!isAbortError(error)) setError(describe(error));
      } finally {
        liveCapture?.stop();
        abortRef.current = null;
        setRunKind(null);
      }
    },
    [setError, setReport, setRunKind],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(async () => {
    abortRef.current?.abort();
    await clearReport();
    setReport(null);
    setError(null);
  }, [setError, setReport]);

  const reload = useCallback(async () => {
    setReport(await loadReport());
  }, [setReport]);

  return { startFull, startSustained, cancel, reset, reload };
};
