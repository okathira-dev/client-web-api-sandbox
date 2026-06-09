import {
  createV8CurrentGeneratorFromSeed,
  floorRandom,
} from "../domain/v8Current";
import { probeV8CurrentConvertedUniqueness } from "../solver/v8CurrentConvertedSolver";

const buildConvertedSeries = (
  seed: bigint,
  n: number,
  count: number,
): number[] => {
  const generator = createV8CurrentGeneratorFromSeed(seed);
  return Array.from({ length: count }, () => floorRandom(generator.next(), n));
};

export type ConvertedUniqueProbeStatus = Awaited<
  ReturnType<typeof probeV8CurrentConvertedUniqueness>
>["status"];

export type ProbeAtCountResult = {
  readonly ok: boolean;
  readonly status: ConvertedUniqueProbeStatus;
};

export type ProbeConvertedUniquenessAtCount = (
  allObservations: readonly number[],
  count: number,
  n: number,
  cacheOffset: number | "unknown",
  timeoutMs: number,
) => Promise<ProbeAtCountResult>;

export const probeConvertedUniquenessAtCount: ProbeConvertedUniquenessAtCount =
  async (
    allObservations: readonly number[],
    count: number,
    n: number,
    cacheOffset: number,
    timeoutMs: number,
  ): Promise<ProbeAtCountResult> => {
    const observations = allObservations.slice(0, count);
    const result = await probeV8CurrentConvertedUniqueness(observations, n, {
      cacheOffset,
      timeoutMs,
      z3Fallback: cacheOffset === "unknown" ? false : undefined,
    });
    return {
      ok: result.uniquenessConfirmed,
      status: result.status,
    };
  };

/**
 * 観測数を maxCount から 1 へ減らし、一意性が確認できる観測数の上限を探す。
 * 観測が多すぎて Z3 が timeout する場合に向く（大きい N で高 count が unique のとき）。
 */
const resolveProbe = (
  probe: ProbeConvertedUniquenessAtCount | undefined,
): ProbeConvertedUniquenessAtCount => probe ?? probeConvertedUniquenessAtCount;

export const findFirstUniqueCountFromHigh = async (options: {
  readonly allObservations: readonly number[];
  readonly n: number;
  readonly cacheOffset: number | "unknown";
  readonly timeoutMs: number;
  readonly maxCount: number;
  readonly probe?: ProbeConvertedUniquenessAtCount;
  readonly onProbe?: (count: number, result: ProbeAtCountResult) => void;
}): Promise<{
  readonly upperCount: number | null;
  readonly statusAtUpper: ConvertedUniqueProbeStatus;
}> => {
  const probeAtCount = resolveProbe(options.probe);
  let statusAtUpper: ConvertedUniqueProbeStatus = "unsat";

  for (let count = options.maxCount; count >= 1; count--) {
    const result = await probeAtCount(
      options.allObservations,
      count,
      options.n,
      options.cacheOffset,
      options.timeoutMs,
    );
    options.onProbe?.(count, result);
    statusAtUpper = result.status;

    if (result.status === "unknown") {
      return { upperCount: null, statusAtUpper };
    }
    if (result.ok) {
      return { upperCount: count, statusAtUpper };
    }
    if (result.status === "multiple") {
      // 観測が足りないので降順探索は打ち切り、増加側へ切り替える。
      return { upperCount: null, statusAtUpper };
    }
  }

  return { upperCount: null, statusAtUpper };
};

/**
 * 観測数を startCount から maxCount まで増やし、一意性が確認できる最初の観測数を探す。
 * 大きい N では少数観測で multiple → やや増やすと unique になりやすい。
 */
export const findFirstUniqueCountByIncreasing = async (options: {
  readonly allObservations: readonly number[];
  readonly n: number;
  readonly cacheOffset: number | "unknown";
  readonly timeoutMs: number;
  readonly maxCount: number;
  readonly startCount?: number;
  readonly probe?: ProbeConvertedUniquenessAtCount;
  readonly onProbe?: (count: number, result: ProbeAtCountResult) => void;
}): Promise<{
  readonly upperCount: number | null;
  readonly statusAtUpper: ConvertedUniqueProbeStatus;
}> => {
  const probeAtCount = resolveProbe(options.probe);
  const startCount = options.startCount ?? 4;
  let statusAtUpper: ConvertedUniqueProbeStatus = "unsat";

  for (let count = startCount; count <= options.maxCount; count++) {
    const result = await probeAtCount(
      options.allObservations,
      count,
      options.n,
      options.cacheOffset,
      options.timeoutMs,
    );
    options.onProbe?.(count, result);
    statusAtUpper = result.status;

    if (result.status === "unknown") {
      return { upperCount: null, statusAtUpper };
    }
    if (result.ok) {
      return { upperCount: count, statusAtUpper };
    }
  }

  return { upperCount: null, statusAtUpper };
};

/**
 * 多い観測数から試し、timeout なら半分へ。multiple なら増加探索へフォールバックする。
 */
