import { manifest } from "../stages/S-640/manifest";
import { encodingFixtures, encodingQuestionText } from "./encoding";

describe("S-640 product encoding fixture", () => {
  it("contains one fixture for each box in the stage", () => {
    expect(encodingFixtures).toHaveLength(manifest.boxIds.length);
    expect(new Set(encodingFixtures).size).toBe(encodingFixtures.length);
  });

  it("shows only the intended puzzle representation, never the direct answer", () => {
    for (const fixture of encodingFixtures) {
      const question = encodingQuestionText(fixture);
      expect(question).toBe(fixture.presentedText);
      expect(question).not.toBe(fixture.expectedText);
    }
  });
});
