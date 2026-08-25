import { defineStageLocale } from "../locale";

/** S-400 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "一時間ずれた時計", en: "A clock one hour away" },
  B01: { ja: "巻き戻しの箱", en: "Rewind box" },
  B02: { ja: "現在へ戻す箱", en: "Return-to-now box" },
});
