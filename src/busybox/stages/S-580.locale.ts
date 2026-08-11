import type { StageLocaleText } from "./locale";

export const s580Locale = {
  notRecognized: { ja: "認識できない", en: "Not recognized" },
  speechComplete: { ja: "発話完了", en: "Speech complete" },
  speechError: { ja: "発話エラー", en: "Speech error" },
  speaking: {
    ja: "一文字ずつ発話中…",
    en: "Speaking one character at a time…",
  },
  listen: { ja: "聞き取る", en: "Listen" },
  shifted: { ja: "ずれた声を聞く", en: "Hear the shifted voice" },
} satisfies Record<string, StageLocaleText>;
