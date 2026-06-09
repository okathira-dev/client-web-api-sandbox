import { V8_CURRENT_MODEL } from "../domain/v8Current";

/**
 * cache offset が未知のときに試す代表 offset の集合を返す。
 *
 * cache 先頭と、観測列が cache 境界をまたぎ得る offset を優先する。
 */
export const buildRepresentativeCacheOffsets = (
  observationCount: number,
  cacheSize = V8_CURRENT_MODEL.cacheSize,
): number[] => {
  const firstBoundaryOffset = Math.max(0, cacheSize - observationCount);
  const boundaryOffsets = Array.from(
    { length: cacheSize - firstBoundaryOffset },
    (_, index) => firstBoundaryOffset + index,
  ).sort((left, right) => {
    const pivot = cacheSize - 4;
    return Math.abs(left - pivot) - Math.abs(right - pivot);
  });
  return [...new Set([0, ...boundaryOffsets])];
};

/**
 * cache offset option から、制約 plan を生成する offset 一覧を決める。
 */
export const buildV8CacheOffsetList = (
  observationCount: number,
  cacheOffset: number | "unknown",
  cacheSize = V8_CURRENT_MODEL.cacheSize,
): number[] => {
  const offsets =
    cacheOffset === "unknown"
      ? buildRepresentativeCacheOffsets(observationCount, cacheSize)
      : [cacheOffset];
  return [...offsets].sort((left, right) => {
    if (left === 0) {
      return -1;
    }
    if (right === 0) {
      return 1;
    }
    return left - right;
  });
};

/**
 * offset 一覧ごとに制約 plan を生成する。
 */
export const buildV8CacheOffsetPlans = <Plan>(
  observationCount: number,
  cacheOffset: number | "unknown",
  buildPlanForOffset: (offset: number) => Plan,
  cacheSize = V8_CURRENT_MODEL.cacheSize,
): Plan[] => {
  return buildV8CacheOffsetList(observationCount, cacheOffset, cacheSize).map(
    buildPlanForOffset,
  );
};
