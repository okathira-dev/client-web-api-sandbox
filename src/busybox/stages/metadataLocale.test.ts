import { stageCatalogue } from "../domain/stages";
import { problemLabelText, stageNameText } from "./metadataLocale";

describe("stage metadata locale registry", () => {
  it("resolves every stage and problem label from adjacent locale bundles", () => {
    for (const stage of stageCatalogue) {
      expect(stageNameText("ja", stage.id)).not.toBe(stage.id);
      expect(stageNameText("en", stage.id)).not.toBe(stage.id);
      for (const problem of stage.problems) {
        expect(problemLabelText("ja", problem.id)).not.toBe(problem.id);
        expect(problemLabelText("en", problem.id)).not.toBe(problem.id);
      }
    }
  });
});
