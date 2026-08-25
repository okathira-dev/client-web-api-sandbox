import { defineStageLocale } from "../locale";

/** S-370 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "電気の境目", en: "Battery boundaries" },
  B01: { ja: "接続の箱", en: "Plugged-in box" },
  B02: { ja: "取り外しの箱", en: "Unplugged box" },
  B03: { ja: "75%以上の箱", en: "75% or more box" },
  B04: { ja: "75%未満の箱", en: "Below 75% box" },
});
