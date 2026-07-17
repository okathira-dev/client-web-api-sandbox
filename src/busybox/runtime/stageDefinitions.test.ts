import { stageCatalogue, totalBoxCount } from "../domain/stages";
import { problemBoxPresentation } from "../ui/problemBoxPresentation";
import { stageDefinitions } from "./stageDefinitions";

describe("Busybox stage registry", () => {
  it("implements every planned stage exactly once", () => {
    expect(Object.keys(stageDefinitions).sort()).toEqual(
      stageCatalogue.map((stage) => stage.id).sort(),
    );
  });

  it("keeps documented problem-box counts aligned", () => {
    expect(totalBoxCount).toBe(34);
    for (const stage of stageCatalogue) {
      expect(stage.boxIds).toHaveLength(stage.boxCount);
      expect(new Set(stage.boxIds).size).toBe(stage.boxCount);
      expect(stageDefinitions[stage.id]?.summary).toBe(stage);
    }
  });

  it("gives every problem exactly one color and clue presentation", () => {
    const plannedBoxIds = stageCatalogue.flatMap((stage) => stage.boxIds);
    expect(Object.keys(problemBoxPresentation).sort()).toEqual(
      [...plannedBoxIds].sort(),
    );
    expect(new Set(plannedBoxIds).size).toBe(totalBoxCount);
  });
});
