import { createV8CurrentGeneratorFromSeed } from "../domain/v8Current";
import { solveV8CurrentRawObservationsWithZ3 } from "./v8CurrentZ3RawSolver";

jest.setTimeout(120_000);

const describeZ3RawSpike =
  process.env.RUN_Z3_RAW_SPIKE === "1" ? describe : describe.skip;
const itBitVecComparison =
  process.env.RUN_Z3_BITVEC_COMPARISON === "1" ? it : it.skip;

describeZ3RawSpike("v8-node-24-cache-lifo-state0 raw solver Z3 spike", () => {
  const createSeed1337Values = (count: number) => {
    const generator = createV8CurrentGeneratorFromSeed(1337n);
    return Array.from({ length: count }, () => generator.next());
  };

  const uniqueCacheOffsets = (result: {
    readonly candidates: readonly { readonly cacheOffset?: number }[];
  }) => [
    ...new Set(result.candidates.map((candidate) => candidate.cacheOffset)),
  ];

  const measure = async <Result extends { readonly status: string }>(
    label: string,
    run: () => Promise<Result>,
  ): Promise<Result> => {
    const start = performance.now();
    const result = await run();
    const elapsedMs = Math.round(performance.now() - start);
    console.info(`[z3 raw spike] ${label}: ${result.status} ${elapsedMs}ms`);
    return result;
  };

  it("preview: maxCandidates=2 では観測3個で複数候補を確認できること", async () => {
    const values = createSeed1337Values(4);

    const result = await measure("preview observations=3", () =>
      solveV8CurrentRawObservationsWithZ3(values.slice(0, 3), {
        maxCandidates: 2,
        timeoutMs: 10_000,
      }),
    );

    expect(result.status).toBe("multiple");
    expect(result.candidateCount).toBe(2);
    expect(result.candidatesPreview).toHaveLength(2);
    expect(result.nextPrediction).toBeUndefined();
  });

  it("preview: maxCandidates=2 では観測4個で offset 0/60 の候補を確認できること", async () => {
    const values = createSeed1337Values(5);

    const result = await measure("preview observations=4", () =>
      solveV8CurrentRawObservationsWithZ3(values.slice(0, 4), {
        maxCandidates: 2,
        timeoutMs: 10_000,
      }),
    );

    expect(result.status).toBe("multiple");
    expect(result.candidateCount).toBe(2);
    expect(uniqueCacheOffsets(result)).toEqual([0, 60]);
    expect(result.nextPredictions).toContain(values[4]);
  });

  it("既知 offset 一意: 観測4個で unique と次値予測を返すこと", async () => {
    const values = createSeed1337Values(5);

    const result = await measure("known offset unique observations=4", () =>
      solveV8CurrentRawObservationsWithZ3(values.slice(0, 4), {
        cacheOffset: 0,
        maxCandidates: 2,
        timeoutMs: 10_000,
      }),
    );

    expect(result.status).toBe("unique");
    expect(result.candidateCount).toBe(1);
    expect(result.nextPrediction).toBe(values[4]);
  });

  it("全列挙 4096: optimized strategy は観測3個の maxCandidates=all を全列挙できること", async () => {
    const values = createSeed1337Values(4);

    const result = await measure("optimized exhaustive observations=3", () =>
      solveV8CurrentRawObservationsWithZ3(values.slice(0, 3), {
        maxCandidates: "all",
        maxZ3Candidates: 4_096,
        timeoutMs: 5_000,
      }),
    );

    expect(result.status).toBe("multiple");
    expect(result.candidateCount).toBe(4_096);
    expect(result.candidatesPreview).toHaveLength(4_096);
    expect(uniqueCacheOffsets(result)).toEqual([0, 61]);
  });

  it("候補数過多: 観測1個の maxCandidates=all は Z3 に渡す前に unknown で打ち切ること", async () => {
    const values = createSeed1337Values(2);

    const result = await measure("too many candidates observations=1", () =>
      solveV8CurrentRawObservationsWithZ3(values.slice(0, 1), {
        maxCandidates: "all",
        timeoutMs: 10_000,
      }),
    );

    expect(result.status).toBe("unknown");
    expect(result.reason).toBe(
      "GF(2) 簡約後の候補数が Z3 spike の安全上限を超えました。",
    );
  });

  it("64 観測 unique: optimized strategy は既知 offset の長い観測列を一意に絞れること", async () => {
    const values = createSeed1337Values(65);

    const result = await measure("optimized unique observations=64", () =>
      solveV8CurrentRawObservationsWithZ3(values.slice(0, 64), {
        cacheOffset: 0,
        maxCandidates: "all",
        timeoutMs: 10_000,
      }),
    );

    expect(result.status).toBe("unique");
    expect(result.candidateCount).toBe(1);
    expect(uniqueCacheOffsets(result)).toEqual([0]);
    expect(result.nextPrediction).toBe(values[64]);
  });

  itBitVecComparison(
    "比較用: bitvec strategy は観測3個の全列挙で timeout しやすいこと",
    async () => {
      const values = createSeed1337Values(4);

      const result = await measure("bitvec exhaustive observations=3", () =>
        solveV8CurrentRawObservationsWithZ3(values.slice(0, 3), {
          strategy: "bitvec",
          maxCandidates: "all",
          maxZ3Candidates: 4_096,
          timeoutMs: 5_000,
        }),
      );

      expect(["multiple", "unknown", "timeout"]).toContain(result.status);
    },
  );
});
