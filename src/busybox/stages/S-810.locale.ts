import { defineStageLocale } from "./locale";

export const s810Locale = defineStageLocale({
  stageName: { ja: "変形する映像", en: "Shape-shifting video" },
  initial: {
    ja: "固定assetのスウィープ動画を読み込み、native timelineをシークしてください。",
    en: "Load the fixed sweep video asset and seek its native timeline.",
  },
  generating: {
    ja: "固定assetを読み込み中…",
    en: "Loading fixed sweep asset…",
  },
  ready: {
    ja: "再生では開きません。シークを止めたframeの比率を1:1、4:3、16:9、9:20へ合わせてください（許容差5%）。",
    en: "Playback does not open boxes. Stop seeking on 1:1, 4:3, 16:9, or 9:20 (5% tolerance).",
  },
  playing: {
    ja: "再生中です。箱を開くにはtimelineをシークして止めてください。",
    en: "Playing. Seek and stop on a target ratio to open a box.",
  },
  ended: {
    ja: "再生終了。timelineをシークして比率を探してください。",
    en: "Playback ended. Seek the timeline to find a target ratio.",
  },
  seekHit: { ja: "シーク停止で一致:", en: "Seek stopped on:" },
  seekMiss: {
    ja: "このframeの比率は対象外です。シークして別の位置を探してください。",
    en: "This frame is outside the targets. Seek to another position.",
  },
  frameUnsupported: {
    ja: "このブラウザでは表示中フレームの寸法を観測できません。",
    en: "This browser cannot observe presented video frames.",
  },
  generate: { ja: "スウィープ動画を読み込む", en: "Load sweep video" },
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
