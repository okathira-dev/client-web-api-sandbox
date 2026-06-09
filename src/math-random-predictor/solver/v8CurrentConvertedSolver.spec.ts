import {
  buildV8CacheLifoConvertedConstraintPlanForOffset,
  type ConvertedObservationConstraintPlan,
} from "../domain/constraints";
import {
  advanceV8State,
  createV8CurrentGeneratorFromSeed,
  floorRandom,
  initializeV8StateFromSeed,
  type V8State,
} from "../domain/v8Current";
import convertedUniqueFixture from "../test-fixtures/convertedUniqueFixture.json";
import convertedUniqueN16Fixture from "../test-fixtures/convertedUniqueN16Fixture.json";
import convertedUniqueUnknownOffsetFixture from "../test-fixtures/convertedUniqueUnknownOffsetFixture.json";
import type { SolverCandidate } from "./types";
import {
  candidateSatisfiesConvertedPlan,
  probeV8CurrentConvertedUniqueness,
  solveV8CurrentConvertedObservations,
} from "./v8CurrentConvertedSolver";

const describeConvertedBitvec =
  process.env.RUN_Z3_CONVERTED_BITVEC === "1" ? describe : describe.skip;

jest.setTimeout(60_000);

/**
 * Z3 候補が制約 plan の mantissa 半開区間を満たすか検証する。
 */
const candidateSatisfiesPlan = (
  candidate: SolverCandidate,
  plan: ConvertedObservationConstraintPlan,
): boolean => {
  for (const constraint of plan.constraints) {
    const state: V8State = advanceV8State(
      candidate.preState,
      constraint.relativeStep,
    );
    const mantissa = state.s0 >> BigInt(plan.rightShiftBits);
    if (
      mantissa < constraint.lowerInclusive ||
      mantissa >= constraint.upperExclusive
    ) {
      return false;
    }
  }
  return true;
};

