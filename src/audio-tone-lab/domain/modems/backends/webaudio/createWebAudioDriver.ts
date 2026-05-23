import { parseFrame } from "../../../pipeline/frame";
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
  TuningPresetId,
} from "../../types";
import { playSamples } from "./audioContext";
import { openMicSession } from "./micSession";
import {
  bytesToBinaryFskSamples,
  bytesToGmskSamples,
  bytesToMfsk4Samples,
  decodeBinaryFskStream,
  decodeGmskStream,
  decodeMfsk4Stream,
} from "./symbolModem";

const ENCODE_OVERHEAD_SEC = 0.05;

type WebModemId = Extract<
  ModemId,
  "MFSK_AUDIBLE_4" | "GMSK_WEB" | "FSK_TUNABLE_FAST"
>;

function encodeSamples(
  modemId: WebModemId,
  frameBytes: Uint8Array,
  tuning: ModemTuning,
): Float32Array {
  const txGain = Number(tuning.txGain ?? 0.08);
  switch (modemId) {
    case "MFSK_AUDIBLE_4":
      return bytesToMfsk4Samples(
        frameBytes,
        [
          Number(tuning.freq0 ?? 1800),
          Number(tuning.freq1 ?? 2200),
          Number(tuning.freq2 ?? 2600),
          Number(tuning.freq3 ?? 3000),
        ],
        Number(tuning.symbolMs ?? 80),
        Number(tuning.gapMs ?? 15),
        txGain,
      );
    case "GMSK_WEB":
      return bytesToGmskSamples(
        frameBytes,
        Number(tuning.centerHz ?? 4200),
        Number(tuning.deviationHz ?? 600),
        Number(tuning.symbolMs ?? 40),
        txGain,
      );
    case "FSK_TUNABLE_FAST":
      return bytesToBinaryFskSamples(
        frameBytes,
        Number(tuning.markHz ?? 1200),
        Number(tuning.spaceHz ?? 2200),
        Number(tuning.baud ?? 30),
        txGain,
      );
  }
}

function estimateAirtimeSeconds(
  modemId: WebModemId,
  frameBytes: Uint8Array,
  tuning: ModemTuning,
): number {
  const samples = encodeSamples(modemId, frameBytes, tuning);
  return samples.length / 48000;
}

function tryDecodeChunk(
  modemId: WebModemId,
  chunk: Float32Array,
  sampleRate: number,
  tuning: ModemTuning,
  state: Record<string, unknown>,
): Uint8Array | null {
  switch (modemId) {
    case "MFSK_AUDIBLE_4":
      return decodeMfsk4Stream(
        chunk,
        sampleRate,
        [
          Number(tuning.freq0 ?? 1800),
          Number(tuning.freq1 ?? 2200),
          Number(tuning.freq2 ?? 2600),
          Number(tuning.freq3 ?? 3000),
        ],
        Number(tuning.symbolMs ?? 80),
        Number(tuning.gapMs ?? 15),
        state as Parameters<typeof decodeMfsk4Stream>[5],
      );
    case "GMSK_WEB":
      return decodeGmskStream(
        chunk,
        sampleRate,
        Number(tuning.centerHz ?? 4200),
        Number(tuning.deviationHz ?? 600),
        Number(tuning.symbolMs ?? 40),
        state as Parameters<typeof decodeGmskStream>[5],
      );
    case "FSK_TUNABLE_FAST":
      return decodeBinaryFskStream(
        chunk,
        sampleRate,
        Number(tuning.markHz ?? 1200),
        Number(tuning.spaceHz ?? 2200),
        Number(tuning.baud ?? 30),
        state as Parameters<typeof decodeBinaryFskStream>[5],
      );
  }
}

