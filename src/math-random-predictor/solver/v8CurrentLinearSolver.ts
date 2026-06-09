import type { RawObservationConstraintPlan } from "../domain/constraints";
import type { V8State } from "../domain/v8Current";

const WORD_BITS = 64;
const STATE_BITS = 128;
const RHS_BIT = 1n << BigInt(STATE_BITS);
const COEFFICIENT_MASK = RHS_BIT - 1n;

type SymbolicWord = readonly bigint[];

type SymbolicState = {
  readonly s0: SymbolicWord;
  readonly s1: SymbolicWord;
};

export type V8RawLinearSolution = {
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

export type StepFixedMantissaBits = {
  readonly relativeStep: number;
  readonly fixedBits: readonly {
    readonly bit: number;
    readonly value: 0 | 1;
  }[];
};

type LinearRowPlanShape = {
  readonly maxRelativeStep: number;
  readonly rightShiftBits: number;
};

/**
 * 各 step の確定 mantissa bit から GF(2) 線形行を構築する。
 */
export const buildLinearRowsFromFixedMantissaBits = (
  plan: LinearRowPlanShape,
  steps: readonly StepFixedMantissaBits[],
): bigint[] => {
  const constraintsByStep = new Map<
    number,
    StepFixedMantissaBits["fixedBits"]
  >();
  for (const step of steps) {
    const values = constraintsByStep.get(step.relativeStep) ?? [];
    constraintsByStep.set(step.relativeStep, [...values, ...step.fixedBits]);
  }

  const rows: bigint[] = [];
  let state = createInitialSymbolicState();
  for (let step = 1; step <= plan.maxRelativeStep; step++) {
    state = buildNextSymbolicState(state);
    for (const fixedBit of constraintsByStep.get(step) ?? []) {
      const coefficient = state.s0[plan.rightShiftBits + fixedBit.bit];
      if (coefficient === undefined) {
        throw new Error("観測値の bit 制約生成に失敗しました。");
      }
      rows.push(createLinearRow(coefficient, fixedBit.value));
    }
  }
  return rows;
};

/**
 * raw observation の制約計画を、GF(2) 線形方程式の行列に変換する。
 *
 * 各観測値の 53bit mantissa を、対応する symbolic state0 の上位 bit と等しいという
 * bit 単位の等式として展開する。
 */
const buildLinearRows = (plan: RawObservationConstraintPlan): bigint[] => {
  const steps: StepFixedMantissaBits[] = [];
  const constraintsByStep = new Map<number, bigint[]>();
  for (const constraint of plan.constraints) {
    const values = constraintsByStep.get(constraint.relativeStep) ?? [];
    values.push(constraint.mantissa);
    constraintsByStep.set(constraint.relativeStep, values);
  }
  for (const [relativeStep, mantissas] of constraintsByStep) {
    for (const mantissa of mantissas) {
      const fixedBits = Array.from({ length: plan.outputBits }, (_, bit) => ({
        bit,
        value: getBit(mantissa, bit),
      }));
      steps.push({ relativeStep, fixedBits });
    }
  }
  return buildLinearRowsFromFixedMantissaBits(plan, steps);
};

/**
 * GF(2) の線形方程式を掃き出し法で解き、特解と自由変数の基底を返す。
 *
 * 矛盾がある場合は `consistent: false` を返し、候補 0 件として扱えるようにする。
 */
const solveLinearSystem = (
  inputRows: readonly bigint[],
): V8RawLinearSolution => {
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
 * V8 current raw observation の制約計画から、GF(2) 線形解空間を求める。
 *
 * Z3 を使う solver でも、raw exact bit 等式はここで先に圧縮してから
 * residual constraint を載せることで、候補列挙の爆発を避ける。
 */
export const solveV8LinearSystemFromRows = (
  rows: readonly bigint[],
): V8RawLinearSolution => solveLinearSystem(rows);

export const solveV8RawObservationLinearSystem = (
  plan: RawObservationConstraintPlan,
): V8RawLinearSolution => solveV8LinearSystemFromRows(buildLinearRows(plan));

/**
 * 線形方程式の解空間から、指定数まで state vector を列挙する。
 */
export function* enumerateV8RawLinearSolutionVectors(
  solution: V8RawLinearSolution,
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
export const solutionVectorToV8State = (vector: bigint): V8State => {
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
