import type { TextLine } from "../types";

/**
 * テキストラインの表示内容とアニメーションのスクリプト
 */
export const textLineScript: TextLine[] = [
  {
    chrs: "＜私は＞", // 表示するテキスト
    entry: { step: 0, x: 0, y: 0, rot: 0 }, // テキストラインの表示開始ポイント
    letterAnimParamsList: [
      // 各文字のステップごとのアニメーション
      [
        // 1文字目
        { easing: "none" }, // 1ステップ目
      ],
      [
        // 2文字目
        { easing: "easeLinear", y: -35 }, // 1ステップ目
      ],
      [
        // 3文字目
        { easing: "easeLinear", y: -5 }, // 1ステップ目
      ],
      [
        // 4文字目
        { easing: "none" }, // 1ステップ目
      ],
    ],
    lineAnimParams: [
      // テキストライン全体のステップごとのアニメーション
      { rot: -7, rotX: -100, easing: "easeOutCubic" }, // 1ステップ目
      { rot: 35, rotX: -100, rotY: -30, easing: "easeOutCubic" }, // 2ステップ目
      { rot: -40, rotX: 50, rotY: 50, easing: "easeOutCubic" }, // 3ステップ目
      { rot: 30, rotX: 50, rotY: -30, easing: "easeOutCubic" }, // 4ステップ目
    ],
  },
  {
    chrs: "集積の",
    entry: { step: 1, x: 70, y: -85, rot: 0 },
    letterAnimParamsList: [
      [{ easing: "easeLinear", y: -30 }],
      [{ easing: "none" }],
      [{ easing: "none" }],
    ],
    lineAnimParams: [
      { rot: -20, rotX: 200, rotY: -50, easing: "easeOutCubic" },
      { rot: 25, rotX: -50, rotY: -50, easing: "easeOutCubic" },
      { rot: -20, rotX: 20, rotY: -10, easing: "easeOutCubic" },
    ],
  },
  {
    chrs: "海を",
    entry: { step: 2, x: 40, y: -125, rot: -10 },
    letterAnimParamsList: [
      [{ easing: "easeLinear", y: -20 }],
      [{ easing: "none" }],
    ],
    lineAnimParams: [
      { rot: 20, rotX: -100, rotY: -230, easing: "easeOutCubic" },
      { rot: 55, rotX: 0, rotY: -150, easing: "easeOutCubic" },
    ],
  },
  {
    chrs: "遊泳する",
    entry: {
      // テキストラインの表示開始ポイント
      step: 3,
      x: 165,
      y: -130,
      rot: -10,
      chrs: [{ y: -5, size: 16 }, { y: 5, size: 16 }, {}, {}], // テキストライン表示開始時における、各文字の位置・傾き・サイズの調整。
    },
    letterAnimParamsList: [
      [{ easing: "easeLinear", y: 50 }],
      [{ easing: "easeLinear", y: -15, rot: -20 }],
      [{ easing: "none" }],
      [{ easing: "none" }],
    ],
    lineAnimParams: [
      { rot: 20, rotX: 130, rotY: -170, easing: "easeOutCubic" },
    ],
  },
];
