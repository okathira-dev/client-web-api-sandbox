import {
  classifyS810AspectRatio,
  isAspectRatioWithinTolerance,
} from "./functions";

describe("S-810 aspect-ratio gates", () => {
  it.each([
    [1, 1, "square"],
    [4, 3, "four-three"],
    [16, 9, "sixteen-nine"],
    [9, 20, "nine-twenty"],
  ] as const)("classifies %sx%s as %s", (width, height, expected) => {
    expect(classifyS810AspectRatio(width, height)).toBe(expected);
  });

  it("accepts the relative five-percent boundary and rejects a larger error", () => {
    expect(isAspectRatioWithinTolerance(1.05, 1)).toBe(true);
    expect(isAspectRatioWithinTolerance(1.051, 1)).toBe(false);
    expect(isAspectRatioWithinTolerance(4 / 3, 4 / 3)).toBe(true);
  });

  it.each([
    [0, 360],
    [360, 0],
    [Number.NaN, 360],
    [360, Number.POSITIVE_INFINITY],
  ])("does not classify invalid dimensions %s × %s", (width, height) => {
    expect(classifyS810AspectRatio(width, height)).toBeUndefined();
  });
});
