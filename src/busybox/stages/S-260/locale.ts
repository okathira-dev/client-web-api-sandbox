import { defineStageLocale } from "../locale";

/** S-260 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "画面の一滴", en: "A drop from the screen" },
  purpleTarget: { ja: "紫色から色を採る", en: "Pick from the purple color" },
  pickDrop: { ja: "画面から一滴採る", en: "Pick a drop from the screen" },
  B01: { ja: "色を採る箱", en: "Color-picker box" },
});
