import { defineStageLocale } from "./locale";

/** S-520 のステージ固有コピー。表示文言はここから追加する。 */
export const s520Locale = defineStageLocale({
  stageName: { ja: "すぐそば", en: "Very near" },
  hint: {
    ja: "このステージのブラウザ挙動を観察する",
    en: "Observe the browser behavior in this stage",
  },
  B01: { ja: "近接の箱", en: "Proximity box" },
});
