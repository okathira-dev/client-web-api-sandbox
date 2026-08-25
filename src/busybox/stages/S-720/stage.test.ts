import { findVideoRecoveryRoute, type VideoPatchCable } from "./stage";

describe("S-720 video patch routes", () => {
  it.each<readonly [string, VideoPatchCable[], string]>([
    [
      "T1",
      [
        { from: "source1", to: "t1a" },
        { from: "t1a", to: "output" },
      ],
      "t1",
    ],
    [
      "T2",
      [
        { from: "source2", to: "t2a" },
        { from: "t2a", to: "output" },
      ],
      "t2",
    ],
    [
      "alpha",
      [
        { from: "source3", to: "t3a" },
        { from: "t3a", to: "t2a" },
        { from: "t2a", to: "output" },
      ],
      "alpha",
    ],
    [
      "beta uses each transform kind twice",
      [
        { from: "source3", to: "t1a" },
        { from: "t1a", to: "t3a" },
        { from: "t3a", to: "t2a" },
        { from: "t2a", to: "t1b" },
        { from: "t1b", to: "output" },
      ],
      "beta",
    ],
  ])("recognizes %s", (_label, cables, route) => {
    expect(findVideoRecoveryRoute(cables)).toBe(route);
  });

  it("does not accept a transform button without a source-to-output path", () => {
    expect(
      findVideoRecoveryRoute([
        { from: "source3", to: "t1a" },
        { from: "t1a", to: "output" },
      ]),
    ).toBeUndefined();
  });
});
