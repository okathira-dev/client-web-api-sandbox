import { defineStageLocale } from "./locale";

/** S-020 のステージ固有コピー。表示文言はここから追加する。 */
export const s020Locale = defineStageLocale({
  stageName: { ja: "枠に合わせる", en: "Fit the frame" },
  hint: {
    ja: "このステージのブラウザ挙動を観察する",
    en: "Observe the browser behavior in this stage",
  },
  B01: { ja: "画面幅の箱", en: "Viewport box" },
});
