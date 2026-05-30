import {
  buildV8CacheLifoRawConstraintPlanForOffset,
  buildV8CacheLifoRawConstraintPlans,
  observedPositionToGeneratedStep,
} from "./constraints";
import { createV8CurrentGeneratorFromSeed } from "./v8Current";

describe("constraints", () => {
  it("cache/LIFO の観測位置を生成 step に変換できること", () => {
    expect(observedPositionToGeneratedStep(0, 64)).toBe(64);
    expect(observedPositionToGeneratedStep(63, 64)).toBe(1);
    expect(observedPositionToGeneratedStep(64, 64)).toBe(128);
    expect(observedPositionToGeneratedStep(65, 64)).toBe(127);
  });

  it("cache 先頭から始まる raw observations の制約を生成順に並べられること", () => {
    const generator = createV8CurrentGeneratorFromSeed(1337n);
    const observations = Array.from({ length: 4 }, () => generator.next());

    const plan = buildV8CacheLifoRawConstraintPlanForOffset(observations, 0);

    expect(plan.cacheOffset).toBe(0);
    expect(plan.minAbsoluteStep).toBe(61);
    expect(plan.nextUsesPreStateS0).toBe(true);
    expect(
      plan.constraints.map((constraint) => constraint.absoluteStep),
    ).toEqual([61, 62, 63, 64]);
    expect(
      plan.constraints.map((constraint) => constraint.observationIndex),
    ).toEqual([3, 2, 1, 0]);
  });

  it("cache 境界をまたぐ raw observations の制約候補を作れること", () => {
    const generator = createV8CurrentGeneratorFromSeed(1337n);
    const observations = Array.from({ length: 70 }, () =>
      generator.next(),
    ).slice(60, 70);

    const plan = buildV8CacheLifoRawConstraintPlanForOffset(observations, 60);

    expect(plan.minAbsoluteStep).toBe(1);
    expect(plan.maxRelativeStep).toBe(128);
    expect(plan.nextUsesPreStateS0).toBe(false);
    expect(plan.nextRelativeStep).toBe(122);
    expect(
      plan.constraints.map((constraint) => constraint.absoluteStep),
    ).toEqual([1, 2, 3, 4, 123, 124, 125, 126, 127, 128]);
    expect(
      plan.constraints.map((constraint) => constraint.observationIndex),
    ).toEqual([3, 2, 1, 0, 9, 8, 7, 6, 5, 4]);
  });

  it("cache offset 不明の場合は全 offset の候補を作ること", () => {
    const plans = buildV8CacheLifoRawConstraintPlans([0.1, 0.2]);

    expect(plans).toHaveLength(64);
    expect(plans[0]?.cacheOffset).toBe(0);
    expect(plans[63]?.cacheOffset).toBe(63);
  });

  it("不正な観測値と cache offset を拒否すること", () => {
    expect(() => buildV8CacheLifoRawConstraintPlans([])).toThrow(
      "観測値が空です。",
    );
    expect(() =>
      buildV8CacheLifoRawConstraintPlanForOffset([0.1, 1], 0),
    ).toThrow("観測値は [0, 1) の範囲である必要があります。");
    expect(() => buildV8CacheLifoRawConstraintPlanForOffset([0.1], 64)).toThrow(
      "cache offset は 0..63 の整数が必要です。",
    );
  });
});
