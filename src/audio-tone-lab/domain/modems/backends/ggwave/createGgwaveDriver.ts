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
  ModemProgressCallbacks,
  ModemReceiveOptions,
  ModemSendRequest,
  ModemTuning,
  TransferPayload,
  TransferPlan,
  TuningPresetId,
} from "../../types";
import {
  ensureGgwaveModule,
  type GgwaveInstance,
  type GgwaveModule,
  protocolIdFromTuning,
  volumeFromTuning,
} from "./init";

const MODEM_ID = "GGWAVE_AUDIBLE" as const;
const ENCODE_OVERHEAD_SEC = 0.05;
const SAMPLE_RATE = 48000;

function convertToInt8(samples: Float32Array) {
  const out = new Int8Array(samples.length);
  for (let i = 0; i < samples.length; i += 1) {
    const v = Math.max(-1, Math.min(1, samples[i] ?? 0));
    out[i] = Math.round(v * 127);
  }
  return out;
}

async function createAudioContext() {
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) throw new Error("Web Audio API is not available");
  const context = new Ctx({ sampleRate: SAMPLE_RATE });
  if (context.state === "suspended") {
    await context.resume();
  }
  return context;
}

async function createGgwaveInstance(mod: GgwaveModule, sampleRate: number) {
  const parameters = mod.getDefaultParameters();
  parameters.sampleRateInp = sampleRate;
  parameters.sampleRateOut = sampleRate;
  return mod.init(parameters);
}

export function createGgwaveDriver(): ModemDriver {
  const entry = getModemCatalogEntry(MODEM_ID);

  const getDefaultTuning = (): ModemTuning => ({
    ...entry.presets.default,
  });

  const applyPreset = (preset: TuningPresetId, base?: ModemTuning) =>
    resolvePresetTuning(entry, preset, base ?? getDefaultTuning());

  const planTransfer = (
    payload: TransferPayload,
    tuning: ModemTuning,
  ): TransferPlan => {
    const frameLen = estimateFrameBytes(payload, MODEM_ID).length;
    const typicalBps = entry.capabilities.estimatedBitrateBps.typical;
    const airtimeSeconds = Math.max(1, (frameLen * 8) / typicalBps);
    void tuning;
    return {
      modemId: MODEM_ID,
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

    callbacks.onProgress?.({
      modemId: MODEM_ID,
      processedChunks: 0,
      totalChunks: 1,
      phase: "encoding",
    });

    const mod = await ensureGgwaveModule();
    const context = await createAudioContext();
    const instance = await createGgwaveInstance(mod, context.sampleRate);
    const frameBytes = payloadToFrame(request);
    const protocolId = protocolIdFromTuning(mod, tuning);
    const volume = volumeFromTuning(tuning);

    const waveform = mod.encode(instance, frameBytes, protocolId, volume) as
      | Int8Array
      | Float32Array;

    const floatWave =
      waveform instanceof Float32Array
        ? waveform
        : (() => {
            const f = new Float32Array(waveform.length);
            for (let i = 0; i < waveform.length; i += 1) {
              f[i] = (waveform[i] ?? 0) / 128;
            }
            return f;
          })();

    callbacks.onProgress?.({
      modemId: MODEM_ID,
      processedChunks: 0,
      totalChunks: 1,
      phase: "playing",
    });

    await new Promise<void>((resolve) => {
      const buffer = context.createBuffer(
        1,
        floatWave.length,
        context.sampleRate,
      );
      buffer.getChannelData(0).set(floatWave);
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.onended = () => resolve();
      source.start(0);
    });

    mod.free(instance);
    await context.close();

    const finishedAt = Date.now();
    const actualSeconds = (finishedAt - startedAt) / 1000;
    return {
      modemId: MODEM_ID,
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
    let context: AudioContext | null = null;
    let recorder: ScriptProcessorNode | null = null;
    let mediaStream: MediaStreamAudioSourceNode | null = null;
    let instance: GgwaveInstance | null = null;
    let mod: GgwaveModule | null = null;

    void (async () => {
      try {
        mod = await ensureGgwaveModule();
        context = await createAudioContext();
        instance = await createGgwaveInstance(mod, context.sampleRate);

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            channelCount: 1,
          },
        });
        if (closed) return;

        mediaStream = context.createMediaStreamSource(stream);
        const bufferSize = 2048;
        recorder = context.createScriptProcessor(bufferSize, 1, 1);
        recorder.onaudioprocess = (event) => {
          if (closed || !mod || !instance) return;
          const channel = event.inputBuffer.getChannelData(0);
          const res = mod.decode(
            instance,
            convertToInt8(new Float32Array(channel)),
          ) as Uint8Array | null;
          if (!res || res.length === 0) return;

          options.onProgress?.({
            modemId: MODEM_ID,
            processedChunks: 1,
            totalChunks: 1,
            phase: "decoding",
          });
          const startedAt = Date.now();
          try {
            const result = frameToTransferResult(new Uint8Array(res), {
              modemId: MODEM_ID,
              role: "receiver",
              expectedSeconds: 0,
              actualSeconds: 0,
              throughputBps: 0,
              startedAt,
              finishedAt: Date.now(),
              tuningSnapshot: { ...options.tuning },
            });
            if (result.modemId !== MODEM_ID) return;
            result.actualSeconds = (result.finishedAt - startedAt) / 1000;
            result.throughputBps =
              result.payloadSizeBytes / Math.max(result.actualSeconds, 0.001);
            options.onComplete(result);
            closed = true;
          } catch (error) {
            options.onActivityLog?.({
              at: Date.now(),
              level: "warn",
              message: `ggwave 復号失敗: ${String(error)}`,
            });
          }
        };

        mediaStream.connect(recorder);
        recorder.connect(context.destination);

        options.onProgress?.({
          modemId: MODEM_ID,
          processedChunks: 0,
          totalChunks: 1,
          phase: "listening",
        });
        options.onActivityLog?.({
          at: Date.now(),
          level: "info",
          message: "ggwave 受信待機中",
        });
      } catch (error) {
        if (!closed) {
          options.onComplete(
            createFailedResult(
              MODEM_ID,
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
        recorder?.disconnect();
        mediaStream?.disconnect();
        if (instance && mod) {
          mod.free(instance);
        }
        void context?.close();
        recorder = null;
        mediaStream = null;
        instance = null;
        context = null;
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
