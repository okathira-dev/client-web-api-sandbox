import { getModemCatalogEntry } from "../../catalog";
import {
  createFailedResult,
  estimateFrameBytes,
  frameToTransferResult,
  mergeDriverBase,
  payloadToFrame,
} from "../../driverUtils";
import { resolvePresetTuning } from "../../tuningStorage";
import type {
  ModemDriver,
  ModemId,
  ModemProgressCallbacks,
  ModemReceiveOptions,
  ModemSendRequest,
  ModemTuning,
  TransferPayload,
  TransferPlan,
  TransferResult,
  TuningPresetId,
} from "../../types";
import { quietDebugLog } from "./debugLog";
import { ensureQuietReady, getQuiet } from "./init";

const ENCODE_OVERHEAD_SEC = 0.08;

function profileFromTuning(tuning: ModemTuning) {
  return String(tuning.profile ?? "audible");
}

function clampFromTuning(tuning: ModemTuning) {
  return tuning.clampFrame !== false;
}

export function createQuietDriver(
  modemId: Extract<ModemId, "QUIET_AUDIBLE" | "QUIET_ULTRASONIC">,
): ModemDriver {
  const entry = getModemCatalogEntry(modemId);

  const getDefaultTuning = (): ModemTuning => ({
    ...entry.presets.default,
  });

  const applyPreset = (preset: TuningPresetId, base?: ModemTuning) =>
    resolvePresetTuning(entry, preset, base ?? getDefaultTuning());

  const planTransfer = (payload: TransferPayload): TransferPlan => {
    const frameLen = estimateFrameBytes(payload, modemId).length;
    const profile = getModemCatalogEntry(modemId);
    const typicalBps = profile.capabilities.estimatedBitrateBps.typical;
    const airtimeSeconds = Math.max(0.5, (frameLen * 8) / typicalBps);
    return {
      modemId,
      airtimeSeconds,
      encodeOverheadSec: ENCODE_OVERHEAD_SEC,
    };
  };

  const send = async (
    request: ModemSendRequest,
    callbacks: ModemProgressCallbacks,
  ) => {
    const startedAt = Date.now();
    const tuning = request.tuning;
    const plan = planTransfer(request.payload);

    callbacks.onProgress?.({
      modemId,
      processedChunks: 0,
      totalChunks: 1,
      phase: "encoding",
    });
    callbacks.onActivityLog?.({
      at: Date.now(),
      level: "info",
      message: `Quiet 送信準備 (${profileFromTuning(tuning)})`,
    });

    const t0 = performance.now();
    const quiet = await ensureQuietReady();
    quietDebugLog(
      "quiet/send.ts:ready",
      "ensureQuietReady done before send",
      "A-B",
      {
        ms: performance.now() - t0,
      },
    );
    const frameBytes = payloadToFrame(request);
    quietDebugLog("quiet/send.ts:frame", "frame built", "D", {
      frameBytes: frameBytes.length,
    });

    return new Promise<TransferResult>((resolve, reject) => {
      let finished = false;
      const finishTimer = window.setTimeout(() => {
        quietDebugLog("quiet/send.ts:txTimeout", "onFinish timeout", "C-D", {
          frameBytes: frameBytes.length,
        });
        reject(new Error("Quiet transmit onFinish timeout (120s)"));
      }, 120_000);
      const tx = quiet.transmitter({
        profile: profileFromTuning(tuning),
        clampFrame: clampFromTuning(tuning),
        onEnqueue: () => {
          quietDebugLog("quiet/send.ts:onEnqueue", "transmit enqueued", "D", {
            frameLength: tx.frameLength,
          });
          callbacks.onProgress?.({
            modemId,
            processedChunks: 0,
            totalChunks: 1,
            phase: "playing",
          });
        },
        onFinish: () => {
          if (finished) return;
          finished = true;
          window.clearTimeout(finishTimer);
          quietDebugLog("quiet/send.ts:onFinish", "transmit finished", "C", {
            ms: performance.now() - t0,
          });
          const finishedAt = Date.now();
          const actualSeconds = (finishedAt - startedAt) / 1000;
          tx.destroy();
          resolve({
            modemId,
            role: "sender",
            messageId: request.messageId,
            payloadType: request.payload.payloadType,
            payloadSizeBytes: request.payload.bytes.length,
            expectedSeconds: plan.airtimeSeconds + plan.encodeOverheadSec,
            actualSeconds,
            throughputBps:
              request.payload.bytes.length / Math.max(actualSeconds, 0.001),
            success: true,
            startedAt,
            finishedAt,
            tuningSnapshot: { ...tuning },
          });
        },
      });
      const airBuffer = frameBytes.buffer.slice(
        frameBytes.byteOffset,
        frameBytes.byteOffset + frameBytes.byteLength,
      ) as ArrayBuffer;
      quietDebugLog("quiet/send.ts:transmit", "tx.transmit called", "D", {
        bytes: airBuffer.byteLength,
        frameLength: tx.frameLength,
      });
      try {
        tx.transmit(airBuffer);
      } catch (error) {
        window.clearTimeout(finishTimer);
        quietDebugLog("quiet/send.ts:txThrow", "tx.transmit threw", "E", {
          error: String(error),
        });
        reject(error);
      }
    });
  };

  const receive = (options: ModemReceiveOptions) => {
    let closed = false;
    let receiver: { destroy: () => void } | null = null;

    void (async () => {
      try {
        const quiet = await ensureQuietReady();
        if (closed) return;

        callbacksStart(options);
        receiver = quiet.receiver({
          profile: profileFromTuning(options.tuning),
          onCreate: () => {
            options.onActivityLog?.({
              at: Date.now(),
              level: "info",
              message: "Quiet 受信機を起動しました",
            });
            options.onProgress?.({
              modemId,
              processedChunks: 0,
              totalChunks: 1,
              phase: "listening",
            });
          },
          onCreateFail: (reason) => {
            if (closed) return;
            const startedAt = Date.now();
            options.onComplete(
              createFailedResult(
                modemId,
                "receiver",
                options.tuning,
                reason,
                startedAt,
                0,
              ),
            );
          },
          onReceive: (payload: ArrayBuffer) => {
            if (closed) return;
            options.onProgress?.({
              modemId,
              processedChunks: 1,
              totalChunks: 1,
              phase: "decoding",
            });
            const startedAt = Date.now();
            try {
              const frameBytes = new Uint8Array(payload);
              const result = frameToTransferResult(frameBytes, {
                modemId,
                role: "receiver",
                expectedSeconds: 0,
                actualSeconds: 0,
                throughputBps: 0,
                startedAt,
                finishedAt: Date.now(),
                tuningSnapshot: { ...options.tuning },
              });
              if (result.modemId !== modemId) {
                options.onActivityLog?.({
                  at: Date.now(),
                  level: "warn",
                  message: `フレームのモデムIDが一致しません (expected ${modemId}, got ${result.modemId})`,
                });
                return;
              }
              result.actualSeconds = (result.finishedAt - startedAt) / 1000;
              result.throughputBps =
                result.payloadSizeBytes / Math.max(result.actualSeconds, 0.001);
              options.onComplete(result);
              closed = true;
              receiver?.destroy();
              quiet.disconnect();
            } catch (error) {
              options.onActivityLog?.({
                at: Date.now(),
                level: "warn",
                message: `復号失敗: ${String(error)}`,
              });
            }
          },
          onReceiveFail: (count) => {
            options.onActivityLog?.({
              at: Date.now(),
              level: "warn",
              message: `チェックサム失敗フレーム: ${count}`,
            });
          },
        });
      } catch (error) {
        if (!closed) {
          options.onComplete(
            createFailedResult(
              modemId,
              "receiver",
              options.tuning,
              error,
              Date.now(),
              0,
            ),
          );
        }
      }
    })();

    return {
      close: () => {
        closed = true;
        receiver?.destroy();
        receiver = null;
        void getQuiet()
          .then((q) => q.disconnect())
          .catch(() => {
            /* ignore if never initialized */
          });
      },
    };
  };

  return {
    ...mergeDriverBase(entry, getDefaultTuning, applyPreset),
    planTransfer,
    send,
    receive,
  };
}

function callbacksStart(options: ModemReceiveOptions) {
  options.onActivityLog?.({
    at: Date.now(),
    level: "info",
    message: "Quiet 受信を初期化中…",
  });
}
