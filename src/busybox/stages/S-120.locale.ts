import { defineStageLocale } from "./locale";

/** S-120 のステージ固有コピー。表示文言はここから追加する。 */
export const s120Locale = defineStageLocale({
  stageName: { ja: "音のかたち", en: "The shape of sound" },
  hint: {
    ja: "このステージのブラウザ挙動を観察する",
    en: "Observe the browser behavior in this stage",
  },
  seeSound: { ja: "音の形を見る", en: "See the sound" },
  B01: { ja: "音の箱", en: "Sound box" },
});
