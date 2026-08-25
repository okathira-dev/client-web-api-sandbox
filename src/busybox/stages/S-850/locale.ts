import { defineStageLocale } from "../locale";

export const locale = defineStageLocale({
  stageName: { ja: "浮かぶ箱", en: "Floating Box" },
  intro: {
    ja: "箱を小さな常時手前の別画面へ移します。その画面の箱だけを押してください。",
    en: "Move the box to a small always-on-top document. Press only the box in that document.",
  },
  open: { ja: "浮かぶ画面を開く", en: "Open floating document" },
  mainPlaceholder: {
    ja: "箱は浮かぶ画面にあります。",
    en: "The box is in the floating document.",
  },
  opened: {
    ja: "浮かぶ画面で箱を押してください。",
    en: "Press the box in the floating document.",
  },
  unavailable: {
    ja: "浮かぶ画面を開けませんでした。",
    en: "Could not open the floating document.",
  },
  floatingTitle: { ja: "浮かぶ箱", en: "Floating box" },
  B01: { ja: "浮かぶ箱", en: "Floating box" },
});
