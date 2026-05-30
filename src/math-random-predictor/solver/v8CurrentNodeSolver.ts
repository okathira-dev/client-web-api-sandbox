import {
  buildV8CacheLifoRawConstraintPlanForOffset,
  type RawObservationConstraintPlan,
} from "../domain/constraints";
import { advanceV8State, V8_CURRENT_MODEL } from "../domain/v8Current";
import type { SolverCandidate, SolverResult } from "./types";

export type V8CurrentSolverCandidate = SolverCandidate;
export type V8CurrentSolverResult = SolverResult;

export type V8CurrentSolverOptions = {
  /** 候補 preview の上限。`"all"` の場合は列挙可能な範囲で internal state 候補を全列挙する。 */
  readonly maxCandidates?: number | "all";
  /** SolverAdapter 互換の予約 option。現行 GF(2) raw solver では時間制限には使わない。 */
  readonly timeoutMs?: number;
  /** 観測開始位置の cache offset。未知の場合は代表 offset 候補を探索する。 */
  readonly cacheOffset?: number | "unknown";
};

const DEFAULT_MAX_CANDIDATES = 2;
const DEFAULT_CACHE_OFFSET = "unknown";
const WORD_BITS = 64;
const STATE_BITS = 128;
const RHS_BIT = 1n << BigInt(STATE_BITS);
const COEFFICIENT_MASK = RHS_BIT - 1n;
const MAX_EXHAUSTIVE_FREE_BITS = 20;

type SymbolicWord = readonly bigint[];

type SymbolicState = {
  readonly s0: SymbolicWord;
  readonly s1: SymbolicWord;
};

type LinearSolution = {
  readonly consistent: boolean;
  readonly particular: bigint;
  readonly basis: readonly bigint[];
};

/**
 * 2 つの 64bit symbolic word を bit ごとの XOR として合成する。
 */
const xorWords = (left: SymbolicWord, right: SymbolicWord): bigint[] =>
  left.map((value, index) => value ^ (right[index] ?? 0n));

/**
 * symbolic word を左 shift し、64bit 幅からあふれた bit は捨てる。
 */
const shlWord = (word: SymbolicWord, bits: number): bigint[] =>
  Array.from({ length: WORD_BITS }, (_, index) =>
    index >= bits ? (word[index - bits] ?? 0n) : 0n,
  );

/**
 * symbolic word を論理右 shift し、空いた上位 bit は 0 として扱う。
 */
const lshrWord = (word: SymbolicWord, bits: number): bigint[] =>
  Array.from({ length: WORD_BITS }, (_, index) => word[index + bits] ?? 0n);

/**
 * 128bit の初期 state を GF(2) の基底ベクトルとして表現する。
 *
 * `s0` の bit 0..63 と `s1` の bit 64..127 を未知変数に対応させる。
 */
const createInitialSymbolicState = (): SymbolicState => ({
  s0: Array.from({ length: WORD_BITS }, (_, bit) => 1n << BigInt(bit)),
  s1: Array.from(
    { length: WORD_BITS },
    (_, bit) => 1n << BigInt(WORD_BITS + bit),
  ),
});

/**
 * xorshift128+ の 1 step を、GF(2) 上の線形変換として symbolic state に適用する。
 */
const buildNextSymbolicState = (state: SymbolicState): SymbolicState => {
  let nextS1 = state.s0;
  const nextS0 = state.s1;
  nextS1 = xorWords(nextS1, shlWord(nextS1, 23));
  nextS1 = xorWords(nextS1, lshrWord(nextS1, 17));
  nextS1 = xorWords(nextS1, nextS0);
  nextS1 = xorWords(nextS1, lshrWord(nextS0, 26));
  return { s0: nextS0, s1: nextS1 };
};

/**
 * BigInt の指定 bit を 0/1 として取り出す。
 */
const getBit = (value: bigint, bit: number): 0 | 1 =>
  Number((value >> BigInt(bit)) & 1n) as 0 | 1;

/**
 * 線形方程式の 1 行を、下位 128bit の係数と 128bit 目の右辺 bit に詰める。
 */
const createLinearRow = (coefficient: bigint, rhs: 0 | 1): bigint =>
  coefficient | (rhs === 1 ? RHS_BIT : 0n);