function createDecodeState(modemId: WebModemId) {
  if (modemId === "MFSK_AUDIBLE_4") {
    return {
      buffer: new Float32Array(0),
      preambleMatched: 0,
      bits: [] as number[],
      bytes: [] as number[],
    };
  }
  if (modemId === "GMSK_WEB") {
    return {
      buffer: new Float32Array(0),
      bits: [] as number[],
      bytes: [] as number[],
      synced: false,
    };
  }
  return {
    buffer: new Float32Array(0),
    bits: [] as number[],
    bytes: [] as number[],
  };
}

function validateFrameBytes(
  raw: Uint8Array,
  expectedModemId: ModemId,
): Uint8Array | null {
  try {
    const parsed = parseFrame(raw);
    if (parsed.modemId !== expectedModemId) return null;
    return raw;
  } catch {
    for (let trim = 0; trim < Math.min(32, raw.length); trim += 1) {
      try {
        const sliced = raw.slice(trim);
        const parsed = parseFrame(sliced);
        if (parsed.modemId === expectedModemId) return sliced;
      } catch {
        // continue
      }
    }
    return null;
  }
}

export function createWebAudioDriver(modemId: WebModemId): ModemDriver {
  const entry = getModemCatalogEntry(modemId);

  const getDefaultTuning = (): ModemTuning => ({
    ...entry.presets.default,
  });

  const applyPreset = (preset: TuningPresetId, base?: ModemTuning) =>
    resolvePresetTuning(entry, preset, base ?? getDefaultTuning());

  const planTransfer = (
    payload: TransferPayload,
    tuning: ModemTuning,
  ): TransferPlan => {
    const frame = estimateFrameBytes(payload, modemId);
    const airtimeSeconds = estimateAirtimeSeconds(modemId, frame, tuning);
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
    const plan = planTransfer(request.payload, tuning);
    const frameBytes = payloadToFrame(request);

    callbacks.onProgress?.({
      modemId,
      processedChunks: 0,
      totalChunks: 1,
      phase: "encoding",
    });

    const samples = encodeSamples(modemId, frameBytes, tuning);

    callbacks.onProgress?.({
      modemId,
      processedChunks: 0,
      totalChunks: 1,
      phase: "playing",
    });

    await playSamples(samples, Number(tuning.txGain ?? 0.08));

    const finishedAt = Date.now();
    const actualSeconds = (finishedAt - startedAt) / 1000;
    return {
      modemId,
      role: "sender" as const,
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
    };
  };

  const receive = (options: ModemReceiveOptions) => {
    let closed = false;
    let mic: Awaited<ReturnType<typeof openMicSession>> | null = null;
    const decodeState = createDecodeState(modemId);

    void (async () => {
      try {
        mic = await openMicSession(options.tuning);
        if (closed) return;

        options.onProgress?.({
          modemId,
          processedChunks: 0,
          totalChunks: 1,
          phase: "listening",
        });
        options.onActivityLog?.({
          at: Date.now(),
          level: "info",
          message: `${entry.label} 受信待機中`,
        });

        mic.pushSamples((chunk) => {
          if (closed) return;
          const raw = tryDecodeChunk(
            modemId,
            chunk,
            mic?.sampleRate ?? 48000,
            options.tuning,
            decodeState,
          );
          if (!raw) return;
          const frameBytes = validateFrameBytes(raw, modemId);
          if (!frameBytes) return;

          options.onProgress?.({
            modemId,
            processedChunks: 1,
            totalChunks: 1,
            phase: "decoding",
          });
          const startedAt = Date.now();
          try {
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
            result.actualSeconds = (result.finishedAt - startedAt) / 1000;
            result.throughputBps =
              result.payloadSizeBytes / Math.max(result.actualSeconds, 0.001);
            closed = true;
            options.onComplete(result);
            mic?.close();
          } catch (error) {
            options.onActivityLog?.({
              at: Date.now(),
              level: "warn",
              message: `フレーム解析失敗: ${String(error)}`,
            });
          }
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
        mic?.close();
        mic = null;
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
