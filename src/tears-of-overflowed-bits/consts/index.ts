/**
 * tears of overflowed bits のアニメーション定数
 */

export const BEAT_TIME = 350;
export const DEFAULT_FONT_SIZE = 18;

/**
 * イージング関数名の型定義
 */
export type EasingFuncName = "easeOutCubic" | "easeLinear";

/**
 * イージングなし名の型定義
 */
export type EasingNoneName = "none";

/**
 * イージング関数の型定義
 */
export type EasingFunc = (t: number) => number;

/**
 * アニメーションパラメータの型定義
 */
export type AnimParam =
  | {
      x?: number;
      y?: number;
      rot?: number;
      rotX?: number;
      rotY?: number;
      easing: EasingFuncName;
    }
  | {
      easing: EasingNoneName;
    };

/**
 * 文字の型定義
 */
export type Letter = {
  x?: number;
  y?: number;
  rot?: number;
  size?: number;
};

/**
 * エントリーの型定義
 */
export type Entry = {
  step: number;
  x: number;
  y: number;
  rot: number;
  chrs?: Letter[];
};

/**
 * テキストラインの型定義
 */
export type TextLine = {
  chrs: string;
  entry: Entry;
  letterAnimParamsList: AnimParam[][];
  lineAnimParams: AnimParam[];
};
