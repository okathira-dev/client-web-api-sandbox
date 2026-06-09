import type { BitVec, Solver } from "z3-solver";
import {
  buildV8CacheLifoConvertedConstraintPlanForOffset,
  type ConvertedObservationConstraint,
  type ConvertedObservationConstraintPlan,
} from "../domain/constraints";
import { advanceV8State, floorRandom } from "../domain/v8Current";
import { resolveCandidateLimit, toSolverResult } from "./solverResult";
import type { SolverCandidate, SolverResult } from "./types";
import { buildV8CacheOffsetPlans } from "./v8CacheOffsetPlans";
import {
  createV8CurrentZ3Context,
  type V8_CURRENT_Z3_CONTEXT_NAME,
} from "./z3Platform";

type Z3Context = Awaited<ReturnType<typeof createV8CurrentZ3Context>>;
type Z3BitVec = BitVec<64, typeof V8_CURRENT_Z3_CONTEXT_NAME>;
type Z3Solver = Solver<typeof V8_CURRENT_Z3_CONTEXT_NAME>;

export type V8CurrentConvertedSolverCandidate = SolverCandidate;
export type V8CurrentConvertedSolverResult = SolverResult;

export type V8CurrentConvertedSolverOptions = {
  /** 候補 preview の上限。`"all"` の場合は列挙上限まで全候補を集める。 */
  readonly maxCandidates?: number | "all";
  /** Z3 solver の timeout（ミリ秒）。 */
  readonly timeoutMs?: number;
  /** 観測開始位置の cache offset。未知の場合は代表 offset 候補を探索する。 */
  readonly cacheOffset?: number | "unknown";
  /** Z3 で列挙する候補数の上限。 */
  readonly maxZ3Candidates?: number;
};

/** 最大 2 モデルまで探索して一意性を判定した結果。 */
export type V8CurrentConvertedUniquenessProbeResult = {
  readonly status: SolverResult["status"];
  /** 2 個目のモデルが存在しないことまで確認できたときのみ true。 */
  readonly uniquenessConfirmed: boolean;
  readonly candidateCount: number;
  readonly candidates: readonly V8CurrentConvertedSolverCandidate[];
  readonly nextPrediction?: number;
  readonly reason?: string;
};

const DEFAULT_MAX_CANDIDATES = 2;
const DEFAULT_CACHE_OFFSET = "unknown";
const WORD_BITS = 64;
const DEFAULT_Z3_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_Z3_CANDIDATES = 256;
const MAX_EXHAUSTIVE_CANDIDATE_BITS = 12;

