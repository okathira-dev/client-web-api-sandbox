/**
 * PNG / APNG の書き出し。
 *
 * 合成パターンをレビューできる形で残すためだけの最小限の実装で、
 * 8bit・RGB・非インターレースしか作らない。`node:zlib` の deflate と crc32 だけで
 * 完結させ、この用途のために追加の依存を持ち込まないようにしている。
 *
 * 仕様: https://www.w3.org/TR/png-3/
 */

import { crc32, deflateSync } from "node:zlib";

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** RGB 8bit なので 1 画素 3 バイト。フィルターの参照距離もこれになる。 */
const BYTES_PER_PIXEL = 3;

const toChunk = (type: string, data: Buffer): Buffer => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "latin1"), data]);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(body) >>> 0);
  return Buffer.concat([length, body, checksum]);
};

const paethPredictor = (left: number, up: number, upLeft: number): number => {
  const estimate = left + up - upLeft;
  const distanceLeft = Math.abs(estimate - left);
  const distanceUp = Math.abs(estimate - up);
  const distanceUpLeft = Math.abs(estimate - upLeft);
  if (distanceLeft <= distanceUp && distanceLeft <= distanceUpLeft) return left;
  return distanceUp <= distanceUpLeft ? up : upLeft;
};

/**
 * 走査線ごとに 5 種類のフィルターを試し、絶対値の合計が最小のものを選ぶ。
 * PNG の標準的な発見的手法で、平坦な塗りと粒状ノイズが混在する今回の絵によく効く。
 */
const filterScanlines = (
  pixels: Uint8Array,
  width: number,
  height: number,
): Buffer => {
  const stride = width * BYTES_PER_PIXEL;
  const output = Buffer.alloc((stride + 1) * height);
  const candidate = Buffer.alloc(stride);
  const best = Buffer.alloc(stride);

  for (let y = 0; y < height; y += 1) {
    const rowStart = y * stride;
    let bestType = 0;
    let bestScore = Number.POSITIVE_INFINITY;

    for (let type = 0; type < 5; type += 1) {
      let score = 0;
      for (let index = 0; index < stride; index += 1) {
        const raw = pixels[rowStart + index] ?? 0;
        const left =
          index >= BYTES_PER_PIXEL
            ? (pixels[rowStart + index - BYTES_PER_PIXEL] ?? 0)
            : 0;
        const up = y > 0 ? (pixels[rowStart - stride + index] ?? 0) : 0;
        const upLeft =
          y > 0 && index >= BYTES_PER_PIXEL
            ? (pixels[rowStart - stride + index - BYTES_PER_PIXEL] ?? 0)
            : 0;

        const value =
          type === 0
            ? raw
            : type === 1
              ? raw - left
              : type === 2
                ? raw - up
                : type === 3
                  ? raw - ((left + up) >> 1)
                  : raw - paethPredictor(left, up, upLeft);

        const byte = value & 0xff;
        candidate[index] = byte;
        // 符号付きとして見たときの大きさが小さいほど、後段の deflate が効く。
        score += byte < 128 ? byte : 256 - byte;
      }
      if (score < bestScore) {
        bestScore = score;
        bestType = type;
        candidate.copy(best);
      }
    }

    output[y * (stride + 1)] = bestType;
    best.copy(output, y * (stride + 1) + 1);
  }

  return output;
};

const buildHeader = (width: number, height: number): Buffer => {
  const data = Buffer.alloc(13);
  data.writeUInt32BE(width, 0);
  data.writeUInt32BE(height, 4);
  data[8] = 8; // ビット深度
  data[9] = 2; // カラータイプ: トゥルーカラー
  data[10] = 0; // 圧縮方式: deflate
  data[11] = 0; // フィルター方式
  data[12] = 0; // 非インターレース
  return data;
};

const compress = (pixels: Uint8Array, width: number, height: number): Buffer =>
  deflateSync(filterScanlines(pixels, width, height), { level: 9 });

/** RGB の画素列（`width * height * 3`）から静止 PNG を作る。 */
export const encodePng = (
  pixels: Uint8Array,
  width: number,
  height: number,
): Buffer =>
  Buffer.concat([
    SIGNATURE,
    toChunk("IHDR", buildHeader(width, height)),
    toChunk("IDAT", compress(pixels, width, height)),
    toChunk("IEND", Buffer.alloc(0)),
  ]);

const buildAnimationControl = (frameCount: number): Buffer => {
  const data = Buffer.alloc(8);
  data.writeUInt32BE(frameCount, 0);
  data.writeUInt32BE(0, 4); // 0 は無限再生。
  return data;
};

const buildFrameControl = ({
  sequence,
  width,
  height,
  delayNumerator,
  delayDenominator,
}: {
  sequence: number;
  width: number;
  height: number;
  delayNumerator: number;
  delayDenominator: number;
}): Buffer => {
  const data = Buffer.alloc(26);
  data.writeUInt32BE(sequence, 0);
  data.writeUInt32BE(width, 4);
  data.writeUInt32BE(height, 8);
  data.writeUInt32BE(0, 12); // x_offset
  data.writeUInt32BE(0, 16); // y_offset
  data.writeUInt16BE(delayNumerator, 20);
  data.writeUInt16BE(delayDenominator, 22);
  data[24] = 0; // dispose_op: APNG_DISPOSE_OP_NONE
  data[25] = 0; // blend_op: APNG_BLEND_OP_SOURCE
  return data;
};

/**
 * 全フレームが同じ大きさで、前フレームを完全に置き換える APNG を作る。
 * 差分矩形は使わない（パターンが画面全体で変わるので効かない）。
 *
 * 仕様: https://www.w3.org/TR/png-3/#5APNG
 */
export const encodeApng = ({
  frames,
  width,
  height,
  delayNumerator,
  delayDenominator,
}: {
  frames: readonly Uint8Array[];
  width: number;
  height: number;
  delayNumerator: number;
  delayDenominator: number;
}): Buffer => {
  const [first, ...rest] = frames;
  if (!first) throw new Error("apng-needs-at-least-one-frame");

  const parts: Buffer[] = [
    SIGNATURE,
    toChunk("IHDR", buildHeader(width, height)),
    toChunk("acTL", buildAnimationControl(frames.length)),
  ];

  // fcTL と fdAT は通し番号を共有する。先頭フレームだけは IDAT として置く。
  let sequence = 0;
  parts.push(
    toChunk(
      "fcTL",
      buildFrameControl({
        sequence: sequence++,
        width,
        height,
        delayNumerator,
        delayDenominator,
      }),
    ),
    toChunk("IDAT", compress(first, width, height)),
  );

  for (const frame of rest) {
    parts.push(
      toChunk(
        "fcTL",
        buildFrameControl({
          sequence: sequence++,
          width,
          height,
          delayNumerator,
          delayDenominator,
        }),
      ),
    );
    const sequenceNumber = Buffer.alloc(4);
    sequenceNumber.writeUInt32BE(sequence++);
    parts.push(
      toChunk(
        "fdAT",
        Buffer.concat([sequenceNumber, compress(frame, width, height)]),
      ),
    );
  }

  parts.push(toChunk("IEND", Buffer.alloc(0)));
  return Buffer.concat(parts);
};
