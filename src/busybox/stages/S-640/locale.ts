import { defineStageLocale } from "../locale";

/** S-640 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "読めない文字列", en: "Unreadable strings" },
  mojibake: { ja: "文字化け", en: "Mojibake" },
  decoded: { ja: "復号した文字列", en: "Decoded text" },
  sharedAnswer: { ja: "共通の復号回答", en: "Shared decoded answer" },
  B01: { ja: "文字コードの箱 1", en: "Encoding box 1" },
  B02: { ja: "文字コードの箱 2", en: "Encoding box 2" },
  B03: { ja: "文字コードの箱 3", en: "Encoding box 3" },
  B04: { ja: "文字コードの箱 4", en: "Encoding box 4" },
  B05: { ja: "文字コードの箱 5", en: "Encoding box 5" },
  B06: { ja: "文字コードの箱 6", en: "Encoding box 6" },
  B07: { ja: "文字コードの箱 7", en: "Encoding box 7" },
  B08: { ja: "文字コードの箱 8", en: "Encoding box 8" },
});