/**
 * 線形方程式行から係数部分だけを取り出す。
 */
const rowCoefficient = (row: bigint): bigint => row & COEFFICIENT_MASK;

/**
 * 線形方程式行から右辺 bit を取り出す。
 */
const rowRhs = (row: bigint): 0 | 1 => getBit(row, STATE_BITS);

/**
 * 候補 state と制約計画から、次に観測される mantissa を計算する。
 */
const predictNextObservedMantissa = (
  candidate: V8CurrentSolverCandidate,
  plan: RawObservationConstraintPlan,
): bigint => {
  if (plan.nextUsesPreStateS0) {
    return candidate.preState.s0 >> BigInt(plan.rightShiftBits);
  }
  if (plan.nextRelativeStep !== undefined) {
    return (
      advanceV8State(candidate.preState, plan.nextRelativeStep).s0 >>
      BigInt(plan.rightShiftBits)
    );
  }
  throw new Error("次値予測に必要な相対 step を決定できません。");
};

/**
 * 候補 state と制約計画から、次に観測される `Math.random()` 値を計算する。
 */
const predictNextObservedValue = (
  candidate: V8CurrentSolverCandidate,
  plan: RawObservationConstraintPlan,
): number => {
  return Number(predictNextObservedMantissa(candidate, plan)) / 2 ** 53;
};

/**
 * 数値配列から重複を取り除き、出現順を保った配列を返す。
 */
const uniqueNumbers = (values: readonly number[]): number[] => [
  ...new Set(values),
];

/**
 * 次値候補が 1 種類だけなら、その値を単一予測として返す。
 */
const getSingleNextPrediction = (
  nextPredictions: readonly number[],
): number | undefined => {
  const predictions = uniqueNumbers(nextPredictions);
  return predictions.length === 1 ? predictions[0] : undefined;
};

/**
 * `maxCandidates` option を、列挙上限として扱いやすい数値へ変換する。
 */
const resolveCandidateLimit = (
  maxCandidates: V8CurrentSolverOptions["maxCandidates"],
): number => {
  if (maxCandidates === "all") {
    return Number.POSITIVE_INFINITY;
  }
  return maxCandidates ?? DEFAULT_MAX_CANDIDATES;
};

/**
 * solver 内部で集めた候補配列を、CLI/UI 共通の `SolverResult` へ整形する。
 */
const toSolverResult = (
  status: V8CurrentSolverResult["status"],
  candidates: readonly V8CurrentSolverCandidate[],
  maxCandidates: number,
  exhaustive: boolean,
  reason?: string,
): V8CurrentSolverResult => {
  const unique = status === "unique";
  const nextPredictions = uniqueNumbers(
    candidates
      .map((candidate) => candidate.nextPrediction)
      .filter((value): value is number => value !== undefined),
  );
  return {
    status,
    unique,
    uniqueConfirmed: status !== "unknown" && status !== "timeout",
    candidateCount: candidates.length,
    candidatesPreview: candidates.slice(0, maxCandidates),
    candidates,
    nextPrediction:
      status === "unknown" ||
      status === "timeout" ||
      (status === "multiple" && !exhaustive)
        ? undefined
        : getSingleNextPrediction(nextPredictions),
    nextPredictions,
    reason,
  };
};

/**
 * cache offset option から、solver が試す制約計画の集合を作る。
 *
 * offset 不明時は cache 先頭 offset と、観測列が境界をまたぎ得る offset を代表として試す。
 */
const buildPlans = (
  observations: readonly number[],
  cacheOffset: number | "unknown",
): RawObservationConstraintPlan[] => {
  if (cacheOffset === "unknown") {
    const firstBoundaryOffset = Math.max(
      0,
      V8_CURRENT_MODEL.cacheSize - observations.length,
    );
    const boundaryOffsets = Array.from(
      { length: V8_CURRENT_MODEL.cacheSize - firstBoundaryOffset },
      (_, index) => firstBoundaryOffset + index,
    ).sort((left, right) => {
      const pivot = V8_CURRENT_MODEL.cacheSize - 4;
      return Math.abs(left - pivot) - Math.abs(right - pivot);
    });
    const offsets = new Set([0, ...boundaryOffsets]);
    return [...offsets].map((offset) =>
      buildV8CacheLifoRawConstraintPlanForOffset(observations, offset),
    );
  }
  return [
    buildV8CacheLifoRawConstraintPlanForOffset(observations, cacheOffset),
  ];
};

