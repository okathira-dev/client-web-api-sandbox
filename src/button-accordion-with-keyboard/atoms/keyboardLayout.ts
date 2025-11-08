import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";

import type { BackslashPosition } from "../consts/keyboardLayout";

export type { BackslashPosition };

/**
 * 右手側キーボードの Backslash キー位置設定
 * デフォルトは row1（US/ANSI配列）
 */
const rightHandBackslashPositionAtom = atom<BackslashPosition>("row1");

/**
 * 左手側キーボードの Backslash キー位置設定
 * デフォルトは row1（US/ANSI配列）
 */
const leftHandBackslashPositionAtom = atom<BackslashPosition>("row1");

// 右手側のカスタムフック
export const useRightHandBackslashPosition = () => {
  return useAtom(rightHandBackslashPositionAtom);
};

export const useRightHandBackslashPositionValue = () => {
  return useAtomValue(rightHandBackslashPositionAtom);
};

export const useSetRightHandBackslashPosition = () => {
  return useSetAtom(rightHandBackslashPositionAtom);
};

// 左手側のカスタムフック
export const useLeftHandBackslashPosition = () => {
  return useAtom(leftHandBackslashPositionAtom);
};

export const useLeftHandBackslashPositionValue = () => {
  return useAtomValue(leftHandBackslashPositionAtom);
};

export const useSetLeftHandBackslashPosition = () => {
  return useSetAtom(leftHandBackslashPositionAtom);
};
