/** AAC の `AudioSpecificConfig` を検査する小さな読み取り器。 */

const readBits = (
  bytes: Uint8Array,
  offset: number,
  length: number,
): number | null => {
  if (offset + length > bytes.byteLength * 8) return null;
  let value = 0;
  for (let index = 0; index < length; index += 1) {
    const bitOffset = offset + index;
    const byte = bytes[Math.floor(bitOffset / 8)] ?? 0;
    value = (value << 1) | ((byte >> (7 - (bitOffset % 8))) & 1);
  }
  return value;
};

const asBytes = (
  description: AllowSharedBufferSource | undefined,
): Uint8Array | null => {
  if (!description) return null;
  if (ArrayBuffer.isView(description)) {
    return new Uint8Array(
      description.buffer,
      description.byteOffset,
      description.byteLength,
    );
  }
  return new Uint8Array(description);
};

/**
 * `audioObjectType` は最初の 5 bit、31 は 6 bit の拡張表現である。
 * 完全な ASC の検証ではなく、要求した AAC profile が実際に出力されたかの照合だけを行う。
 */
export const readAacAudioObjectType = (
  description: AllowSharedBufferSource | undefined,
): number | null => {
  const bytes = asBytes(description);
  if (!bytes) return null;
  const initial = readBits(bytes, 0, 5);
  if (initial === null) return null;
  if (initial !== 31) return initial;
  const extension = readBits(bytes, 5, 6);
  return extension === null ? null : 32 + extension;
};
