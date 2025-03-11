import type { TextLine } from "./index";

/**
 * テキストラインデータ
 */
export const textLines: TextLine[] = [
  {
    chrs: "＜私は＞",
    entry: { step: 0, x: 0, y: 0, rot: 0 },
    letterAnimParamsList: [
      [{ easing: "none" }],
      [{ easing: "easeLinear", y: 40 }],
      [{ easing: "easeLinear", y: 10 }],
      [{ easing: "none" }],
    ],
    lineAnimParams: [
      { rot: 10, rotX: -100, easing: "easeOutCubic" },
      { rot: -35, rotX: -100, rotY: 40, easing: "easeOutCubic" },
      { rot: 35, rotX: 100, rotY: 40, easing: "easeOutCubic" },
      { rot: -30, rotX: 30, rotY: 50, easing: "easeOutCubic" },
    ],
  },
  {
    chrs: "集積の",
    entry: { step: 1, x: 80, y: 80, rot: 0 },
    letterAnimParamsList: [
      [{ easing: "easeLinear", y: 40 }],
      [{ easing: "none" }],
      [{ easing: "none" }],
    ],
    lineAnimParams: [
      { rot: 20, rotX: 100, easing: "easeOutCubic" },
      { rot: -25, rotX: -150, rotY: 100, easing: "easeOutCubic" },
      { rot: 25, rotX: 0, rotY: 100, easing: "easeOutCubic" },
    ],
  },
  {
    chrs: "海を",
    entry: { step: 2, x: 60, y: 150, rot: 10 },
    letterAnimParamsList: [
      [{ easing: "easeLinear", y: 20 }],
      [{ easing: "none" }],
    ],
    lineAnimParams: [
      { rot: -15, x: -65, y: -70, easing: "easeOutCubic" },
      { rot: -55, rotX: -20, rotY: 60, easing: "easeOutCubic" },
    ],
  },
  {
    chrs: "遊泳する",
    entry: {
      step: 3,
      x: 180,
      y: 110,
      rot: 10,
      chrs: [{ y: 5, size: 22 }, { y: -5, size: 22 }, {}, {}],
    },
    letterAnimParamsList: [
      [{ easing: "easeLinear", y: -50 }],
      [{ easing: "easeLinear", y: 15, rot: 25 }],
      [{ easing: "none" }],
      [{ easing: "none" }],
    ],
    lineAnimParams: [{ rot: -20, rotX: -80, rotY: 0, easing: "easeOutCubic" }],
  },
];
