import { buildFrame, parseFrame } from "../pipeline/frame";
import { createMessageId } from "../pipeline/messageId";
import type {
  ModemDriver,
  ModemSendRequest,
  ModemTuning,
  TransferPayload,
  TransferResult,
} from "./types";

export function payloadToFrame(request: ModemSendRequest): Uint8Array {
  return buildFrame({
    version: 3,
    messageId: request.messageId,
    modemId: request.modemId,
    payloadType: request.payload.payloadType,
    fileName: request.payload.fileName,
    mimeType: request.payload.mimeType,
    bytes: request.payload.bytes,
  });
}

export function frameToTransferResult(
  frameBytes: Uint8Array,
  partial: Omit<
    TransferResult,
    | "messageId"
    | "payloadType"
    | "payloadSizeBytes"
    | "decodedText"
    | "decodedFile"
    | "success"
  >,
): TransferResult {
  const parsed = parseFrame(frameBytes);
  const base: TransferResult = {
    ...partial,
    messageId: parsed.messageId,
    payloadType: parsed.payloadType,
    payloadSizeBytes: parsed.bytes.length,
    success: true,
  };
  if (parsed.payloadType === "text") {
    return {
      ...base,
      decodedText: new TextDecoder().decode(parsed.bytes),
    };
  }
  return {
    ...base,
    decodedFile: {
      fileName: parsed.fileName ?? "received.bin",
      mimeType: parsed.mimeType ?? "application/octet-stream",
      bytes: parsed.bytes,
    },
  };
}

export function createFailedResult(
  modemId: TransferResult["modemId"],
  role: TransferResult["role"],
  tuning: ModemTuning,
  error: unknown,
  startedAt: number,
  expectedSeconds: number,
): TransferResult {
  const finishedAt = Date.now();
  return {
    modemId,
    role,
    messageId: createMessageId(),
    payloadType: "text",
    payloadSizeBytes: 0,
    expectedSeconds,
    actualSeconds: (finishedAt - startedAt) / 1000,
    throughputBps: 0,
    success: false,
    errorMessage: String(error),
    startedAt,
    finishedAt,
    tuningSnapshot: { ...tuning },
  };
}

export function estimateFrameBytes(
  payload: TransferPayload,
  modemId: TransferResult["modemId"],
) {
  return buildFrame({
    version: 3,
    messageId: "estimate",
    modemId,
    payloadType: payload.payloadType,
    fileName: payload.fileName,
    mimeType: payload.mimeType,
    bytes: payload.bytes,
  });
}

export function mergeDriverBase(
  entry: ModemDriver["entry"],
  getDefaultTuning: () => ModemTuning,
  applyPreset: ModemDriver["applyPreset"],
): Pick<ModemDriver, "entry" | "getDefaultTuning" | "applyPreset"> {
  return { entry, getDefaultTuning, applyPreset };
}