export const findFirstUniqueCountPreferringHigh = async (options: {
  readonly allObservations: readonly number[];
  readonly n: number;
  readonly cacheOffset: number | "unknown";
  readonly timeoutMs: number;
  readonly maxCount: number;
  readonly probe?: ProbeConvertedUniquenessAtCount;
  readonly onProbe?: (count: number, result: ProbeAtCountResult) => void;
}): Promise<{
  readonly upperCount: number | null;
  readonly statusAtUpper: ConvertedUniqueProbeStatus;
}> => {
  const probeAtCount = resolveProbe(options.probe);
  let count = options.maxCount;
  let statusAtUpper: ConvertedUniqueProbeStatus = "unsat";

  while (count >= 1) {
    const result = await probeAtCount(
      options.allObservations,
      count,
      options.n,
      options.cacheOffset,
      options.timeoutMs,
    );
    options.onProbe?.(count, result);
    statusAtUpper = result.status;

    if (result.status === "unknown") {
      return { upperCount: null, statusAtUpper };
    }
    if (result.ok) {
      return { upperCount: count, statusAtUpper };
    }
    if (result.status === "multiple") {
      return findFirstUniqueCountByIncreasing({
        ...options,
        startCount: Math.max(4, Math.floor(count / 2)),
      });
    }
    count = Math.floor(count / 2);
  }

  return findFirstUniqueCountByIncreasing({
    ...options,
    startCount: 4,
  });
};

/**
 * 観測数 1..maxCount の二分探索で、2 モデル probe による一意性が成立する最小観測数を求める。
 */
export const findMinObservationCountForUnique = async (options: {
  readonly allObservations: readonly number[];
  readonly n: number;
  readonly cacheOffset: number | "unknown";
  readonly timeoutMs: number;
  readonly maxCount?: number;
  readonly probe?: ProbeConvertedUniquenessAtCount;
  readonly onProbe?: (count: number, result: ProbeAtCountResult) => void;
}): Promise<{
  readonly minCount: number | null;
  readonly statusAtMin: ConvertedUniqueProbeStatus;
}> => {
  const probeAtCount = resolveProbe(options.probe);
  const maxCount = options.maxCount ?? options.allObservations.length;
  let low = 1;
  let high = maxCount;
  let answer: number | null = null;
  let statusAtMin: ConvertedUniqueProbeStatus = "unsat";

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const result = await probeAtCount(
      options.allObservations,
      mid,
      options.n,
      options.cacheOffset,
      options.timeoutMs,
    );
    options.onProbe?.(mid, result);

    if (result.status === "timeout") {
      high = mid - 1;
      continue;
    }
    if (result.status === "unknown") {
      return { minCount: null, statusAtMin: result.status };
    }
    if (result.ok) {
      answer = mid;
      statusAtMin = result.status;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return { minCount: answer, statusAtMin };
};

/** 大きい N から順に試す既定の N 候補（2 の冪）。 */
export const DEFAULT_LARGE_N_CANDIDATES = [
  4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2,
] as const;

export type ConvertedUniqueFixture = {
  readonly n: number;
  readonly seed: string;
  readonly cacheOffset: number | "unknown";
  readonly minObservationCount: number;
  readonly probeAtMin: ConvertedUniqueProbeStatus;
  readonly observations: readonly number[];
  readonly expectedNext: number;
};

/**
 * 大きい N → 多い観測数から減らす順で探索し、最小観測数の一意解条件を返す。
 */
export const findConvertedUniqueFixture = async (options: {
  readonly seed: bigint;
  readonly cacheOffset: number | "unknown";
  readonly timeoutMs: number;
  readonly maxObservations: number;
  readonly nCandidates: readonly number[];
  readonly fixedN?: number;
  readonly onLog?: (message: string) => void;
}): Promise<ConvertedUniqueFixture | null> => {
  const nList =
    options.fixedN !== undefined
      ? [options.fixedN]
      : options.nCandidates.filter((n) => n >= 2);

  for (const n of nList) {
    options.onLog?.(`N=${n}: 系列を生成 (${options.maxObservations} 観測)`);
    const allObservations = buildConvertedSeries(
      options.seed,
      n,
      options.maxObservations,
    );

    const searchMaxCount = Math.min(options.maxObservations, 128);
    options.onLog?.(
      `N=${n}: 観測数 ${searchMaxCount} から（timeout 時は半分）上限を探索し、必要なら観測数を増やす`,
    );
    const { upperCount, statusAtUpper } =
      await findFirstUniqueCountPreferringHigh({
        allObservations,
        n,
        cacheOffset: options.cacheOffset,
        timeoutMs: options.timeoutMs,
        maxCount: searchMaxCount,
        onProbe: (count, result) =>
          options.onLog?.(
            `  [upper] count=${count} status=${result.status} unique=${result.ok ? "yes" : "no"}`,
          ),
      });

    if (upperCount === null) {
      options.onLog?.(
        `N=${n}: 一意性の上限が見つかりませんでした (${statusAtUpper})`,
      );
      continue;
    }

    options.onLog?.(
      `N=${n}: 上限 count=${upperCount}。1..${upperCount} で最小観測数を二分探索`,
    );
    const { minCount, statusAtMin } = await findMinObservationCountForUnique({
      allObservations,
      n,
      cacheOffset: options.cacheOffset,
      timeoutMs: options.timeoutMs,
      maxCount: upperCount,
      onProbe: (count, result) =>
        options.onLog?.(
          `  [binary] count=${count} status=${result.status} unique=${result.ok ? "yes" : "no"}`,
        ),
    });

    if (minCount === null) {
      options.onLog?.(`N=${n}: 最小観測数の確定に失敗 (${statusAtMin})`);
      continue;
    }

    const expectedNext = allObservations[minCount];
    if (expectedNext === undefined) {
      throw new Error(`expectedNext が取得できません (minCount=${minCount})`);
    }

    return {
      n,
      seed: options.seed.toString(),
      cacheOffset: options.cacheOffset,
      minObservationCount: minCount,
      probeAtMin: statusAtMin,
      observations: allObservations.slice(0, minCount),
      expectedNext,
    };
  }

  return null;
};
