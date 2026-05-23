import { getModemCatalogEntry } from "../modems/catalog";
import { getModemDriver } from "../modems/registry";
import type {
  ModemId,
  ModemReceiveOptions,
  ModemSendRequest,
  ModemTuning,
  TransferEstimate,
  TransferPayload,
  TransferProgressHandler,
  TransferResult,
} from "../modems/types";
import { createMessageId } from "./messageId";

export function createTransferPayloadFromText(text: string): TransferPayload {
  return {
    payloadType: "text",
    bytes: new TextEncoder().encode(text),
  };
}

export async function createTransferPayloadFromFile(
  file: File,
): Promise<TransferPayload> {
  const buffer = await file.arrayBuffer();
  return {
    payloadType: "file",
    bytes: new Uint8Array(buffer),
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
  };
}

export async function estimateTransfer(
  payload: TransferPayload,
  modemId: ModemId,
  tuning: ModemTuning,
): Promise<TransferEstimate> {
  const driver = getModemDriver(modemId);
  const plan = driver.planTransfer(payload, tuning);
  const entry = getModemCatalogEntry(modemId);
  return {
    modemId,
    expectedSeconds: plan.airtimeSeconds + plan.encodeOverheadSec,
    expectedBitrateBps: entry.capabilities.estimatedBitrateBps.typical,
  };
}

export async function sendTransfer(
  request: Omit<ModemSendRequest, "messageId">,
  callbacks?: {
    onProgress?: TransferProgressHandler;
    onActivityLog?: ModemReceiveOptions["onActivityLog"];
  },
): Promise<TransferResult> {
  const driver = getModemDriver(request.modemId);
  const messageId = createMessageId();
  return driver.send(
    { ...request, messageId },
    {
      onProgress: callbacks?.onProgress,
      onActivityLog: callbacks?.onActivityLog,
    },
  );
}

export function receiveTransfer(
  options: Omit<ModemReceiveOptions, "onComplete"> & {
    onComplete: (result: TransferResult) => void;
  },
) {
  const driver = getModemDriver(options.modemId);
  return driver.receive(options);
}

export function isMicrophoneCaptureAvailable() {
  return (
    typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia
  );
}
