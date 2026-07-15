import { stageCatalogue, totalBoxCount } from "../domain/stages";
import { stageDefinitions } from "./stageDefinitions";

describe("Busybox stage registry", () => {
  it("implements every planned stage exactly once", () => {
    expect(Object.keys(stageDefinitions).sort()).toEqual(
      stageCatalogue.map((stage) => stage.id).sort(),
    );
  });

  it("keeps documented problem-box counts aligned", () => {
    expect(totalBoxCount).toBe(19);
    for (const stage of stageCatalogue) {
      expect(stage.boxIds).toHaveLength(stage.boxCount);
      expect(new Set(stage.boxIds).size).toBe(stage.boxCount);
      expect(stageDefinitions[stage.id]?.summary).toBe(stage);
    }
  });
});
