import CRC32 from "crc-32";
import type { PayloadType } from "../modems/types";
import { MODEM_ORDER, type ModemId } from "../modems/types";

const FRAME_MAGIC = "ATLV";

function modemToIndex(modemId: ModemId) {
  const index = MODEM_ORDER.indexOf(modemId);
  if (index < 0) throw new Error(`unknown modem: ${modemId}`);
  return index;
}

function indexToModem(index: number): ModemId {
  const modemId = MODEM_ORDER[index];
  if (!modemId) throw new Error(`invalid modem index: ${index}`);
  return modemId;
}

export interface FramePayload {
  version: 3;
  messageId: string;
  modemId: ModemId;
  payloadType: PayloadType;
  fileName?: string;
  mimeType?: string;
  bytes: Uint8Array;
}

export function buildFrame(payload: FramePayload) {
  const encoder = new TextEncoder();
  const messageIdBytes = encoder.encode(payload.messageId.slice(0, 48));
  const fileNameBytes =
    payload.payloadType === "file"
      ? encoder.encode(payload.fileName ?? "received.bin")
      : new Uint8Array(0);
  const mimeBytes =
    payload.payloadType === "file"
      ? encoder.encode(payload.mimeType ?? "application/octet-stream")
      : new Uint8Array(0);

  const bodyLen =
    1 +
    1 +
    1 +
    1 +
    messageIdBytes.length +
    (payload.payloadType === "file"
      ? 4 + fileNameBytes.length + mimeBytes.length
      : 0) +
    4 +
    payload.bytes.length;

  const out = new Uint8Array(4 + bodyLen + 4);
  out.set(encoder.encode(FRAME_MAGIC), 0);
  let offset = 4;
  out[offset] = payload.version;
  offset += 1;
  out[offset] = modemToIndex(payload.modemId);
  offset += 1;
  out[offset] = payload.payloadType === "file" ? 1 : 0;
  offset += 1;
  out[offset] = messageIdBytes.length;
  offset += 1;
  out.set(messageIdBytes, offset);
  offset += messageIdBytes.length;

  const view = new DataView(out.buffer, out.byteOffset, out.byteLength);
  if (payload.payloadType === "file") {
    view.setUint16(offset, fileNameBytes.length, false);
    offset += 2;
    out.set(fileNameBytes, offset);
    offset += fileNameBytes.length;
    view.setUint16(offset, mimeBytes.length, false);
    offset += 2;
    out.set(mimeBytes, offset);
    offset += mimeBytes.length;
  }

  view.setUint32(offset, payload.bytes.length, false);
  offset += 4;
  out.set(payload.bytes, offset);
  offset += payload.bytes.length;

  const crc = CRC32.buf(out.slice(4, offset)) >>> 0;
  view.setUint32(offset, crc, false);
  return out;
}

export function parseFrame(frameBytes: Uint8Array): FramePayload {
  if (frameBytes.length < 12) {
    throw new Error("frame too short");
  }
  const magic = new TextDecoder().decode(frameBytes.slice(0, 4));
  if (magic !== FRAME_MAGIC) {
    throw new Error("invalid frame magic");
  }

  const view = new DataView(
    frameBytes.buffer,
    frameBytes.byteOffset,
    frameBytes.byteLength,
  );
  let offset = 4;
  const version = frameBytes[offset] ?? 0;
  if (version !== 3) {
    throw new Error(`unsupported frame version: ${version}`);
  }
  offset += 1;
  const modemId = indexToModem(frameBytes[offset] ?? 0);
  offset += 1;
  const payloadType: PayloadType =
    (frameBytes[offset] ?? 0) === 1 ? "file" : "text";
  offset += 1;
  const messageIdLen = frameBytes[offset] ?? 0;
  offset += 1;
  const messageId = new TextDecoder().decode(
    frameBytes.slice(offset, offset + messageIdLen),
  );
  offset += messageIdLen;

  let fileName: string | undefined;
  let mimeType: string | undefined;
  if (payloadType === "file") {
    const fileNameLen = view.getUint16(offset, false);
    offset += 2;
    fileName = new TextDecoder().decode(
      frameBytes.slice(offset, offset + fileNameLen),
    );
    offset += fileNameLen;
    const mimeLen = view.getUint16(offset, false);
    offset += 2;
    mimeType = new TextDecoder().decode(
      frameBytes.slice(offset, offset + mimeLen),
    );
    offset += mimeLen;
  }

  const payloadLen = view.getUint32(offset, false);
  offset += 4;
  const bytes = frameBytes.slice(offset, offset + payloadLen);
  offset += payloadLen;

  const expectedCrc = view.getUint32(offset, false);
  const actualCrc = CRC32.buf(frameBytes.slice(4, offset)) >>> 0;
  if (expectedCrc !== actualCrc) {
    throw new Error("frame CRC mismatch");
  }

  return {
    version: 3,
    messageId,
    modemId,
    payloadType,
    fileName,
    mimeType,
    bytes,
  };
}

export function frameToArrayBuffer(frameBytes: Uint8Array) {
  const copy = new Uint8Array(frameBytes);
  return copy.buffer.slice(copy.byteOffset, copy.byteOffset + copy.byteLength);
}

export function arrayBufferToFrameBytes(buffer: ArrayBuffer) {
  return new Uint8Array(buffer);
}
