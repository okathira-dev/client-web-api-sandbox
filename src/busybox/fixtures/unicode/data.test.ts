import {
  parseUnicodeOperand,
  unicodeExpressionText,
  unicodeFixtureCodePoints,
  unicodeFixtures,
} from "./data";

describe("S-620 Unicode numeral PoC fixture", () => {
  it("contains seventeen fixed three-digit additions with unique answers", () => {
    expect(unicodeFixtures).toHaveLength(17);
    expect(new Set(unicodeFixtures.map((item) => item.id)).size).toBe(17);
    expect(new Set(unicodeFixtures.map((item) => item.answer)).size).toBe(17);

    for (const item of unicodeFixtures) {
      const minimum = item.radix ** 2;
      const maximum = item.radix ** 3;
      expect(item.leftValue).toBeGreaterThanOrEqual(minimum);
      expect(item.leftValue).toBeLessThan(maximum);
      expect(item.rightValue).toBeGreaterThanOrEqual(minimum);
      expect(item.rightValue).toBeLessThan(maximum);
      expect(item.answer).toBe(item.leftValue + item.rightValue);
    }
  });

  it("round-trips both operands through every formatter and parser", () => {
    for (const item of unicodeFixtures) {
      expect(parseUnicodeOperand(item, item.leftText)).toBe(item.leftValue);
      expect(parseUnicodeOperand(item, item.rightText)).toBe(item.rightValue);
      expect([...item.leftText]).toHaveLength(
        item.system.kind === "han" ? 5 : 3,
      );
      expect([...item.rightText]).toHaveLength(
        item.system.kind === "han" ? 5 : 3,
      );
    }
  });

  it("keeps the special layouts and directions explicit", () => {
    expect(
      unicodeFixtures
        .filter((item) => item.direction === "rtl")
        .map((item) => item.id),
    ).toEqual(["B02", "B03", "B06", "B07", "B08"]);
    expect(
      unicodeFixtures
        .filter((item) => item.layout === "mayan")
        .map((item) => item.id),
    ).toEqual(["B17"]);
    expect(
      unicodeFixtures.find((item) => item.id === "B15")?.leftText,
    ).not.toContain("〇");
  });

  it("uses real Unicode text without replacement or private-use glyphs", () => {
    expect(
      unicodeFixtureCodePoints.some(
        (codePoint) => codePoint >= 0x10d40 && codePoint <= 0x10d49,
      ),
    ).toBe(true);
    expect(unicodeFixtureCodePoints).toContain(0x1e5f1);

    for (const item of unicodeFixtures) {
      const expression = unicodeExpressionText(item);
      expect(expression).not.toContain("�");
      for (const glyph of expression) {
        const codePoint = glyph.codePointAt(0) ?? -1;
        expect(codePoint < 0xe000 || codePoint > 0xf8ff).toBe(true);
        expect(codePoint < 0xf0000 || codePoint > 0xffffd).toBe(true);
        expect(codePoint < 0x100000 || codePoint > 0x10fffd).toBe(true);
      }
    }
  });
});