type Z3State = {
  readonly s0: Z3BitVec;
  readonly s1: Z3BitVec;
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
  candidate: V8CurrentConvertedSolverCandidate,
  plan: ConvertedObservationConstraintPlan,
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
 * 候補 state から、次の変換系列観測値 `floor(random * N)` を計算する。
 */
const predictNextConvertedValue = (
  candidate: V8CurrentConvertedSolverCandidate,
  plan: ConvertedObservationConstraintPlan,
): number => {
  const mantissa = predictNextObservedMantissa(candidate, plan);
  const raw = Number(mantissa) / 2 ** plan.outputBits;
  return floorRandom(raw, plan.n);
};

/**
 * 観測数から、全列挙を試みるべきでないかを保守的に判定する。
 */
const shouldSkipExhaustiveEnumeration = (
  plan: ConvertedObservationConstraintPlan,
): boolean => {
  if (plan.observationCount < 2) {
    return true;
  }
  const intervalBits = plan.constraints.reduce(
    (bits, constraint) =>
      bits +
      Math.ceil(
        Math.log2(
          Number(constraint.upperExclusive - constraint.lowerInclusive),
        ),
      ),
    0,
  );
  const estimatedFreeBits =
    plan.outputBits * plan.observationCount - intervalBits;
  return estimatedFreeBits > MAX_EXHAUSTIVE_CANDIDATE_BITS;
};

/**
 * 制約計画を Z3 solver に追加し、初期 state 変数を返す。
 */
const addConvertedPlanConstraints = (
  context: Z3Context,
  plan: ConvertedObservationConstraintPlan,
): {
  readonly solver: Z3Solver;
  readonly preState: Z3State;
} => {
  const solver = new context.Solver();
  const preState = {
    s0: context.BitVec.const("s0", WORD_BITS),
    s1: context.BitVec.const("s1", WORD_BITS),
  };
  const constraintsByStep = new Map<number, ConvertedObservationConstraint[]>();
  for (const constraint of plan.constraints) {
    const values = constraintsByStep.get(constraint.relativeStep) ?? [];
    values.push(constraint);
    constraintsByStep.set(constraint.relativeStep, values);
  }

  let state = preState;
  for (let step = 1; step <= plan.maxRelativeStep; step++) {
    state = buildNextZ3State(state);
    for (const constraint of constraintsByStep.get(step) ?? []) {
      const mantissa = state.s0.lshr(plan.rightShiftBits);
      solver.add(
        mantissa.uge(context.BitVec.val(constraint.lowerInclusive, WORD_BITS)),
      );
      solver.add(
        mantissa.ult(context.BitVec.val(constraint.upperExclusive, WORD_BITS)),
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
  plan: ConvertedObservationConstraintPlan,
): V8CurrentConvertedSolverCandidate => {
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
      nextPrediction: predictNextConvertedValue(candidate, plan),
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
  candidate: V8CurrentConvertedSolverCandidate,
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
 * 1 つの converted 制約 plan に対して、Z3 で internal state 候補を列挙する。
 */
const enumeratePlanCandidates = async (
  context: Z3Context,
  plan: ConvertedObservationConstraintPlan,
  options: {
    readonly timeoutMs: number;
    readonly maxCandidates: number;
    readonly maxZ3Candidates: number;
  },
): Promise<
  | {
      readonly status: "sat";
      readonly candidates: readonly V8CurrentConvertedSolverCandidate[];
      readonly capped: boolean;
    }
  | {
      readonly status: "unsat";
      readonly candidates: readonly V8CurrentConvertedSolverCandidate[];
    }
  | {
      readonly status: "unknown" | "timeout";
      readonly candidates: readonly V8CurrentConvertedSolverCandidate[];
      readonly reason: string;
    }
> => {
  const { solver, preState } = addConvertedPlanConstraints(context, plan);
  solver.set("timeout", options.timeoutMs);

  const candidates: V8CurrentConvertedSolverCandidate[] = [];
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
 * 1 つの制約 plan を Z3 で解き、呼び出し側の候補配列へ結果をマージする。
 */
const solvePlan = async (
  context: Z3Context,
  plan: ConvertedObservationConstraintPlan,
  options: {
    readonly exhaustive: boolean;
    readonly maxCandidates: number;
    readonly maxZ3Candidates: number;
    readonly timeoutMs: number;
    readonly candidates: V8CurrentConvertedSolverCandidate[];
  },
): Promise<
  | {
      readonly kind: "continue";
      readonly candidates: V8CurrentConvertedSolverCandidate[];
    }
  | { readonly kind: "done"; readonly result: V8CurrentConvertedSolverResult }
> => {
  if (options.exhaustive && shouldSkipExhaustiveEnumeration(plan)) {
    return {
      kind: "done",
      result: toSolverResult(
        "unknown",
        options.candidates,
        options.maxCandidates,
        options.exhaustive,
        "候補数が多すぎるため全列挙できません。",
      ),
    };
  }

  const remainingSlots = options.exhaustive
    ? options.maxZ3Candidates - options.candidates.length
    : options.maxCandidates - options.candidates.length;
  if (remainingSlots <= 0 && !options.exhaustive) {
    return {
      kind: "done",
      result: toSolverResult(
        "multiple",
        options.candidates,
        options.maxCandidates,
        options.exhaustive,
      ),
    };
  }

  const candidateLimit = options.exhaustive
    ? remainingSlots
    : Math.min(remainingSlots, options.maxZ3Candidates);

  const planResult = await enumeratePlanCandidates(context, plan, {
    timeoutMs: options.timeoutMs,
    maxCandidates: candidateLimit,
    maxZ3Candidates: candidateLimit,
  });

  const candidates = [...options.candidates, ...planResult.candidates];

  if (planResult.status === "timeout" || planResult.status === "unknown") {
    return {
      kind: "done",
      result: toSolverResult(
        planResult.status,
        candidates,
        options.maxCandidates,
        options.exhaustive,
        planResult.reason,
      ),
    };
  }

  if (planResult.status === "sat" && planResult.capped) {
    if (options.exhaustive) {
      return {
        kind: "done",
        result: toSolverResult(
          "unknown",
          candidates,
          options.maxCandidates,
          options.exhaustive,
          "Z3 の列挙上限に達したため全列挙を打ち切りました。",
        ),
      };
    }
    return {
      kind: "done",
      result: toSolverResult(
        "multiple",
        candidates,
        options.maxCandidates,
        options.exhaustive,
      ),
    };
  }

  if (!options.exhaustive && candidates.length >= options.maxCandidates) {
    return {
      kind: "done",
      result: toSolverResult(
        "multiple",
        candidates,
        options.maxCandidates,
        options.exhaustive,
      ),
    };
  }

  return { kind: "continue", candidates };
};

/**
 * `v8-node-24-cache-lifo-state0` の変換系列観測を、Z3 BitVec 区間制約で推論する（bitvec strategy）。
 */
export const solveV8CurrentConvertedObservationsWithBitVecZ3 = async (
  observations: readonly number[],
  n: number,
  options: V8CurrentConvertedSolverOptions = {},
): Promise<V8CurrentConvertedSolverResult> => {
  const exhaustive = options.maxCandidates === "all";
  const maxCandidates = resolveCandidateLimit(
    options.maxCandidates,
    DEFAULT_MAX_CANDIDATES,
  );
  const maxZ3Candidates = options.maxZ3Candidates ?? DEFAULT_MAX_Z3_CANDIDATES;
  const timeoutMs = options.timeoutMs ?? DEFAULT_Z3_TIMEOUT_MS;
  const cacheOffset = options.cacheOffset ?? DEFAULT_CACHE_OFFSET;
  const plans = buildV8CacheOffsetPlans(
    observations.length,
    cacheOffset,
    (offset) =>
      buildV8CacheLifoConvertedConstraintPlanForOffset(observations, n, offset),
  );

  const context = await createV8CurrentZ3Context();
  let candidates: V8CurrentConvertedSolverCandidate[] = [];

  for (const plan of plans) {
    const step = await solvePlan(context, plan, {
      exhaustive,
      maxCandidates,
      maxZ3Candidates,
      timeoutMs,
      candidates,
    });
    if (step.kind === "done") {
      return step.result;
    }
    candidates = [...step.candidates];
  }

  if (candidates.length === 0) {
    return toSolverResult("unsat", candidates, maxCandidates, exhaustive);
  }
  if (candidates.length === 1) {
    return toSolverResult("unique", candidates, maxCandidates, exhaustive);
  }
  return toSolverResult("multiple", candidates, maxCandidates, exhaustive);
};
