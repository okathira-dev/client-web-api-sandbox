/**
 * イージング関数名
 */
export type EasingFuncName = "easeOutCubic" | "easeLinear";

/**
 * イージング関数を持たない場合の名前
 */
export type EasingNoneName = "none";

/**
 * イージング関数
 *
 * @param t 0 から 1 までの値
 * @returns 0 から 1 までの値
 */
export type EasingFunc = (t: number) => number;

/**
 * 指定した絶対座標への移動
 */
type MoveTo = {
  x: number;
  y: number;
};

/**
 * 指定した相対座標分の移動
 */
type MoveBy = {
  x?: number;
  y?: number;
};

/**
 * 移動の型定義
 */
type Move =
  | {
      moveTo?: MoveTo;
      moveBy?: undefined;
    }
  | {
      moveTo?: undefined;
      moveBy?: MoveBy;
    };

/**
 * 絶対座標のピボット点での回転
 */
type RotationByAbsolutePivot = {
  deg: number;
  x: number;
  y: number;
};

/**
 * 相対座標のピボット点での回転
 */
type RotationByRelativePivot = {
  deg: number;
  x?: number;
  y?: number;
};

/**
 * 回転の型定義
 */
type Rotation =
  | {
      rotationAbs?: RotationByAbsolutePivot;
      rotationRel?: undefined;
    }
  | {
      rotationAbs?: undefined;
      rotationRel?: RotationByRelativePivot;
    };

/**
 * アニメーションパラメータ
 */
export type AnimParam =
  | ({
      easing: EasingFuncName;
    } & Move &
      Rotation)
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
