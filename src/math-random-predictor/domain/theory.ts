import { V8_CURRENT_MODEL, type V8ModelMetadata } from "./v8Current";

export type RawObservationProgress = {
  readonly observationCount: number;
  readonly modelId: string;
  readonly stateBits: number;
  readonly observationBits: number;
  readonly observedBits: number;
  readonly remainingBits: number;
  readonly estimatedCandidateCount: string;
  readonly estimatedRemainingRawObservations: number;
};

/**
 * 残り bit 数を、概算候補数として表示しやすい文字列へ変換する。
 */
const formatCandidateCount = (remainingBits: number): string => {
  if (remainingBits === 0) {
    return "1";
  }
  return `2^${remainingBits}`;
};

/**
 * raw observation の件数から、PRNG state が理論上どの程度絞れるかを概算する。
 *
 * 実際の solver rank や cache offset の曖昧さは考慮せず、
 * `stateBits - observationCount * outputBits` という情報量ベースの目安を返す。
 */
export type ConvertedObservationProgress = RawObservationProgress & {
  readonly n: number;
  readonly bitsPerObservation: number;
};

/**
 * 変換系列の件数と `N` から、理論上の残り不確実性を概算する。
 *
 * 1 観測あたりの情報量を `log2(N)` bit とみなす保守的な目安。
 */
export const estimateConvertedObservationProgress = (
  observationCount: number,
  n: number,
  model: V8ModelMetadata = V8_CURRENT_MODEL,
): ConvertedObservationProgress => {
  if (!Number.isInteger(n) || n < 2) {
    throw new Error("N は 2 以上の整数が必要です。");
  }
  if (!Number.isInteger(observationCount) || observationCount < 0) {
    throw new Error("観測数は 0 以上の整数である必要があります。");
  }
  const bitsPerObservation = Math.log2(n);
  const observedBits = observationCount * bitsPerObservation;
  const remainingBits = Math.max(0, model.stateBits - observedBits);
  return {
    observationCount,
    n,
    bitsPerObservation,
    modelId: model.id,
    stateBits: model.stateBits,
    observationBits: model.outputBits,
    observedBits,
    remainingBits,
    estimatedCandidateCount: formatCandidateCount(remainingBits),
    estimatedRemainingRawObservations: Math.ceil(
      remainingBits / bitsPerObservation,
    ),
  };
};

export const estimateRawObservationProgress = (
  observationCount: number,
  model: V8ModelMetadata = V8_CURRENT_MODEL,
): RawObservationProgress => {
  if (!Number.isInteger(observationCount) || observationCount < 0) {
    throw new Error("観測数は 0 以上の整数である必要があります。");
  }
  const observedBits = observationCount * model.outputBits;
  const remainingBits = Math.max(0, model.stateBits - observedBits);
  return {
    observationCount,
    modelId: model.id,
    stateBits: model.stateBits,
    observationBits: model.outputBits,
    observedBits,
    remainingBits,
    estimatedCandidateCount: formatCandidateCount(remainingBits),
    estimatedRemainingRawObservations: Math.ceil(
      remainingBits / model.outputBits,
    ),
  };
};
