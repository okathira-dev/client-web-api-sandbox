import { stageManifest } from "../data/stageManifest";
import { problemById, stageCatalogue, totalBoxCount } from "../domain/stages";
import { stageDefinitions } from "./stageDefinitions";

describe("Busybox stage registry", () => {
  it("implements every planned stage exactly once", () => {
    expect(Object.keys(stageDefinitions).sort()).toEqual(
      stageCatalogue.map((stage) => stage.id).sort(),
    );
  });

  it("keeps documented problem-box counts aligned", () => {
    expect(totalBoxCount).toBe(42);
    for (const stage of stageCatalogue) {
      const problemIds = stage.problems.map((problem) => problem.id);
      expect(new Set(problemIds).size).toBe(problemIds.length);
      expect(stageDefinitions[stage.id]?.stage).toBe(stage);
    }
  });

  it("gives every problem exactly one color and clue presentation", () => {
    const plannedBoxIds = stageCatalogue.flatMap((stage) =>
      stage.problems.map((problem) => problem.id),
    );
    expect(Object.keys(problemById).sort()).toEqual([...plannedBoxIds].sort());
    expect(new Set(plannedBoxIds).size).toBe(totalBoxCount);
  });

  it("gives every stage one deterministic map position", () => {
    const branchOrders = new Set<string>();
    for (const stage of stageCatalogue) {
      expect(stage.map.branch).toMatch(/^(page|device|storage|passage|labs)$/);
      expect(Number.isFinite(stage.map.order)).toBe(true);
      const key = `${stage.map.branch}:${stage.map.order}`;
      expect(branchOrders.has(key)).toBe(false);
      branchOrders.add(key);
    }
  });

  it("keeps the machine-readable manifest aligned with the catalogue", () => {
    expect(stageManifest.map((stage) => stage.id)).toEqual(
      stageCatalogue.map((stage) => stage.id),
    );
    for (const stage of stageManifest) {
      expect(stage.problemIds.length).toBeGreaterThan(0);
      expect(stage.apiFeatures.length).toBeGreaterThan(0);
      expect(stage.humanTestIds.length).toBeGreaterThan(0);
    }
  });
});