describe("v8-node-24-cache-lifo-state0 converted solver", () => {
  const createSeed1337Converted = (count: number, n: number) => {
    const generator = createV8CurrentGeneratorFromSeed(1337n);
    return Array.from({ length: count }, () =>
      floorRandom(generator.next(), n),
    );
  };

  it("preview: maxCandidates=2 では観測2個で複数候補を確認できること", async () => {
    const observations = createSeed1337Converted(3, 6);

    const result = await solveV8CurrentConvertedObservations(
      observations.slice(0, 2),
      6,
      {
        cacheOffset: 0,
        maxCandidates: 2,
        timeoutMs: 10_000,
      },
    );

    expect(result.status).toBe("multiple");
    expect(result.candidateCount).toBe(2);
    expect(result.candidatesPreview).toHaveLength(2);
    expect(result.nextPrediction).toBeUndefined();
  });

  it("既知 offset: 観測4個で複数候補と次値候補一覧を返すこと", async () => {
    const observations = createSeed1337Converted(5, 6);

    const result = await solveV8CurrentConvertedObservations(
      observations.slice(0, 4),
      6,
      {
        cacheOffset: 0,
        maxCandidates: 8,
        maxZ3Candidates: 256,
        timeoutMs: 15_000,
      },
    );

    expect(result.status).toBe("multiple");
    expect(result.candidateCount).toBeGreaterThan(0);
    expect(result.nextPredictions.length).toBeGreaterThan(0);
  });

  it("cache offset 不明: 短い観測列で候補を返すこと", async () => {
    const observations = createSeed1337Converted(5, 6);

    const result = await solveV8CurrentConvertedObservations(
      observations.slice(0, 4),
      6,
      {
        maxCandidates: 2,
        timeoutMs: 15_000,
      },
    );

    expect(["multiple", "unique"]).toContain(result.status);
    expect(result.candidateCount).toBeGreaterThan(0);
    const offsets = [
      ...new Set(result.candidates.map((candidate) => candidate.cacheOffset)),
    ];
    expect(offsets.length).toBeGreaterThan(0);
  });

  it("seed 1337 の真の preState は変換系列 plan と次値予測を満たすこと", () => {
    const observations = createSeed1337Converted(5, 6);
    const plan = buildV8CacheLifoConvertedConstraintPlanForOffset(
      observations.slice(0, 4),
      6,
      0,
    );
    const truePreState = advanceV8State(
      initializeV8StateFromSeed(1337n),
      plan.minAbsoluteStep - 1,
    );
    const trueCandidate = {
      cacheOffset: 0,
      preState: truePreState,
      nextPrediction: floorRandom(Number(truePreState.s0 >> 11n) / 2 ** 53, 6),
    };

    expect(candidateSatisfiesPlan(trueCandidate, plan)).toBe(true);
    expect(trueCandidate.nextPrediction).toBe(observations[4]);
  });

  it("返した候補は制約 plan の mantissa 区間を満たすこと", async () => {
    const observations = createSeed1337Converted(3, 6);
    const input = observations.slice(0, 2);
    const plan = buildV8CacheLifoConvertedConstraintPlanForOffset(input, 6, 0);

    const result = await solveV8CurrentConvertedObservations(input, 6, {
      cacheOffset: 0,
      maxCandidates: 4,
      maxZ3Candidates: 64,
      timeoutMs: 10_000,
    });

    expect(result.candidateCount).toBeGreaterThan(0);
    expect(
      result.candidates.every((candidate) =>
        candidateSatisfiesConvertedPlan(candidate.preState, plan),
      ),
    ).toBe(true);
  });

  it("候補数過多: 観測1個の maxCandidates=all は unknown で打ち切ること", async () => {
    const observations = createSeed1337Converted(2, 6);

    const result = await solveV8CurrentConvertedObservations(
      observations.slice(0, 1),
      6,
      {
        cacheOffset: 0,
        maxCandidates: "all",
        timeoutMs: 10_000,
      },
    );

    expect(result.status).toBe("unknown");
    expect(result.reason).toMatch(/全列挙/);
  });

  it("fixture: 探索で得た最小観測数で 2 モデル probe が一意性を確認できること", async () => {
    const { n, cacheOffset, minObservationCount, observations, expectedNext } =
      convertedUniqueFixture;

    const result = await probeV8CurrentConvertedUniqueness(observations, n, {
      cacheOffset,
      z3Fallback: false,
    });

    expect(result.status).toBe("unique");
    expect(result.uniquenessConfirmed).toBe(true);
    expect(result.candidateCount).toBe(1);
    expect(result.nextPrediction).toBe(expectedNext);
    expect(observations).toHaveLength(minObservationCount);
  });

  it("fixture N=16: 最小 32 観測で一意解を確認できること", async () => {
    const { n, cacheOffset, minObservationCount, observations, expectedNext } =
      convertedUniqueN16Fixture;

    const result = await probeV8CurrentConvertedUniqueness(observations, n, {
      cacheOffset,
      z3Fallback: true,
    });

    expect(result.status).toBe("unique");
    expect(result.uniquenessConfirmed).toBe(true);
    expect(result.candidateCount).toBe(1);
    expect(result.nextPrediction).toBe(expectedNext);
    expect(observations).toHaveLength(minObservationCount);
  });

  it("fixture: cache offset 不明でも optimized で真の次値候補を返すこと", async () => {
    const { n, minObservationCount, observations, expectedNext } =
      convertedUniqueFixture;

    const result = await solveV8CurrentConvertedObservations(observations, n, {
      cacheOffset: "unknown",
      maxCandidates: 64,
      z3Fallback: false,
    });

    expect(["multiple", "unique"]).toContain(result.status);
    expect(observations).toHaveLength(minObservationCount);
    const matching = result.candidates.filter(
      (candidate) => candidate.nextPrediction === expectedNext,
    );
    expect(matching).toHaveLength(1);
    expect(matching[0]?.cacheOffset).toBe(0);
  });

  it("fixture: cache offset 不明・64 観測で一意解を確認できること", async () => {
    const { n, cacheOffset, minObservationCount, observations, expectedNext } =
      convertedUniqueUnknownOffsetFixture;

    expect(cacheOffset).toBe("unknown");

    const result = await probeV8CurrentConvertedUniqueness(observations, n, {
      cacheOffset: "unknown",
      z3Fallback: false,
    });

    expect(result.status).toBe("unique");
    expect(result.uniquenessConfirmed).toBe(true);
    expect(result.candidateCount).toBe(1);
    expect(result.nextPrediction).toBe(expectedNext);
    expect(observations).toHaveLength(minObservationCount);
  });

  describeConvertedBitvec("bitvec strategy", () => {
    it("fixture: Z3 bitvec でも一意解を確認できること", async () => {
      const { n, cacheOffset, observations, expectedNext } =
        convertedUniqueFixture;

      const result = await solveV8CurrentConvertedObservations(
        observations,
        n,
        {
          strategy: "bitvec",
          cacheOffset,
          timeoutMs: 30_000,
          z3Fallback: false,
        },
      );

      expect(result.status).toBe("unique");
      expect(result.candidateCount).toBe(1);
      expect(result.nextPrediction).toBe(expectedNext);
    });
  });

  it("不正な観測値は solver に渡す前にエラーにすること", async () => {
    await expect(
      solveV8CurrentConvertedObservations([0, 6], 6, {
        cacheOffset: 0,
      }),
    ).rejects.toThrow("観測値は 0..5 の整数である必要があります。");
  });
});
