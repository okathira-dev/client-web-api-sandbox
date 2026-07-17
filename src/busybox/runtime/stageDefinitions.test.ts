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
});