/**
 * raw observation の制約計画を、GF(2) 線形方程式の行列に変換する。
 *
 * 各観測値の 53bit mantissa を、対応する symbolic state0 の上位 bit と等しいという
 * bit 単位の等式として展開する。
 */
const buildLinearRows = (plan: RawObservationConstraintPlan): bigint[] => {
  const constraintsByStep = new Map<number, bigint[]>();
  for (const constraint of plan.constraints) {
    const values = constraintsByStep.get(constraint.relativeStep) ?? [];
    values.push(constraint.mantissa);
    constraintsByStep.set(constraint.relativeStep, values);
  }

  const rows: bigint[] = [];
  let state = createInitialSymbolicState();
  for (let step = 1; step <= plan.maxRelativeStep; step++) {
    state = buildNextSymbolicState(state);
    for (const mantissa of constraintsByStep.get(step) ?? []) {
      for (let bit = 0; bit < plan.outputBits; bit++) {
        const coefficient = state.s0[plan.rightShiftBits + bit];
        if (coefficient === undefined) {
          throw new Error("観測値の bit 制約生成に失敗しました。");
        }
        rows.push(createLinearRow(coefficient, getBit(mantissa, bit)));
      }
    }
  }
  return rows;
};

/**
 * GF(2) の線形方程式を掃き出し法で解き、特解と自由変数の基底を返す。
 *
 * 矛盾がある場合は `consistent: false` を返し、候補 0 件として扱えるようにする。
 */
const solveLinearSystem = (inputRows: readonly bigint[]): LinearSolution => {
  const rows = [...inputRows];
  const pivotColumns: number[] = [];
  let rank = 0;

  for (let column = 0; column < STATE_BITS; column++) {
    const pivotIndex = rows.findIndex(
      (row, index) => index >= rank && getBit(row, column) === 1,
    );
    if (pivotIndex < 0) {
      continue;
    }

    const pivotRow = rows[pivotIndex];
    const rankRow = rows[rank];
    if (pivotRow === undefined || rankRow === undefined) {
      throw new Error("線形方程式の行操作に失敗しました。");
    }
    rows[rank] = pivotRow;
    rows[pivotIndex] = rankRow;

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      if (rowIndex !== rank && getBit(rows[rowIndex] ?? 0n, column) === 1) {
        rows[rowIndex] = (rows[rowIndex] ?? 0n) ^ (rows[rank] ?? 0n);
      }
    }

    pivotColumns.push(column);
    rank++;
  }

  for (const row of rows) {
    if (rowCoefficient(row) === 0n && rowRhs(row) === 1) {
      return { consistent: false, particular: 0n, basis: [] };
    }
  }

  let particular = 0n;
  for (let index = 0; index < pivotColumns.length; index++) {
    const pivotColumn = pivotColumns[index];
    const row = rows[index];
    if (pivotColumn === undefined || row === undefined) {
      throw new Error("線形方程式の解の復元に失敗しました。");
    }
    if (rowRhs(row) === 1) {
      particular |= 1n << BigInt(pivotColumn);
    }
  }

  const pivotColumnSet = new Set(pivotColumns);
  const freeColumns = Array.from(
    { length: STATE_BITS },
    (_, column) => column,
  ).filter((column) => !pivotColumnSet.has(column));
  const basis = freeColumns.map((freeColumn) => {
    let vector = 1n << BigInt(freeColumn);
    for (let index = 0; index < pivotColumns.length; index++) {
      const pivotColumn = pivotColumns[index];
      const row = rows[index];
      if (pivotColumn === undefined || row === undefined) {
        throw new Error("線形方程式の基底の復元に失敗しました。");
      }
      if (getBit(row, freeColumn) === 1) {
        vector |= 1n << BigInt(pivotColumn);
      }
    }
    return vector;
  });

  return { consistent: true, particular, basis };
};

