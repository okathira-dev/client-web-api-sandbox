/**
 * イージング関数名の型定義
 */
export type EasingFuncName = "easeOutCubic" | "easeLinear";

/**
 * イージング関数を持たない場合の型
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
      easing: EasingFuncName;
      x?: number;
      y?: number;
      rot?: number;
      rotX?: number;
      rotY?: number;
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
