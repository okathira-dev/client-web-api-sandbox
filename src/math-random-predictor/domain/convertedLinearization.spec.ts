import { convertedObservationToMantissaInterval } from "./constraints";
import { extractFixedMantissaBitsFromInterval } from "./convertedLinearization";

describe("extractFixedMantissaBitsFromInterval", () => {
  it("空区間では固定 bit を返さないこと", () => {
    expect(extractFixedMantissaBitsFromInterval(5n, 5n, 53)).toEqual([]);
  });

  it("単点区間では全 bit が固定されること", () => {
    const fixed = extractFixedMantissaBitsFromInterval(42n, 43n, 8);
    expect(fixed).toHaveLength(8);
    expect(fixed.every(({ value }) => value === 0 || value === 1)).toBe(true);
  });

  it("N=4096 の区間では MSB 側に多くの固定 bit があること", () => {
    const { lowerInclusive, upperExclusive } =
      convertedObservationToMantissaInterval(100, 4096, 53);
    const fixed = extractFixedMantissaBitsFromInterval(
      lowerInclusive,
      upperExclusive,
      53,
    );
    expect(fixed.length).toBeGreaterThan(10);
  });

  it("N=2 の区間では固定 bit が少ないこと", () => {
    const { lowerInclusive, upperExclusive } =
      convertedObservationToMantissaInterval(0, 2, 53);
    const fixed = extractFixedMantissaBitsFromInterval(
      lowerInclusive,
      upperExclusive,
      53,
    );
    expect(fixed.length).toBeLessThan(10);
  });

  it("プレフィックスが一致する区間では上位 bit だけ固定されること", () => {
    const fixed = extractFixedMantissaBitsFromInterval(0b1100n, 0b1110n, 4);
    expect(fixed.map((entry) => entry.bit)).toEqual([3, 2, 1]);
    expect(fixed.map((entry) => entry.value)).toEqual([1, 1, 0]);
  });
});
