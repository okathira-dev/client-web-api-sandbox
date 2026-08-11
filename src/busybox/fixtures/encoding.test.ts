import { problemById } from "../domain/stages";
import {
  encodingFixtures,
  encodingProblemIds,
  encodingQuestionText,
} from "./encoding";

describe("S-640 product encoding fixture", () => {
  it("maps every fixture to the registered B01-B08 problem", () => {
    expect(encodingProblemIds).toHaveLength(encodingFixtures.length);
    expect(new Set(encodingProblemIds).size).toBe(encodingProblemIds.length);

    for (const problemId of encodingProblemIds) {
      expect(problemById[problemId]?.id).toBe(problemId);
    }
  });

  it("shows only the intended puzzle representation, never the direct answer", () => {
    for (const fixture of encodingFixtures) {
      const question = encodingQuestionText(fixture);
      expect(question).toBe(fixture.presentedText);
      expect(question).not.toBe(fixture.expectedText);
    }
  });
});
