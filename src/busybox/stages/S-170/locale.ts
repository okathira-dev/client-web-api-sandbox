import { defineStageLocale } from "../locale";

/** S-170 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "止まった時間", en: "Paused time" },
  pausePlay: { ja: "止める / 動かす", en: "Pause / play" },
  B01: { ja: "時間の箱", en: "Animation-time box" },
});
