import type { SolverAdapter, SolverResult } from "./types";
import {
  solveV8CurrentConvertedObservations,
  type V8CurrentConvertedSolverOptions,
} from "./v8CurrentConvertedSolver";
import {
  solveV8CurrentRawObservations,
  type V8CurrentSolverOptions,
} from "./v8CurrentNodeSolver";

/** V8 current モデルで扱う観測系列の種別。 */
export type V8ObservationSeriesKind = "raw" | "converted";

export type V8CurrentRawSolveInput = {
  readonly kind: "raw";
  readonly observations: readonly number[];
};

export type V8CurrentConvertedSolveInput = {
  readonly kind: "converted";
  readonly observations: readonly number[];
  readonly n: number;
};

export type V8CurrentSolveInput =
  | V8CurrentRawSolveInput
  | V8CurrentConvertedSolveInput;

export type V8CurrentSolveOptions = V8CurrentSolverOptions &
  V8CurrentConvertedSolverOptions;

/**
 * 観測系列種別に応じて raw GF(2) solver または converted Z3 solver を呼び分ける。
 */
export const solveV8CurrentObservations = async (
  input: V8CurrentSolveInput,
  options: V8CurrentSolveOptions = {},
): Promise<SolverResult> => {
  if (input.kind === "raw") {
    return solveV8CurrentRawObservations(input.observations, options);
  }
  return solveV8CurrentConvertedObservations(
    input.observations,
    input.n,
    options,
  );
};

/** raw 観測用の `SolverAdapter`。 */
export const v8CurrentRawSolverAdapter: SolverAdapter<
  readonly number[],
  V8CurrentSolverOptions
> = {
  solve: (observations, options) =>
    solveV8CurrentRawObservations(observations, options),
};

/** 変換系列観測用の `SolverAdapter`。 */
export const v8CurrentConvertedSolverAdapter: SolverAdapter<
  { readonly observations: readonly number[]; readonly n: number },
  V8CurrentConvertedSolverOptions
> = {
  solve: ({ observations, n }, options) =>
    solveV8CurrentConvertedObservations(observations, n, options),
};
