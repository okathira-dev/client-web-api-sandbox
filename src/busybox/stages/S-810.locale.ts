import type { StageLocaleText } from "./locale";

export const s810Locale = {
  initial: {
    ja: "サイズが変わる動画を生成してください。",
    en: "Generate the changing-size video.",
  },
  generating: {
    ja: "フレームサイズのスウィープを生成中…",
    en: "Generating frame-size sweep…",
  },
  building: {
    ja: "native可変サイズ動画を構築中…",
    en: "Building native variable-size video…",
  },
  ready: {
    ja: "再生・シークしてnative動画サイズの変化を確認してください。",
    en: "Play and seek through the changing native video size.",
  },
  frameUnsupported: {
    ja: "このブラウザでは表示中フレームの寸法を観測できません。",
    en: "This browser cannot observe presented video frames.",
  },
  generate: { ja: "スウィープ動画を生成", en: "Generate sweep video" },
  captions: { ja: "字幕なし", en: "No captions" },
  unknown: { ja: "不明なエラー", en: "unknown error" },
} satisfies Record<string, StageLocaleText>;
