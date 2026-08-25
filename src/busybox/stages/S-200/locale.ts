import { defineStageLocale } from "../locale";

/** S-200 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "同時に押す", en: "Press together" },
  pressed: { ja: "押下", en: "Pressed" },
  axis: { ja: "軸", en: "axis" },
  gestureHint: {
    ja: "2ボタンを押しながらスティックを倒す。",
    en: "Hold two buttons while moving a stick.",
  },
  B01: { ja: "同時入力の箱", en: "Simultaneous-input box" },
});
