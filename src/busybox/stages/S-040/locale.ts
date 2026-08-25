import { defineStageLocale } from "../locale";

/** S-040 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "見ない時間", en: "Time unseen" },
  B01: { ja: "見ない時間の箱", en: "Hidden-time box" },
  B02: { ja: "長い不在の箱", en: "Long-absence box" },
});
