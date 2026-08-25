import { defineStageLocale } from "../locale";

/** S-520 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "すぐそば", en: "Very near" },
  B01: { ja: "近接の箱", en: "Proximity box" },
});
