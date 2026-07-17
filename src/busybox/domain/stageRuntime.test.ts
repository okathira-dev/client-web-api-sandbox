import {
  countSolvedBoxes,
  deriveProblemBoxVisualState,
  deriveStageProgress,
  safeCapabilityProbe,
} from "./stageRuntime";

const solved = (id: string) => ({
  [id]: { solvedAt: "2026-01-01T00:00:00.000Z", facts: [] },
});

describe("Busybox stage runtime", () => {
  it("separates persistent history from the current attempt", () => {
    expect(deriveProblemBoxVisualState(false, false)).toBe("ribboned");
    expect(deriveProblemBoxVisualState(true, false)).toBe("closed");
    expect(deriveProblemBoxVisualState(false, true)).toBe("open");
    expect(deriveProblemBoxVisualState(true, true)).toBe("open");
  });

  it("derives untouched, partial, and solved from problem boxes", () => {
    const boxIds = ["one", "two"];
    expect(deriveStageProgress(boxIds, {})).toBe("untouched");
    expect(deriveStageProgress(boxIds, solved("one"))).toBe("partial");
    expect(
      deriveStageProgress(boxIds, { ...solved("one"), ...solved("two") }),
    ).toBe("solved");
  });

  it("counts cumulative solves only for the active stage", () => {
    expect(
      countSolvedBoxes(["one", "two", "three"], {
        ...solved("one"),
        ...solved("two"),
        ...solved("another-stage"),
      }),
    ).toBe(2);
  });

  it("contains capability probe failures", () => {
    expect(safeCapabilityProbe(() => "available")).toBe("available");
    expect(
      safeCapabilityProbe(() => {
        throw new Error("browser getter failed");
      }),
    ).toBe("unknown");
  });
});
