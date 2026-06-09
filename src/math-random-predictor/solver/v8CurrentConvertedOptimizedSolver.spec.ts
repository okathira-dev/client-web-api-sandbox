import {
  createV8CurrentGeneratorFromSeed,
  floorRandom,
} from "../domain/v8Current";
import convertedUniqueFixture from "../test-fixtures/convertedUniqueFixture.json";
import { solveV8CurrentConvertedObservationsOptimized } from "./v8CurrentConvertedOptimizedSolver";

describe("v8CurrentConvertedOptimizedSolver", () => {
  it("fixture: GF(2)+TS のみで一意解を返すこと", () => {
    const { n, cacheOffset, observations, expectedNext } =
      convertedUniqueFixture;

    const result = solveV8CurrentConvertedObservationsOptimized(
      observations,
      n,
      { cacheOffset },
    );

    expect(result.status).toBe("unique");
    expect(result.candidateCount).toBe(1);
    expect(result.nextPrediction).toBe(expectedNext);
  });

  it("小さい N では自由変数が多く unknown になること", () => {
    const generator = createV8CurrentGeneratorFromSeed(1337n);
    const observations = Array.from({ length: 2 }, () =>
      floorRandom(generator.next(), 6),
    );

    const result = solveV8CurrentConvertedObservationsOptimized(
      observations,
      6,
      { cacheOffset: 0, maxCandidates: 2 },
    );

    expect(result.status).toBe("unknown");
    expect(result.reason).toMatch(/自由変数/);
  });
});
