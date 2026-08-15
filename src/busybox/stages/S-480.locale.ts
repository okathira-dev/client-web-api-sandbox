import { defineStageLocale } from "./locale";

/** S-480 のステージ固有コピー。表示文言はここから追加する。 */
export const s480Locale = defineStageLocale({
  stageName: { ja: "文字の四季", en: "Four text scales" },
  hint: {
    ja: "このステージのブラウザ挙動を観察する",
    en: "Observe the browser behavior in this stage",
  },
  B01: { ja: "小の箱", en: "Small box" },
  B02: { ja: "標準の箱", en: "Standard box" },
  B03: { ja: "大の箱", en: "Large box" },
  B04: { ja: "特大の箱", en: "Extra-large box" },
});
