import { defineStageLocale } from "../locale";

/** S-600 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "高さの三層", en: "Three altitude layers" },
  B01: { ja: "100m未満の箱", en: "Below 100 m box" },
  B02: { ja: "100〜500mの箱", en: "100–500 m box" },
  B03: { ja: "500m以上の箱", en: "500 m or more box" },
});
