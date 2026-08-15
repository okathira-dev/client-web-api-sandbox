import { defineStageLocale } from "./locale";

/** S-210 のステージ固有コピー。表示文言はここから追加する。 */
export const s210Locale = defineStageLocale({
  stageName: { ja: "外側の数字", en: "The number outside" },
  hint: {
    ja: "このステージのブラウザ挙動を観察する",
    en: "Observe the browser behavior in this stage",
  },
  advanceBadge: { ja: "外側の数字を進める", en: "Advance the outer number" },
  B01: { ja: "外側の数字の箱", en: "Outer-number box" },
});
