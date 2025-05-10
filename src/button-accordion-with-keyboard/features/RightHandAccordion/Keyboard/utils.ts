import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import {
  JA_KEYBOARD_LAYOUT,
  EN_KEYBOARD_LAYOUT,
  EN_KEY_MAP_C_SYSTEM,
  EN_KEY_MAP_B_SYSTEM,
  JA_KEY_MAP_C_SYSTEM,
  JA_KEY_MAP_B_SYSTEM,
  KEY_LABEL_TEXTS,
} from "./consts";
import { semitoneToFrequency } from "../../../audio/utils";

import type {
  KeyboardLayoutType,
  NoteNameStyle,
  KeyboardSystemType,
} from "./consts";

export type KeyLabelStyle = "keytop" | NoteNameStyle;

// キーボードレイアウトの切り替え
const getKeyMap = (
  keyboardLayout: KeyboardLayoutType,
  systemType: KeyboardSystemType,
) => {
  if (systemType === "c-system") {
    return keyboardLayout === "en" ? EN_KEY_MAP_C_SYSTEM : JA_KEY_MAP_C_SYSTEM;
  } else {
    return keyboardLayout === "en" ? EN_KEY_MAP_B_SYSTEM : JA_KEY_MAP_B_SYSTEM;
  }
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
  systemType: KeyboardSystemType,
): boolean => {
  const keyMap = getKeyMap(keyboardLayoutType, systemType);
  const semitoneOffset = keyMap[key];
  if (semitoneOffset === undefined) return false;
  return whiteKeyOffsets.includes(((semitoneOffset % 12) + 12) % 12);
};

export const getFrequency = (
  key: string,
  keyboardLayoutType: KeyboardLayoutType,
  systemType: KeyboardSystemType,
): number => {
  const keyMap = getKeyMap(keyboardLayoutType, systemType);
  const semitoneOffset = keyMap[key];
  if (semitoneOffset === undefined) {
    throw new Error("semitone offset not found");
  }
  return semitoneToFrequency(semitoneOffset);
};

// 翻訳のhooksが入るので、ここだけ「ノートラベルを返す関数」を返すhookにしておく
export const useGetNoteLabel = () => {
  const { t } = useTranslation();

  const getNoteLabel = useCallback(
    (
      key: string,
      style: KeyLabelStyle,
      keyboardLayoutType: KeyboardLayoutType,
      systemType: KeyboardSystemType,
    ) => {
      const keyMap = getKeyMap(keyboardLayoutType, systemType);
      if (style === "keytop") return key.toUpperCase();

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
        case "doremi":
          return t(`keyboard.doremi.${KEY_LABEL_TEXTS[style][noteIndex]}`);
      }
    },
    [t],
  );

  return getNoteLabel;
};
