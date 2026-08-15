import { defineStageLocale } from "./locale";

export const s810Locale = defineStageLocale({
  stageName: { ja: "変形する映像", en: "Shape-shifting video" },
  initial: {
    ja: "固定assetのスウィープ動画を読み込んでください。",
    en: "Load the fixed sweep video asset.",
  },
  generating: {
    ja: "固定assetを読み込み中…",
    en: "Loading fixed sweep asset…",
  },
  ready: {
    ja: "再生・シークしてnative動画サイズの変化を確認してください。",
    en: "Play and seek through the changing native video size.",
  },
  frameUnsupported: {
    ja: "このブラウザでは表示中フレームの寸法を観測できません。",
    en: "This browser cannot observe presented video frames.",
  },
  generate: { ja: "スウィープ動画を読み込む", en: "Load sweep video" },
  captions: { ja: "字幕なし", en: "No captions" },
  unknown: { ja: "不明なエラー", en: "unknown error" },
  generationFailed: { ja: "動画生成に失敗しました", en: "Generation failed" },
  smallSquare: { ja: "小さい正方形", en: "Small square" },
  largeSquare: { ja: "大きい正方形", en: "Large square" },
  wide: { ja: "横長", en: "Wide" },
  tall: { ja: "縦長", en: "Tall" },
  B01: { ja: "寸法変化の箱 1", en: "Dimension-change box 1" },
  B02: { ja: "寸法変化の箱 2", en: "Dimension-change box 2" },
  B03: { ja: "寸法変化の箱 3", en: "Dimension-change box 3" },
  B04: { ja: "寸法変化の箱 4", en: "Dimension-change box 4" },
});
