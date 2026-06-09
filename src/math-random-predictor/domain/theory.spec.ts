import {
  estimateConvertedObservationProgress,
  estimateRawObservationProgress,
} from "./theory";

describe("theory", () => {
  it("生系列の理論的な残り不確実性を概算できること", () => {
    expect(estimateRawObservationProgress(0)).toEqual({
      observationCount: 0,
      modelId: "v8-node-24-cache-lifo-state0",
      stateBits: 128,
      observationBits: 53,
      observedBits: 0,
      remainingBits: 128,
      estimatedCandidateCount: "2^128",
      estimatedRemainingRawObservations: 3,
    });
    expect(estimateRawObservationProgress(3)).toEqual({
      observationCount: 3,
      modelId: "v8-node-24-cache-lifo-state0",
      stateBits: 128,
      observationBits: 53,
      observedBits: 159,
      remainingBits: 0,
      estimatedCandidateCount: "1",
      estimatedRemainingRawObservations: 0,
    });
  });

  it("変換系列の理論的な残り不確実性を概算できること", () => {
    const progress = estimateConvertedObservationProgress(4, 6);
    expect(progress.n).toBe(6);
    expect(progress.observationCount).toBe(4);
    expect(progress.bitsPerObservation).toBeCloseTo(Math.log2(6));
    expect(progress.remainingBits).toBeGreaterThan(0);
  });
});
