import type { StageLocaleText } from "./locale";

export const s660Locale = {
  unavailable: {
    ja: "この環境ではCPU Pressureを購読できない",
    en: "CPU Pressure is unavailable in this environment",
  },
  observing: { ja: "CPU状態を自動観測中…", en: "Observing CPU pressure…" },
  observeFailed: {
    ja: "CPU状態を購読できない",
    en: "Could not observe CPU pressure",
  },
  idle: {
    ja: "ステージを開くと自動観測。ゲーム側で負荷は発生させない",
    en: "Observation starts on entry; the game creates no load",
  },
} satisfies Record<string, StageLocaleText>;
