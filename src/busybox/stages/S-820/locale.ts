import { defineStageLocale } from "../locale";

export const locale = defineStageLocale({
  stageName: { ja: "遠い箱", en: "Distant Boxes" },
  intro: {
    ja: "ポインターを固定して、マウス移動だけで果てのない平面を進みます。中心に箱が来たら押してください。",
    en: "Lock the pointer and cross an endless plane using mouse movement alone. Press the box when it reaches the center.",
  },
  begin: { ja: "ポインターを固定する", en: "Lock pointer" },
  locked: {
    ja: "移動中。Escで解除できます。",
    en: "Moving. Press Esc to unlock.",
  },
  unlocked: {
    ja: "移動を始めるには固定します。",
    en: "Lock the pointer to start moving.",
  },
  position: { ja: "現在地", en: "Current position" },
  target: { ja: "箱まで", en: "To box" },
  nearby: {
    ja: "中心に箱があります。押してください。",
    en: "A box is at the center. Press it.",
  },
  noBox: {
    ja: "中心にはまだ箱がありません。",
    en: "There is no box at the center yet.",
  },
  B01: { ja: "1000px先の箱", en: "1000px box" },
  B02: { ja: "5000px先の箱", en: "5000px box" },
  B03: { ja: "10000px先の箱", en: "10000px box" },
});
