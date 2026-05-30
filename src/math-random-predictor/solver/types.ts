import type { V8State } from "../domain/v8Current";

/** Solver が返す推論状態。UI/CLI はこの状態を表示用ラベルへ変換する。 */
export type SolverStatus =
  | "unique"
  | "multiple"
  | "unsat"
  | "unknown"
  | "timeout"
  | "unavailable";

export type SolverCandidate = {
  readonly preState: V8State;
  readonly cacheOffset?: number;
  readonly nextPrediction?: number;
};

/**
 * UI/CLI が solver 実装に依存せず扱える共通の推論結果。
 */
export type SolverResult = {
  readonly status: SolverStatus;
  readonly unique: boolean;
  readonly uniqueConfirmed: boolean;
  readonly candidateCount: number;
  readonly candidatesPreview: readonly SolverCandidate[];
  readonly candidates: readonly SolverCandidate[];
  readonly nextPrediction?: number;
  readonly nextPredictions: readonly number[];
  readonly reason?: string;
};

/**
 * 入力形式と option を差し替えられる solver 境界。
 */
export type SolverAdapter<Input, Options = unknown> = {
  readonly solve: (input: Input, options?: Options) => Promise<SolverResult>;
};
