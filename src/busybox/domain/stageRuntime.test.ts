import { deriveStageProgress, safeCapabilityProbe } from "./stageRuntime";

const solved = (id: string) => ({
  [id]: { solvedAt: "2026-01-01T00:00:00.000Z", facts: [] },
});

describe("Busybox stage runtime", () => {
  it("derives untouched, partial, and solved from problem boxes", () => {
    const boxIds = ["one", "two"];
    expect(deriveStageProgress(boxIds, {})).toBe("untouched");
    expect(deriveStageProgress(boxIds, solved("one"))).toBe("partial");
    expect(
      deriveStageProgress(boxIds, { ...solved("one"), ...solved("two") }),
    ).toBe("solved");
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
