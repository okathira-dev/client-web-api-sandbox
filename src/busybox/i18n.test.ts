import { detectLocale, messages } from "./i18n";

describe("Busybox translations", () => {
  it("keeps Japanese and English message keys aligned", () => {
    expect(Object.keys(messages.ja).sort()).toEqual(
      Object.keys(messages.en).sort(),
    );
  });

  it.each([
    ["ja-JP", "ja"],
    ["en-US", "en"],
    ["fr-FR", "en"],
  ] as const)("maps %s to %s", (language, locale) => {
    expect(detectLocale(language)).toBe(locale);
  });
});
