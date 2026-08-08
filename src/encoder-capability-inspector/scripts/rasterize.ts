/**
 * 描画命令を RGB の画素列へ起こす（Node 側）。
 *
 * ブラウザーでは `utils/syntheticCanvas.ts` が Canvas 2D へ同じ命令を描く。
 * 命令が「整数座標の矩形塗り」と「等倍のタイル貼り」だけに限られているのは、
 * 両方の実装で同じ画素を得るためで、拡縮や合成は入れない。
 */

import {
  createNoiseTiles,
  type DrawOp,
  NOISE_TILE_SIZE,
} from "../domain/synthetic.ts";

const BYTES_PER_PIXEL = 3;

const tiles = createNoiseTiles();

const fillRect = (
  pixels: Uint8Array,
  width: number,
  height: number,
  op: Extract<DrawOp, { kind: "fill" }>,
): void => {
  const left = Math.max(0, op.x);
  const top = Math.max(0, op.y);
  const right = Math.min(width, op.x + op.width);
  const bottom = Math.min(height, op.y + op.height);
  const [red, green, blue] = op.color;

  for (let y = top; y < bottom; y += 1) {
    let offset = (y * width + left) * BYTES_PER_PIXEL;
    for (let x = left; x < right; x += 1) {
      pixels[offset] = red;
      pixels[offset + 1] = green;
      pixels[offset + 2] = blue;
      offset += BYTES_PER_PIXEL;
    }
  }
};

const blitTile = (
  pixels: Uint8Array,
  width: number,
  height: number,
  op: Extract<DrawOp, { kind: "tile" }>,
): void => {
  const tile = tiles[op.tileIndex];
  if (!tile) return;

  for (let row = 0; row < NOISE_TILE_SIZE; row += 1) {
    const y = op.y + row;
    if (y < 0 || y >= height) continue;
    for (let column = 0; column < NOISE_TILE_SIZE; column += 1) {
      const x = op.x + column;
      if (x < 0 || x >= width) continue;
      // タイルは RGBA だが不透明と決めてあるので、そのまま置き換える。
      const source = (row * NOISE_TILE_SIZE + column) * 4;
      const target = (y * width + x) * BYTES_PER_PIXEL;
      pixels[target] = tile[source] ?? 0;
      pixels[target + 1] = tile[source + 1] ?? 0;
      pixels[target + 2] = tile[source + 2] ?? 0;
    }
  }
};

export const rasterizeFrame = (
  ops: readonly DrawOp[],
  width: number,
  height: number,
): Uint8Array => {
  const pixels = new Uint8Array(width * height * BYTES_PER_PIXEL);
  for (const op of ops) {
    if (op.kind === "fill") fillRect(pixels, width, height, op);
    else blitTile(pixels, width, height, op);
  }
  return pixels;
};
