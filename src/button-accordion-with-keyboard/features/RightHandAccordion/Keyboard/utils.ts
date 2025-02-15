import {
  JA_KEYBOARD_LAYOUT,
  EN_KEYBOARD_LAYOUT,
  EN_KEY_MAP,
  JA_KEY_MAP,
  KEY_LABEL_TEXTS,
} from "./consts";
import { semitoneToFrequency } from "../../../audio/utils";

import type { KeyboardLayoutType, NoteNameStyle } from "./consts";

export type KeyLabelStyle = "key" | NoteNameStyle;

// キーボードレイアウトの切り替え
const getKeyMap = (keyboardLayout: KeyboardLayoutType) => {
  return keyboardLayout === "en" ? EN_KEY_MAP : JA_KEY_MAP;
};
export const getKeyboardLayout = (keyboardLayout: KeyboardLayoutType) => {
  return keyboardLayout === "en" ? EN_KEYBOARD_LAYOUT : JA_KEYBOARD_LAYOUT;
};

// 白鍵の判定用オフセット
const whiteKeyOffsets = [-9, -7, -5, -4, -2, 0, 2].map(
  (offset) => ((offset % 12) + 12) % 12,
);

export const isWhiteKey = (
  key: string,
  keyboardLayoutType: KeyboardLayoutType,
): boolean => {
  const keyMap = getKeyMap(keyboardLayoutType);
  const semitoneOffset = keyMap[key];
  if (semitoneOffset === undefined) return false;
  return whiteKeyOffsets.includes(((semitoneOffset % 12) + 12) % 12);
};

export const getFrequency = (
  key: string,
  keyboardLayoutType: KeyboardLayoutType,
): number => {
  const keyMap = getKeyMap(keyboardLayoutType);
  const semitoneOffset = keyMap[key];
  if (semitoneOffset === undefined) {
    throw new Error("semitone offset not found");
  }
  return semitoneToFrequency(semitoneOffset);
};

export const getNoteLabel = (
  key: string,
  style: KeyLabelStyle,
  keyboardLayoutType: KeyboardLayoutType,
): string => {
  const keyMap = getKeyMap(keyboardLayoutType);
  if (style === "key") return key.toUpperCase();

  const semitoneOffset = keyMap[key];
  if (semitoneOffset === undefined) {
    throw new Error("semitone offset not found");
  }

  const adjustedOffset = semitoneOffset + 9;
  const noteIndex = ((adjustedOffset % 12) + 12) % 12;
  const octave = Math.floor(adjustedOffset / 12) + 4;

  switch (style) {
    case "en":
      return `${KEY_LABEL_TEXTS[style][noteIndex]}${octave}`;
    case "ja":
      return `${KEY_LABEL_TEXTS[style][noteIndex]}`;
  }
};
