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
        { easing: "easeLinear", moveBy: { y: -35 } }, // 1ステップ目
      ],
      [
        // 3文字目
        { easing: "easeLinear", moveBy: { y: -5 } }, // 1ステップ目
      ],
      [
        // 4文字目
        { easing: "none" }, // 1ステップ目
      ],
    ],
    lineAnimParams: [
      // テキストライン全体のステップごとのアニメーション
      { easing: "easeOutCubic", rotationAbs: { deg: -7, x: -100, y: 0 } }, // 1ステップ目
      { easing: "easeOutCubic", rotationAbs: { deg: 35, x: -100, y: -30 } }, // 2ステップ目
      { easing: "easeOutCubic", rotationAbs: { deg: -40, x: 50, y: 50 } }, // 3ステップ目
      { easing: "easeOutCubic", rotationAbs: { deg: 30, x: 50, y: -30 } }, // 4ステップ目
    ],
  },
  {
    chrs: "集積の",
    entry: { step: 1, x: 70, y: -85, rot: 0 },
    letterAnimParamsList: [
      [{ easing: "easeLinear", moveBy: { y: -30 } }],
      [{ easing: "none" }],
      [{ easing: "none" }],
    ],
    lineAnimParams: [
      { easing: "easeOutCubic", rotationAbs: { deg: -20, x: 200, y: -50 } },
      { easing: "easeOutCubic", rotationAbs: { deg: 25, x: -50, y: -50 } },
      { easing: "easeOutCubic", rotationAbs: { deg: -20, x: 20, y: -10 } },
    ],
  },
  {
    chrs: "海を",
    entry: { step: 2, x: 40, y: -125, rot: -10 },
    letterAnimParamsList: [
      [{ easing: "easeLinear", moveBy: { y: -20 } }],
      [{ easing: "none" }],
    ],
    lineAnimParams: [
      { easing: "easeOutCubic", rotationAbs: { deg: 20, x: -100, y: -230 } },
      { easing: "easeOutCubic", rotationAbs: { deg: 55, x: 0, y: -150 } },
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
      [{ easing: "easeLinear", moveBy: { y: 50 } }],
      [
        {
          easing: "easeLinear",
          moveBy: { y: -15 },
          rotationRel: { deg: -20 },
        },
      ],
      [{ easing: "none" }],
      [{ easing: "none" }],
    ],
    lineAnimParams: [
      { easing: "easeOutCubic", rotationAbs: { deg: 20, x: 130, y: -170 } },
    ],
  },
];
