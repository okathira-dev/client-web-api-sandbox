import { defineStageLocale } from "./locale";

/** S-020 のステージ固有コピー。表示文言はここから追加する。 */
export const s020Locale = defineStageLocale({
  stageName: { ja: "枠に合わせる", en: "Fit the frame" },
  B01: { ja: "画面幅の箱", en: "Viewport box" },
});
