/** 実用継続検査を始める前に、どれだけメモリを抱えることになるかを見積もる。 */

import type { UnitResult } from "./types";

/**
 * 検査中にワーカーが保持する出力の量。
 *
 * デコード検証と多重化のために、1 候補ぶんのエンコード済みチャンクを最後まで抱える。
 * 候補は 1 件ずつ順に処理し、終わるたびに解放するので、山になるのは
 * 「いちばんビットレートの高い候補 1 件ぶん」であって、選択した全候補の合計ではない。
 *
 * 実際の出力量はエンコーダー次第で要求ビットレートちょうどにはならないが、
 * 桁を掴むにはこれで足りる。
 */
export const estimateRetainedBytes = (
  results: readonly UnitResult[],
  durationSeconds: number,
): number => {
  const peakBitrate = results.reduce(
    (highest, result) => Math.max(highest, result.requestedConfig.bitrate ?? 0),
    0,
  );
  return Math.round((peakBitrate * durationSeconds) / 8);
};
