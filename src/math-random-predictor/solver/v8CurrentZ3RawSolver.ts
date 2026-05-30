import type { BitVec, Context, Solver } from "z3-solver";
import {
  buildV8CacheLifoRawConstraintPlanForOffset,
  type RawObservationConstraintPlan,
} from "../domain/constraints";
import { advanceV8State, V8_CURRENT_MODEL } from "../domain/v8Current";
import type { SolverCandidate, SolverResult } from "./types";
import {
  enumerateV8RawLinearSolutionVectors,
  solutionVectorToV8State,
  solveV8RawObservationLinearSystem,
  type V8RawLinearSolution,
} from "./v8CurrentLinearSolver";
import type { V8CurrentSolverOptions } from "./v8CurrentNodeSolver";

type Z3Module = typeof import("z3-solver");
type Z3InitResult = Awaited<ReturnType<Z3Module["init"]>>;
const Z3_CONTEXT_NAME = "v8-current-z3-raw";
type Z3Context = Context<typeof Z3_CONTEXT_NAME>;
type Z3BitVec = BitVec<64, typeof Z3_CONTEXT_NAME>;
type Z3Solver = Solver<typeof Z3_CONTEXT_NAME>;

export type V8CurrentZ3RawSolverCandidate = SolverCandidate;
export type V8CurrentZ3RawSolverResult = SolverResult;

export type V8CurrentZ3RawSolverOptions = V8CurrentSolverOptions & {
  /** Z3 spike で `maxCandidates: "all"` を試すときの安全上限。 */
  readonly maxZ3Candidates?: number;
  /**
   * Z3 raw spike の実行戦略。
   *
   * `optimized` は raw exact bit を GF(2) で簡約してから residual constraint へ渡す。
   * `bitvec` は比較用に、従来の BitVec + blocking clause 列挙を使う。
   */
  readonly strategy?: "optimized" | "bitvec";
};

const DEFAULT_MAX_CANDIDATES = 2;
const DEFAULT_CACHE_OFFSET = "unknown";
const WORD_BITS = 64;
const DEFAULT_Z3_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_Z3_CANDIDATES = 4_096;
const MAX_EXHAUSTIVE_CANDIDATE_BITS = 12;

type Z3State = {
  readonly s0: Z3BitVec;
  readonly s1: Z3BitVec;
};

type ReducedCandidateSpace = {
  readonly plan: RawObservationConstraintPlan;
  readonly solution: V8RawLinearSolution;
  readonly solutionCount: number;
};

let z3InitPromise: Promise<Z3InitResult> | undefined;

/**
 * `z3-solver` の WASM 初期化を solver 呼び出し間で共有する。
 *
 * 初期化は比較的重いため、raw spike の各 plan ごとに繰り返さない。
 */
const getZ3 = async (): Promise<Z3InitResult> => {
  z3InitPromise ??= import("z3-solver").then((module) => module.init());
  return z3InitPromise;
};

/**
 * Z3 の 64bit BitVec として、xorshift128+ を 1 step 進める。
 */
const buildNextZ3State = (state: Z3State): Z3State => {
  let nextS1 = state.s0;
  const nextS0 = state.s1;
  nextS1 = nextS1.xor(nextS1.shl(23));
  nextS1 = nextS1.xor(nextS1.lshr(17));
  nextS1 = nextS1.xor(nextS0);
  nextS1 = nextS1.xor(nextS0.lshr(26));
  return { s0: nextS0, s1: nextS1 };
};

/**
 * 候補 state と制約計画から、次に観測される mantissa を計算する。
 */