/**
 * 線形方程式の解空間から、指定数まで state vector を列挙する。
 */
function* enumerateLinearSolutions(
  solution: LinearSolution,
  limit: number,
): Generator<bigint> {
  if (!solution.consistent) {
    return;
  }
  for (let combination = 0n; combination < BigInt(limit); combination++) {
    let vector = solution.particular;
    for (let bit = 0; bit < solution.basis.length; bit++) {
      if (((combination >> BigInt(bit)) & 1n) === 1n) {
        vector ^= solution.basis[bit] ?? 0n;
      }
    }
    yield vector;
  }
}

/**
 * 128bit の解ベクトルを、V8 の `{ s0, s1 }` state 表現へ戻す。
 */
const solutionVectorToState = (
  vector: bigint,
): V8CurrentSolverCandidate["preState"] => {
  let s0 = 0n;
  let s1 = 0n;
  for (let bit = 0; bit < WORD_BITS; bit++) {
    if (getBit(vector, bit) === 1) {
      s0 |= 1n << BigInt(bit);
    }
    if (getBit(vector, WORD_BITS + bit) === 1) {
      s1 |= 1n << BigInt(bit);
    }
  }
  return { s0, s1 };
};

/**
 * 解空間の自由変数数から、今回列挙する候補数を決める。
 *
 * 全列挙モードで候補が多すぎる場合は `undefined` を返し、呼び出し側で `unknown` にする。
 */
const getEnumerableSolutionCount = (
  freeVariableCount: number,
  exhaustive: boolean,
  remainingCandidateSlots: number,
): number | undefined => {
  if (freeVariableCount > MAX_EXHAUSTIVE_FREE_BITS && exhaustive) {
    return undefined;
  }
  const solutionCount = 2 ** freeVariableCount;
  return exhaustive
    ? solutionCount
    : Math.min(solutionCount, remainingCandidateSlots);
};

/**
 * V8 current cache/LIFO モデルの raw observation から、内部 state 候補と次値候補を推論する。
 *
 * `cacheOffset` が未知の場合は代表 offset ごとの制約計画を試し、
 * `maxCandidates: "all"` では列挙可能な範囲で internal state 候補を全列挙する。
 */
export const solveV8CurrentRawObservations = async (
  observations: readonly number[],
  options: V8CurrentSolverOptions = {},
): Promise<V8CurrentSolverResult> => {
  const exhaustive = options.maxCandidates === "all";
  const maxCandidates = resolveCandidateLimit(options.maxCandidates);
  const cacheOffset = options.cacheOffset ?? DEFAULT_CACHE_OFFSET;
  const plans = buildPlans(observations, cacheOffset);

  const candidates: V8CurrentSolverCandidate[] = [];

  for (const plan of plans) {
    const solution = solveLinearSystem(buildLinearRows(plan));
    if (!solution.consistent) {
      continue;
    }

    const solutionCount = getEnumerableSolutionCount(
      solution.basis.length,
      exhaustive,
      maxCandidates - candidates.length,
    );

    if (solutionCount === undefined) {
      return toSolverResult(
        "unknown",
        candidates,
        maxCandidates,
        exhaustive,
        "候補数が多すぎるため全列挙できません。",
      );
    }

    for (const vector of enumerateLinearSolutions(solution, solutionCount)) {
      const preState = solutionVectorToState(vector);
      const candidate: V8CurrentSolverCandidate = {
        cacheOffset: plan.cacheOffset,
        preState,
      };
      const candidateWithPrediction = {
        ...candidate,
        nextPrediction: predictNextObservedValue(candidate, plan),
      };
      candidates.push(candidateWithPrediction);

      if (!exhaustive && candidates.length >= maxCandidates) {
        return toSolverResult(
          "multiple",
          candidates,
          maxCandidates,
          exhaustive,
        );
      }
    }
  }

  if (candidates.length === 0) {
    return toSolverResult("unsat", candidates, maxCandidates, exhaustive);
  }
  if (candidates.length === 1) {
    return toSolverResult("unique", candidates, maxCandidates, exhaustive);
  }
  return toSolverResult("multiple", candidates, maxCandidates, exhaustive);
};
