import { defineStageLocale } from "../locale";

/** S-210 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "外側の数字", en: "The number outside" },
  advanceBadge: { ja: "外側の数字を進める", en: "Advance the outer number" },
  B01: { ja: "外側の数字の箱", en: "Outer-number box" },
});
