import convertedUniqueFixture from "../test-fixtures/convertedUniqueFixture.json";
import { solveV8CurrentConvertedObservationsOptimized } from "./v8CurrentConvertedOptimizedSolver";
import { solveV8CurrentConvertedObservationsWithBitVecZ3 } from "./v8CurrentConvertedZ3Solver";

const describeBench =
  process.env.RUN_CONVERTED_BENCH === "1" ? describe : describe.skip;

const median = (values: readonly number[]): number => {
  const sorted = [...values].sort((left, right) => left - right);
  const mid = Math.floor(sorted.length / 2);
  return sorted[mid] ?? 0;
};

describeBench("converted solver benchmark", () => {
  jest.setTimeout(120_000);

  it("optimized vs bitvec: fixture 12 観測", async () => {
    const { n, cacheOffset, observations } = convertedUniqueFixture;
    const optimizedSamples: number[] = [];
    const bitvecSamples: number[] = [];

    for (let i = 0; i < 5; i++) {
      const optimizedStart = performance.now();
      solveV8CurrentConvertedObservationsOptimized(observations, n, {
        cacheOffset,
      });
      optimizedSamples.push(performance.now() - optimizedStart);

      const bitvecStart = performance.now();
      await solveV8CurrentConvertedObservationsWithBitVecZ3(observations, n, {
        cacheOffset,
        timeoutMs: 30_000,
      });
      bitvecSamples.push(performance.now() - bitvecStart);
    }

    const optimizedMs = median(optimizedSamples);
    const bitvecMs = median(bitvecSamples);
    console.info(
      `converted bench n=${n} obs=${observations.length}: optimized=${optimizedMs.toFixed(2)}ms bitvec=${bitvecMs.toFixed(2)}ms`,
    );
    expect(optimizedMs).toBeLessThan(bitvecMs);
  });
});
