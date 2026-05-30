import { createV8CurrentGeneratorFromSeed } from "../domain/v8Current";
import { solveV8CurrentRawObservations } from "./v8CurrentNodeSolver";

jest.setTimeout(30_000);

describe("v8-node-24-cache-lifo-state0 raw solver", () => {
  const createSeed1337Values = (count: number) => {
    const generator = createV8CurrentGeneratorFromSeed(1337n);
    return Array.from({ length: count }, () => generator.next());
  };

  const corruptLastObservation = (
    observations: readonly number[],
  ): number[] => {
    const corrupted = [...observations];
    const lastIndex = corrupted.length - 1;
    const lastValue = corrupted[lastIndex];
    if (lastValue === undefined) {
      throw new Error("corruption target is empty");
    }
    corrupted[lastIndex] = (lastValue + 0.5) % 1;
    return corrupted;
  };

  const uniqueCacheOffsets = (result: {
    readonly candidates: readonly { readonly cacheOffset?: number }[];
  }) => [
    ...new Set(result.candidates.map((candidate) => candidate.cacheOffset)),
  ];

  it("cache offset が既知なら短い生系列から候補を一意に絞り、次の観測値を予測できること", async () => {
    const values = createSeed1337Values(5);

    const result = await solveV8CurrentRawObservations(values.slice(0, 4), {
      cacheOffset: 0,
      maxCandidates: 2,
      timeoutMs: 10_000,
    });

    expect(result.status).toBe("unique");
    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0]?.cacheOffset).toBe(0);
    expect(result.unique).toBe(true);
    expect(result.uniqueConfirmed).toBe(true);
    expect(result.candidateCount).toBe(1);
    expect(result.nextPrediction).toBe(values[4]);
  });

  it("maxCandidates=2 では観測3個でも候補が複数あることだけを preview できること", async () => {
    const values = createSeed1337Values(4);

    const result = await solveV8CurrentRawObservations(values.slice(0, 3), {
      maxCandidates: 2,
      timeoutMs: 10_000,
    });

    expect(result.status).toBe("multiple");
    expect(result.unique).toBe(false);
    expect(result.candidateCount).toBe(2);
    expect(result.candidatesPreview).toHaveLength(2);
    expect(result.nextPrediction).toBeUndefined();
  });

  it("maxCandidates=all では観測4個で offset ごとに唯一の internal state を全列挙できること", async () => {
    const values = createSeed1337Values(5);

    const result = await solveV8CurrentRawObservations(values.slice(0, 4), {
      maxCandidates: "all",
    });

    expect(result.status).toBe("multiple");
    expect(result.candidateCount).toBe(2);
    expect(result.candidatesPreview).toHaveLength(2);
    expect(uniqueCacheOffsets(result)).toEqual([0, 60]);
  });

  const skipSlowSolverTests = process.env.SKIP_SLOW_SOLVER_TESTS === "1";
  const exhaustiveThreeObservationsTest = skipSlowSolverTests ? it.skip : it;

  exhaustiveThreeObservationsTest(
    "maxCandidates=all では観測3個で internal state を全列挙できること（手元計測 ~60ms、SKIP_SLOW_SOLVER_TESTS=1 で省略）",
    async () => {
      const values = createSeed1337Values(4);

      const result = await solveV8CurrentRawObservations(values.slice(0, 3), {
        maxCandidates: "all",
      });

      expect(result.status).toBe("multiple");
      expect(result.candidateCount).toBe(4096);
      expect(result.candidatesPreview).toHaveLength(4096);
      expect(uniqueCacheOffsets(result)).toEqual([0, 61]);
    },
  );

  it("maxCandidates=all でも候補数が大きすぎる場合は unknown を返すこと", async () => {
    const values = createSeed1337Values(2);

    const result = await solveV8CurrentRawObservations(values.slice(0, 1), {
      maxCandidates: "all",
    });

    expect(result.status).toBe("unknown");
    expect(result.reason).toBe("候補数が多すぎるため全列挙できません。");
  });

  it("maxCandidates=all では一意に絞れる既知 offset の全候補を確認できること", async () => {
    const values = createSeed1337Values(5);

    const result = await solveV8CurrentRawObservations(values.slice(0, 4), {
      cacheOffset: 0,
      maxCandidates: "all",
      timeoutMs: 10_000,
    });

    expect(result.status).toBe("unique");
    expect(result.candidateCount).toBe(1);
    expect(result.candidates).toHaveLength(1);
    expect(result.nextPrediction).toBe(values[4]);
  });

  it.each([
    {
      label: "境界をまたがない観測列で候補が一つに絞れる",
      observations: (values: readonly number[]) => values.slice(0, 64),
      maxCandidates: "all" as const,
      expectedStatus: "unique",
      expectedOffsets: [0],
      expectedNextIndex: 64,
    },
    {
      label: "境界をまたがない観測列で候補が複数残る",
      observations: (values: readonly number[]) => values.slice(0, 4),
      maxCandidates: "all" as const,
      expectedStatus: "multiple",
      expectedOffsets: [0, 60],
    },
    {
      label: "境界をまたがない観測列で候補が 0 件になる",
      observations: (values: readonly number[]) =>
        corruptLastObservation(values.slice(0, 4)),
      maxCandidates: "all" as const,
      expectedStatus: "unsat",
      expectedOffsets: [],
    },
    {
      label: "境界をまたぐ観測列で候補が一つに絞れる",
      observations: (values: readonly number[]) => values.slice(60, 65),
      maxCandidates: "all" as const,
      expectedStatus: "unique",
      expectedOffsets: [60],
      expectedNextIndex: 65,
    },
    {
      label: "境界をまたぐ観測列で候補が複数残る",
      observations: (values: readonly number[]) => values.slice(63, 65),
      maxCandidates: 2,
      expectedStatus: "multiple",
    },
    {
      label: "境界をまたぐ観測列で候補が 0 件になる",
      observations: (values: readonly number[]) =>
        corruptLastObservation(values.slice(60, 65)),
      maxCandidates: "all" as const,
      expectedStatus: "unsat",
      expectedOffsets: [],
    },
  ])("cache offset 不明: $label", async ({
    observations,
    maxCandidates,
    expectedStatus,
    expectedOffsets,
    expectedNextIndex,
  }) => {
    const values = createSeed1337Values(70);

    const result = await solveV8CurrentRawObservations(observations(values), {
      maxCandidates,
    });

    expect(result.status).toBe(expectedStatus);
    if (expectedOffsets !== undefined) {
      expect(uniqueCacheOffsets(result)).toEqual(expectedOffsets);
    }
    if (expectedNextIndex !== undefined) {
      expect(result.nextPrediction).toBe(values[expectedNextIndex]);
    }
  });

  it("cache offset が既知なら一意な観測数でも、不明なら複数候補になること", async () => {
    const values = createSeed1337Values(5);

    const knownOffsetResult = await solveV8CurrentRawObservations(
      values.slice(0, 4),
      {
        cacheOffset: 0,
        maxCandidates: 2,
        timeoutMs: 10_000,
      },
    );
    const unknownOffsetResult = await solveV8CurrentRawObservations(
      values.slice(0, 4),
      {
        maxCandidates: 2,
        timeoutMs: 10_000,
      },
    );

    expect(knownOffsetResult.status).toBe("unique");
    expect(unknownOffsetResult.status).toBe("multiple");
    expect(
      unknownOffsetResult.candidates.map((candidate) => candidate.cacheOffset),
    ).toEqual([0, 60]);
  });

  it("cache 境界をまたぐ観測列から次の観測値を予測できること", async () => {
    const values = createSeed1337Values(71);

    const result = await solveV8CurrentRawObservations(values.slice(60, 70), {
      cacheOffset: 60,
      maxCandidates: 2,
      timeoutMs: 10_000,
    });

    expect(result.status).toBe("unique");
    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0]?.cacheOffset).toBe(60);
    expect(result.nextPrediction).toBe(values[70]);
  });

  it("cache offset が不明な短い観測列でも境界候補ごとの次値を返すこと", async () => {
    const values = createSeed1337Values(5);

    const result = await solveV8CurrentRawObservations(values.slice(0, 4), {
      maxCandidates: 2,
      timeoutMs: 10_000,
    });

    expect(result.status).toBe("multiple");
    expect(result.candidates).toHaveLength(2);
    expect(result.candidates[0]?.cacheOffset).toBe(0);
    expect(result.candidates[1]?.cacheOffset).toBe(60);
    expect(result.nextPredictions.length).toBeGreaterThanOrEqual(1);
    expect(result.nextPredictions).toContain(values[4]);
  });

  it("範囲外の観測値は solver に渡す前にエラーにすること", async () => {
    await expect(solveV8CurrentRawObservations([0.1, 1])).rejects.toThrow(
      "観測値は [0, 1) の範囲である必要があります。",
    );
  });
});
