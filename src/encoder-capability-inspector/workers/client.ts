/** 検査ワーカーへの型付きリクエスト。requestId で応答を対応付ける。 */

import type {
  EnvironmentInfo,
  InspectionStage,
  InspectionUnit,
  LiveSourceInfo,
  TestMode,
  UnitResult,
} from "../domain/types";
import { createAbortError } from "./async";
import type { WorkerRequest, WorkerResponse } from "./protocol";

export type InspectionWorkerClient = {
  readonly getEnvironment: (
    signal: AbortSignal,
  ) => Promise<Pick<EnvironmentInfo, "gpu" | "webCodecs">>;
  readonly setupLiveSource: (options: {
    video: ReadableStream<VideoFrame>;
    audio: ReadableStream<AudioData> | null;
    source: LiveSourceInfo;
    signal: AbortSignal;
  }) => Promise<void>;
  readonly closeLiveSource: () => Promise<void>;
  readonly runUnit: (options: {
    unit: InspectionUnit;
    testMode: TestMode;
    durationMs: number;
    signal: AbortSignal;
    onStage: (stage: InspectionStage) => void;
  }) => Promise<UnitResult>;
  readonly terminate: () => void;
};

/**
 * `Omit` を直接ユニオンへ当てると全メンバー共通のキーだけに潰れてしまうので、
 * メンバーごとに分配してから requestId を取り除く。
 */
type PendingRequest = WorkerRequest extends infer T
  ? T extends WorkerRequest
    ? Omit<T, "requestId">
    : never
  : never;

export const createInspectionWorkerClient = (): InspectionWorkerClient => {
  const worker = new Worker(new URL("./inspectionWorker.ts", import.meta.url), {
    type: "module",
    name: "encoder-capability-inspection",
  });
  let sequence = 0;

  const send = <T>({
    request,
    transfer,
    signal,
    onStage,
    resolveFrom,
  }: {
    request: PendingRequest;
    transfer?: Transferable[];
    signal?: AbortSignal;
    onStage?: (stage: InspectionStage) => void;
    resolveFrom: (response: WorkerResponse) => { value: T } | null;
  }): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      if (signal?.aborted) {
        reject(createAbortError());
        return;
      }
      sequence += 1;
      const requestId = `req-${sequence}`;

      const cleanup = () => {
        worker.removeEventListener("message", handleMessage);
        worker.removeEventListener("error", handleWorkerError);
        signal?.removeEventListener("abort", handleAbort);
      };
      const handleMessage = (event: MessageEvent<WorkerResponse>) => {
        const response = event.data;
        if (response.requestId !== requestId) return;
        if (response.type === "stage") {
          onStage?.(response.stage);
          return;
        }
        if (response.type === "error") {
          cleanup();
          const error = new Error(response.message);
          error.name = response.name;
          reject(error);
          return;
        }
        const resolved = resolveFrom(response);
        if (!resolved) return;
        cleanup();
        resolve(resolved.value);
      };
      const handleWorkerError = (event: ErrorEvent) => {
        cleanup();
        reject(new Error(event.message || "inspection-worker-crashed"));
      };
      const handleAbort = () => {
        // ワーカー側にも中断を伝えないと、走っているエンコードが止まらない。
        worker.postMessage({
          type: "cancel",
          requestId,
        } satisfies WorkerRequest);
        cleanup();
        reject(createAbortError());
      };

      worker.addEventListener("message", handleMessage);
      worker.addEventListener("error", handleWorkerError);
      signal?.addEventListener("abort", handleAbort, { once: true });
      worker.postMessage({ ...request, requestId }, transfer ?? []);
    });

  return {
    getEnvironment: (signal) =>
      send({
        request: { type: "environment" },
        signal,
        resolveFrom: (response) =>
          response.type === "environment-result"
            ? { value: response.environment }
            : null,
      }),

    setupLiveSource: ({ video, audio, source, signal }) =>
      send<void>({
        request: { type: "setup-live-source", video, audio, source },
        // ReadableStream は転送しないとワーカー側から読めない。
        transfer: audio ? [video, audio] : [video],
        signal,
        resolveFrom: (response) =>
          response.type === "ack" ? { value: undefined } : null,
      }),

    closeLiveSource: () =>
      send<void>({
        request: { type: "close-live-source" },
        resolveFrom: (response) =>
          response.type === "ack" ? { value: undefined } : null,
      }),

    runUnit: ({ unit, testMode, durationMs, signal, onStage }) =>
      send({
        request: { type: "run-unit", unit, testMode, durationMs },
        signal,
        onStage,
        resolveFrom: (response) =>
          response.type === "unit-result" ? { value: response.result } : null,
      }),

    terminate: () => {
      worker.terminate();
    },
  };
};
