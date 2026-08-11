import {
  decodeFatal,
  encodingFixturePositions,
  encodingFixtures,
  encodingLabels,
  isVisiblePuzzleText,
  solveEncodingFixtures,
  validLabelsForPosition,
} from "./data";

describe("S-640 encoding PoC fixture", () => {
  it("has eight mojibake questions and two decoder positions per question", () => {
    expect(encodingFixtures).toHaveLength(8);
    expect(encodingFixturePositions).toHaveLength(16);
    expect(new Set(encodingLabels).size).toBe(16);
    expect(
      encodingFixtures.every((fixture) => fixture.kind === "mojibake"),
    ).toBe(true);
    expect(encodingLabels).toContain("windows-1255");
    expect(encodingLabels).not.toContain("euc-jp");
  });

  it("keeps every player answer and displayed question text distinct", () => {
    const answers = encodingFixtures.map((item) => item.expectedText);
    const presented = encodingFixtures.map((item) => item.presentedText);
    expect(new Set(answers).size).toBe(encodingFixtures.length);
    expect(new Set(presented).size).toBe(encodingFixtures.length);

    for (const fixture of encodingFixtures) {
      expect([...(fixture.expectedText ?? "")].length).toBeGreaterThanOrEqual(
        3,
      );
      expect(fixture.expectedText).toContain(" ");
    }
  });

  it("decodes every direct question and both sides of every mojibake question", () => {
    for (const item of encodingFixtures) {
      if (item.kind === "mojibake") {
        expect(item.sourceLabel).not.toBe(item.renderedLabel);
        expect(decodeFatal(item.sourceLabel, item.bytes)).toBe(
          item.expectedText,
        );
        expect(decodeFatal(item.renderedLabel, item.bytes)).toBe(
          item.presentedText,
        );
      }
      expect(isVisiblePuzzleText(item.expectedText)).toBe(true);
      expect(isVisiblePuzzleText(item.presentedText)).toBe(true);
    }
  });

  it("keeps each ordered decoder pair unambiguous", () => {
    for (const position of encodingFixturePositions) {
      expect(validLabelsForPosition(position)).toContain(
        position.expectedLabel,
      );
    }

    const [solution] = solveEncodingFixtures();
    expect(solveEncodingFixtures()).toHaveLength(1);
    expect(solution).toBeDefined();
    for (const position of encodingFixturePositions) {
      expect(solution?.get(position.id)).toBe(position.expectedLabel);
    }
  });
});
