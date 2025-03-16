import type { EasingFunc, EasingFuncName, EasingNoneName } from "../types";

/**
 * イージング関数: easeOutCubic
 */
export const easeOutCubic: EasingFunc = (t) => 1 - (1 - t) * (1 - t) * (1 - t);

/**
 * イージング関数: easeLinear
 */
export const easeLinear: EasingFunc = (t) => t;

/**
 * イージング関数リスト
 */
export const easingFuncList: Record<EasingFuncName, EasingFunc> &
  Record<EasingNoneName, undefined> = {
  none: undefined,
  easeLinear,
  easeOutCubic,
};