const predictNextObservedMantissa = (
  candidate: V8CurrentZ3RawSolverCandidate,
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
  candidate: V8CurrentZ3RawSolverCandidate,
  plan: RawObservationConstraintPlan,
): number => Number(predictNextObservedMantissa(candidate, plan)) / 2 ** 53;

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
  maxCandidates: V8CurrentZ3RawSolverOptions["maxCandidates"],
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
  status: V8CurrentZ3RawSolverResult["status"],
  candidates: readonly V8CurrentZ3RawSolverCandidate[],
  maxCandidates: number,
  exhaustive: boolean,
  reason?: string,
): V8CurrentZ3RawSolverResult => {
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
 * cache offset option から、Z3 solver が試す制約計画の集合を作る。
 *
 * GF(2) solver と同じ代表 offset 順にして、比較しやすい spike 結果にする。
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
 * raw 観測数から、明らかに全列挙できないケースを Z3 に渡す前に判定する。
 *
 * これは厳密な rank 計算ではなく、Z3 spike で巨大な解空間を blocking clause 列挙しないための保守的な安全弁。
 */
const shouldSkipExhaustiveEnumeration = (
  plan: RawObservationConstraintPlan,
): boolean => {
  const constrainedBits = plan.observationCount * plan.outputBits;
  return (
    V8_CURRENT_MODEL.stateBits - constrainedBits > MAX_EXHAUSTIVE_CANDIDATE_BITS
  );
};

/**
 * GF(2) 簡約後の自由変数数から、今回列挙する候補数を決める。
 *
 * `optimized` strategy では Z3 に raw exact bit を直接探索させず、
 * ここで解空間の大きさを把握してから候補を生成する。
 */
const getReducedCandidateSpaceSolutionCount = (
  solution: V8RawLinearSolution,
  exhaustive: boolean,
  remainingCandidateSlots: number,
): number | undefined => {
  if (!solution.consistent) {
    return 0;
  }
  if (solution.basis.length > MAX_EXHAUSTIVE_CANDIDATE_BITS && exhaustive) {
    return undefined;
  }
  const solutionCount = 2 ** solution.basis.length;
  if (exhaustive && solutionCount > remainingCandidateSlots) {
    return undefined;
  }
  return exhaustive
    ? solutionCount
    : Math.min(solutionCount, remainingCandidateSlots);
};

/**
 * raw exact bit 等式を GF(2) で解き、Z3 residual constraints が扱う候補空間へ圧縮する。
 *
 * 現段階の raw solver には residual constraint がないため、この reduced space を
 * 直接列挙する。将来の converted observation では、同じ reduced space 上に
 * `Math.floor(Math.random() * N)` の区間制約を Z3 で追加する。
 */
const reduceRawPlanCandidateSpace = (
  plan: RawObservationConstraintPlan,
  exhaustive: boolean,
  remainingCandidateSlots: number,
): ReducedCandidateSpace | undefined => {
  const solution = solveV8RawObservationLinearSystem(plan);
  if (!solution.consistent) {
    return {
      plan,
      solution,
      solutionCount: 0,
    };
  }

  const solutionCount = getReducedCandidateSpaceSolutionCount(
    solution,
    exhaustive,
    remainingCandidateSlots,
  );
  if (solutionCount === undefined) {
    return undefined;
  }
  return { plan, solution, solutionCount };
};

/**
 * GF(2) で圧縮した候補空間から、SolverResult に入れる候補を生成する。
 */
const enumerateReducedCandidateSpace = (
  reducedSpace: ReducedCandidateSpace,
): V8CurrentZ3RawSolverCandidate[] => {
  const candidates: V8CurrentZ3RawSolverCandidate[] = [];
  if (!reducedSpace.solution.consistent || reducedSpace.solutionCount === 0) {
    return candidates;
  }
  for (const vector of enumerateV8RawLinearSolutionVectors(
    reducedSpace.solution,
    reducedSpace.solutionCount,
  )) {
    const preState = solutionVectorToV8State(vector);
    const candidate: V8CurrentZ3RawSolverCandidate = {
      cacheOffset: reducedSpace.plan.cacheOffset,
      preState,
    };
    candidates.push({
      ...candidate,
      nextPrediction: predictNextObservedValue(candidate, reducedSpace.plan),
    });
  }
  return candidates;
};

/**
 * 制約計画を Z3 solver に追加し、初期 state 変数を返す。
 */
const addPlanConstraints = (
  context: Z3Context,
  plan: RawObservationConstraintPlan,
): {
  readonly solver: Z3Solver;
  readonly preState: Z3State;
} => {
  const solver = new context.Solver();
  const preState = {
    s0: context.BitVec.const("s0", WORD_BITS),
    s1: context.BitVec.const("s1", WORD_BITS),
  };
  const constraintsByStep = new Map<number, bigint[]>();
  for (const constraint of plan.constraints) {
    const values = constraintsByStep.get(constraint.relativeStep) ?? [];
    values.push(constraint.mantissa);
    constraintsByStep.set(constraint.relativeStep, values);
  }

  let state = preState;
  for (let step = 1; step <= plan.maxRelativeStep; step++) {
    state = buildNextZ3State(state);
    for (const mantissa of constraintsByStep.get(step) ?? []) {
      solver.add(
        state.s0
          .lshr(plan.rightShiftBits)
          .eq(context.BitVec.val(mantissa, WORD_BITS)),
      );
    }
  }
  return { solver, preState };
};

/**
 * model から 64bit state 値を取り出し、`SolverCandidate` 用の BigInt state に戻す。
 */
const modelToCandidate = (
  solver: Z3Solver,
  preState: Z3State,
  plan: RawObservationConstraintPlan,
): V8CurrentZ3RawSolverCandidate => {
  const model = solver.model();
  try {
    const candidate = {
      cacheOffset: plan.cacheOffset,
      preState: {
        s0: model.eval(preState.s0, true).value(),
        s1: model.eval(preState.s1, true).value(),
      },
    };
    return {
      ...candidate,
      nextPrediction: predictNextObservedValue(candidate, plan),
    };
  } finally {
    model.release();
  }
};

/**
 * 取得済み model の state と同じ解を、次回以降の `check` から除外する。
 */
const blockCurrentCandidate = (
  context: Z3Context,
  solver: Z3Solver,
  preState: Z3State,
  candidate: V8CurrentZ3RawSolverCandidate,
) => {
  solver.add(
    preState.s0
      .neq(context.BitVec.val(candidate.preState.s0, WORD_BITS))
      .or(
        preState.s1.neq(context.BitVec.val(candidate.preState.s1, WORD_BITS)),
      ),
  );
};

/**
 * `solver.check()` の結果を、timeout / unknown の理由付きステータスへ変換する。
 */
const classifyUnknownResult = (
  solver: Z3Solver,
): {
  readonly status: "unknown" | "timeout";
  readonly reason: string;
} => {
  const reason =
    solver.reasonUnknown() || "Z3 が satisfiability を判定できませんでした。";
  return {
    status: reason.toLowerCase().includes("timeout") ? "timeout" : "unknown",
    reason,
  };
};

/**
 * 1 つの cache offset plan に対して、Z3 で raw observation 候補を列挙する。
 */
const enumeratePlanCandidates = async (
  context: Z3Context,
  plan: RawObservationConstraintPlan,
  options: {
    readonly timeoutMs: number;
    readonly maxCandidates: number;
    readonly maxZ3Candidates: number;
  },
): Promise<
  | {
      readonly status: "sat";
      readonly candidates: readonly V8CurrentZ3RawSolverCandidate[];
      readonly capped: boolean;
    }
  | {
      readonly status: "unsat";
      readonly candidates: readonly V8CurrentZ3RawSolverCandidate[];
    }
  | {
      readonly status: "unknown" | "timeout";
      readonly candidates: readonly V8CurrentZ3RawSolverCandidate[];
      readonly reason: string;
    }
> => {
  const { solver, preState } = addPlanConstraints(context, plan);
  solver.set("timeout", options.timeoutMs);

  const candidates: V8CurrentZ3RawSolverCandidate[] = [];
  try {
    while (candidates.length < options.maxCandidates) {
      const checkResult = await solver.check();
      if (checkResult === "unsat") {
        if (candidates.length > 0) {
          return { status: "sat", candidates, capped: false };
        }
        return { status: "unsat", candidates };
      }
      if (checkResult === "unknown") {
        return { ...classifyUnknownResult(solver), candidates };
      }

      const candidate = modelToCandidate(solver, preState, plan);
      candidates.push(candidate);
      blockCurrentCandidate(context, solver, preState, candidate);

      if (candidates.length >= options.maxZ3Candidates) {
        const extraCheck = await solver.check();
        if (extraCheck === "unsat") {
          return { status: "sat", candidates, capped: false };
        }
        if (extraCheck === "unknown") {
          return { ...classifyUnknownResult(solver), candidates };
        }
        return { status: "sat", candidates, capped: true };
      }
    }
    return { status: "sat", candidates, capped: true };
  } finally {
    solver.release();
  }
};

/**
 * GF(2) 簡約後の候補空間を使って、Z3 residual constraints へ渡す前提の raw 推論を行う。
 *
 * raw exact bit だけの現段階では residual constraint が空なので、この関数内で候補を列挙する。
 * converted observation を追加するときは、ここで得た候補空間を Z3 側の区間制約へ接続する。
 */
const solveV8CurrentRawObservationsWithOptimizedZ3 = async (
  observations: readonly number[],
  options: V8CurrentZ3RawSolverOptions = {},
): Promise<V8CurrentZ3RawSolverResult> => {
  const exhaustive = options.maxCandidates === "all";
  const maxCandidates = resolveCandidateLimit(options.maxCandidates);
  const maxZ3Candidates = options.maxZ3Candidates ?? DEFAULT_MAX_Z3_CANDIDATES;
  const candidateSafetyLimit = exhaustive ? maxZ3Candidates : maxCandidates;
  const cacheOffset = options.cacheOffset ?? DEFAULT_CACHE_OFFSET;
  const plans = buildPlans(observations, cacheOffset);
  const candidates: V8CurrentZ3RawSolverCandidate[] = [];

  for (const plan of plans) {
    const remainingSlots = candidateSafetyLimit - candidates.length;
    const reducedSpace = reduceRawPlanCandidateSpace(
      plan,
      exhaustive,
      remainingSlots,
    );
    if (reducedSpace === undefined) {
      return toSolverResult(
        "unknown",
        candidates,
        maxCandidates,
        exhaustive,
        "GF(2) 簡約後の候補数が Z3 spike の安全上限を超えました。",
      );
    }

    candidates.push(...enumerateReducedCandidateSpace(reducedSpace));
    if (!exhaustive && candidates.length >= maxCandidates) {
      return toSolverResult("multiple", candidates, maxCandidates, exhaustive);
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

/**
 * BitVec 制約を Z3 に直接渡し、blocking clause で候補を列挙する比較用 strategy。
 *
 * raw exact bit の全列挙には重いが、GF(2) 簡約前後の挙動差を測るために残している。
 */
const solveV8CurrentRawObservationsWithBitVecZ3 = async (
  observations: readonly number[],
  options: V8CurrentZ3RawSolverOptions = {},
): Promise<V8CurrentZ3RawSolverResult> => {
  const exhaustive = options.maxCandidates === "all";
  const maxCandidates = resolveCandidateLimit(options.maxCandidates);
  const maxZ3Candidates = options.maxZ3Candidates ?? DEFAULT_MAX_Z3_CANDIDATES;
  const timeoutMs = options.timeoutMs ?? DEFAULT_Z3_TIMEOUT_MS;
  const cacheOffset = options.cacheOffset ?? DEFAULT_CACHE_OFFSET;
  const plans = buildPlans(observations, cacheOffset);

  if (exhaustive && plans.some(shouldSkipExhaustiveEnumeration)) {
    return toSolverResult(
      "unknown",
      [],
      maxCandidates,
      exhaustive,
      "Z3 spike では解空間が大きすぎるため全列挙しません。",
    );
  }

  const { Context } = await getZ3();
  const context: Z3Context = new Context(Z3_CONTEXT_NAME);
  const candidates: V8CurrentZ3RawSolverCandidate[] = [];

  for (const plan of plans) {
    const remainingSlots = exhaustive
      ? Number.POSITIVE_INFINITY
      : maxCandidates - candidates.length;
    const planResult = await enumeratePlanCandidates(context, plan, {
      timeoutMs,
      maxCandidates: remainingSlots,
      maxZ3Candidates: maxZ3Candidates - candidates.length,
    });
    candidates.push(...planResult.candidates);

    if (planResult.status === "timeout" || planResult.status === "unknown") {
      return toSolverResult(
        planResult.status,
        candidates,
        maxCandidates,
        exhaustive,
        planResult.reason,
      );
    }
    if (planResult.status === "sat" && planResult.capped) {
      if (exhaustive) {
        return toSolverResult(
          "unknown",
          candidates,
          maxCandidates,
          exhaustive,
          "Z3 spike の安全上限に達したため全列挙を打ち切りました。",
        );
      }
      return toSolverResult("multiple", candidates, maxCandidates, exhaustive);
    }
    if (!exhaustive && candidates.length >= maxCandidates) {
      return toSolverResult("multiple", candidates, maxCandidates, exhaustive);
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

/**
 * V8 current cache/LIFO モデルの raw observation を、Z3 platform 前提で試験的に推論する。
 *
 * 既定では raw exact bit を GF(2) で簡約し、将来の Z3 residual constraint に渡す候補空間へ
 * 圧縮する。`strategy: "bitvec"` を指定すると、比較用の従来 BitVec strategy を使う。
 */
export const solveV8CurrentRawObservationsWithZ3 = async (
  observations: readonly number[],
  options: V8CurrentZ3RawSolverOptions = {},
): Promise<V8CurrentZ3RawSolverResult> => {
  if (options.strategy === "bitvec") {
    return solveV8CurrentRawObservationsWithBitVecZ3(observations, options);
  }
  return solveV8CurrentRawObservationsWithOptimizedZ3(observations, options);
};
