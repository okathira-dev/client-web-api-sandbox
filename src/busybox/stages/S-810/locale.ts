import { defineStageLocale } from "../locale";

export const locale = defineStageLocale({
  stageName: { ja: "変形する映像", en: "Shape-shifting video" },
  frameUnsupported: {
    ja: "このブラウザでは表示中フレームの寸法を観測できません。",
    en: "This browser cannot observe presented video frames.",
  },
  captions: { ja: "字幕なし", en: "No captions" },
  unknown: { ja: "不明なエラー", en: "unknown error" },
  generationFailed: { ja: "動画生成に失敗しました", en: "Generation failed" },
  square: { ja: "1:1", en: "1:1" },
  fourThree: { ja: "4:3", en: "4:3" },
  sixteenNine: { ja: "16:9", en: "16:9" },
  nineTwenty: { ja: "9:20", en: "9:20" },
  B01: { ja: "1:1の箱", en: "1:1 box" },
  B02: { ja: "4:3の箱", en: "4:3 box" },
  B03: { ja: "16:9の箱", en: "16:9 box" },
  B04: { ja: "9:20の箱", en: "9:20 box" },
});
