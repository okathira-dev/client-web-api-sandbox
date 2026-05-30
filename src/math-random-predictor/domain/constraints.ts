import { rawObservationToMantissa } from "./observations";
import { V8_CURRENT_MODEL, type V8ModelMetadata } from "./v8Current";

export type RawObservationConstraint = {
  readonly observationIndex: number;
  readonly absoluteStep: number;
  readonly relativeStep: number;
  readonly mantissa: bigint;
};

export type RawObservationConstraintPlan = {
  readonly modelId: string;
  readonly cacheOffset: number;
  readonly cacheSize: number;
  readonly outputBits: number;
  readonly rightShiftBits: number;
  readonly observationCount: number;
  readonly minAbsoluteStep: number;
  readonly maxRelativeStep: number;
  readonly nextAbsoluteStep: number;
  readonly nextRelativeStep?: number;
  readonly nextUsesPreStateS0: boolean;
  readonly constraints: readonly RawObservationConstraint[];
};

/**
 * 指定されたモデルが cache/LIFO 型の `Math.random()` 実装かを検証する。
 */
const assertCacheModel = (model: V8ModelMetadata) => {
  if (!Number.isInteger(model.cacheSize) || model.cacheSize < 1) {
    throw new Error("cache を使うモデルのみ ConstraintPlan を生成できます。");
  }
};

/**
 * 観測開始位置として使う cache offset が、モデルの cache 範囲内かを検証する。
 */
const assertCacheOffset = (cacheOffset: number, cacheSize: number) => {
  if (
    !Number.isInteger(cacheOffset) ||
    cacheOffset < 0 ||
    cacheOffset >= cacheSize
  ) {
    throw new Error(`cache offset は 0..${cacheSize - 1} の整数が必要です。`);
  }
};

/**
 * raw observation 配列が空でなく、各値が `Math.random()` の範囲 `[0, 1)` に収まるか検証する。
 */
const assertRawObservations = (observations: readonly number[]) => {
  if (observations.length === 0) {
    throw new Error("観測値が空です。");
  }
  for (const value of observations) {
    if (!Number.isFinite(value) || value < 0 || value >= 1) {
      throw new Error("観測値は [0, 1) の範囲である必要があります。");
    }
  }
};

/**
 * cache/LIFO で観測された位置を、xorshift128+ が値を生成した絶対 step に変換する。
 *
 * V8 の cache は生成順に値を詰め、観測時は末尾から pop するため、
 * 同じ cache block 内では観測位置が進むほど生成 step は逆順になる。
 */
export const observedPositionToGeneratedStep = (
  observedPosition: number,
  cacheSize: number,
): number => {
  if (!Number.isInteger(observedPosition) || observedPosition < 0) {
    throw new Error("観測位置は 0 以上の整数である必要があります。");
  }
  if (!Number.isInteger(cacheSize) || cacheSize < 1) {
    throw new Error("cache size は 1 以上の整数である必要があります。");
  }
  const cacheBlock = Math.floor(observedPosition / cacheSize);
  const positionInCache = observedPosition % cacheSize;
  return cacheBlock * cacheSize + (cacheSize - positionInCache);
};

/**
 * 既知の cache offset から、raw observation を solver 非依存の制約計画に変換する。
 *
 * 観測列が cache 境界をまたぐ場合も、生成 step 順に制約を並べ替え、
 * 次値予測に必要な相対 step も同時に計算する。
 */
export const buildV8CacheLifoRawConstraintPlanForOffset = (
  observations: readonly number[],
  cacheOffset: number,
  model: V8ModelMetadata = V8_CURRENT_MODEL,
): RawObservationConstraintPlan => {
  assertCacheModel(model);
  assertRawObservations(observations);
  assertCacheOffset(cacheOffset, model.cacheSize);

  const absoluteSteps = observations.map((_, index) =>
    observedPositionToGeneratedStep(cacheOffset + index, model.cacheSize),
  );
  const minAbsoluteStep = Math.min(...absoluteSteps);
  const nextAbsoluteStep = observedPositionToGeneratedStep(
    cacheOffset + observations.length,
    model.cacheSize,
  );
  const constraints = observations
    .map((value, index) => {
      const absoluteStep = absoluteSteps[index];
      if (absoluteStep === undefined) {
        throw new Error("観測値の step 計算に失敗しました。");
      }
      return {
        observationIndex: index,
        absoluteStep,
        relativeStep: absoluteStep - minAbsoluteStep + 1,
        mantissa: rawObservationToMantissa(value, model.outputBits),
      };
    })
    .sort((a, b) => a.relativeStep - b.relativeStep);

  const nextRelativeStep =
    nextAbsoluteStep >= minAbsoluteStep
      ? nextAbsoluteStep - minAbsoluteStep + 1
      : undefined;

  return {
    modelId: model.id,
    cacheOffset,
    cacheSize: model.cacheSize,
    outputBits: model.outputBits,
    rightShiftBits: model.lostBitsPerRawObservation,
    observationCount: observations.length,
    minAbsoluteStep,
    maxRelativeStep: Math.max(
      ...constraints.map((constraint) => constraint.relativeStep),
    ),
    nextAbsoluteStep,
    nextRelativeStep,
    nextUsesPreStateS0: nextAbsoluteStep === minAbsoluteStep - 1,
    constraints,
  };
};

/**
 * cache offset が未知のときに、全 offset について制約計画を生成する。
 *
 * solver 側はこの候補群を使って、観測開始位置の曖昧さを推論対象に含める。
 */
export const buildV8CacheLifoRawConstraintPlans = (
  observations: readonly number[],
  model: V8ModelMetadata = V8_CURRENT_MODEL,
): RawObservationConstraintPlan[] => {
  assertCacheModel(model);
  assertRawObservations(observations);
  return Array.from({ length: model.cacheSize }, (_, cacheOffset) =>
    buildV8CacheLifoRawConstraintPlanForOffset(
      observations,
      cacheOffset,
      model,
    ),
  );
};
