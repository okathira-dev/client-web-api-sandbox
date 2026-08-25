import { defineStageLocale } from "../locale";

/** S-120 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "音のかたち", en: "The shape of sound" },
  seeSound: { ja: "音の形を見る", en: "See the sound" },
  B01: { ja: "音の箱", en: "Sound box" },
});
