import { defineStageLocale } from "../locale";

export const locale = defineStageLocale({
  stageName: { ja: "画面いっぱいの箱", en: "Fullscreen Box" },
  intro: {
    ja: "この額縁だけを画面いっぱいにしてください。箱はその中でだけ触れます。",
    en: "Make only this frame fill the screen. The box can be touched only inside it.",
  },
  fullscreen: {
    ja: "額縁を画面いっぱいにする",
    en: "Fill the screen with this frame",
  },
  waiting: {
    ja: "額縁を画面いっぱいにしてください。",
    en: "Make the frame fullscreen.",
  },
  ready: { ja: "箱に触れられます。", en: "The box is now reachable." },
  B01: { ja: "画面いっぱいの箱", en: "Fullscreen box" },
});
