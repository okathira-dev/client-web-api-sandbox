import { defineStageLocale } from "./locale";

/** S-100 のステージ固有コピー。表示文言はここから追加する。 */
export const s100Locale = defineStageLocale({
  stageName: { ja: "傾けて止める", en: "Tilt and hold" },
  hint: {
    ja: "このステージのブラウザ挙動を観察する",
    en: "Observe the browser behavior in this stage",
  },
  senseOrientation: { ja: "姿勢を感じる", en: "Sense orientation" },
  B01: { ja: "端末姿勢の箱", en: "Orientation box" },
});
