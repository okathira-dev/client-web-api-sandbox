import { defineStageLocale } from "../locale";

export const locale = defineStageLocale({
  stageName: { ja: "負荷の三景", en: "Pressure seasons" },
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
  cpuPrefix: { ja: "CPU状態", en: "CPU state" },
  B01: { ja: "nominalの箱", en: "Nominal box" },
  B02: { ja: "中間状態の箱", en: "Middle-state box" },
  B03: { ja: "criticalの箱", en: "Critical box" },
});
