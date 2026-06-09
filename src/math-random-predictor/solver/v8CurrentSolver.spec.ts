import {
  createV8CurrentGeneratorFromSeed,
  floorRandom,
} from "../domain/v8Current";
import { solveV8CurrentObservations } from "./v8CurrentSolver";

jest.setTimeout(60_000);

describe("v8CurrentSolver", () => {
  it("raw 入力では GF(2) raw solver を呼び出すこと", async () => {
    const generator = createV8CurrentGeneratorFromSeed(1337n);
    const observations = Array.from({ length: 4 }, () => generator.next());
    const expectedNext = generator.next();

    const result = await solveV8CurrentObservations(
      { kind: "raw", observations },
      { cacheOffset: 0, maxCandidates: 2 },
    );

    expect(result.status).toBe("unique");
    expect(result.nextPrediction).toBe(expectedNext);
  });

  it("converted 入力では Z3 converted solver を呼び出すこと", async () => {
    const generator = createV8CurrentGeneratorFromSeed(1337n);
    const observations = Array.from({ length: 3 }, () =>
      floorRandom(generator.next(), 6),
    );

    const result = await solveV8CurrentObservations(
      { kind: "converted", observations: observations.slice(0, 2), n: 6 },
      { cacheOffset: 0, maxCandidates: 2, timeoutMs: 15_000 },
    );

    expect(result.status).toBe("multiple");
    expect(result.candidateCount).toBe(2);
  });
});
