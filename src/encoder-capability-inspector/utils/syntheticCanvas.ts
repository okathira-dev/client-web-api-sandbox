/**
 * 合成パターンの描画命令をキャンバスへ描く。
 *
 * 検査ワーカー（`OffscreenCanvas`）とプレビュー UI（`HTMLCanvasElement`）の
 * どちらからも同じ命令を同じ手順で描きたいので、context は構造的に受ける。
 *
 * アンチエイリアスや補間が挟まると環境ごとに画素が変わるため、
 * 塗りは整数座標の矩形、タイルは等倍の貼り付けだけに限っている。
 * これは Node 側のサンプル出力（`scripts/`）と同じ絵にするための約束でもある。
 */

import {
  createNoiseTiles,
  type DrawOp,
  NOISE_TILE_SIZE,
  type Rgb,
} from "../domain/synthetic";

/** 2D context のうち、合成パターンの描画で使う部分だけ。 */
export type SyntheticDrawContext = CanvasFillStrokeStyles &
  CanvasRect &
  CanvasDrawImage;

const toCssColor = ([red, green, blue]: Rgb): string =>
  `#${((red << 16) | (green << 8) | blue).toString(16).padStart(6, "0")}`;

/**
 * ノイズタイルを描画に使える形へ起こす。
 * 検査 1 回のあいだ使い回す想定で、フレームごとには作り直さない。
 */
export const createNoiseTileCanvases = (): OffscreenCanvas[] =>
  createNoiseTiles().map((pixels) => {
    const canvas = new OffscreenCanvas(NOISE_TILE_SIZE, NOISE_TILE_SIZE);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("offscreen-canvas-2d-unavailable");
    context.putImageData(
      new ImageData(pixels, NOISE_TILE_SIZE, NOISE_TILE_SIZE),
      0,
      0,
    );
    return canvas;
  });

export const drawFrameOps = (
  context: SyntheticDrawContext,
  ops: readonly DrawOp[],
  tiles: readonly CanvasImageSource[],
): void => {
  for (const op of ops) {
    if (op.kind === "fill") {
      context.fillStyle = toCssColor(op.color);
      context.fillRect(op.x, op.y, op.width, op.height);
      continue;
    }
    const tile = tiles[op.tileIndex];
    if (tile) context.drawImage(tile, op.x, op.y);
  }
};
