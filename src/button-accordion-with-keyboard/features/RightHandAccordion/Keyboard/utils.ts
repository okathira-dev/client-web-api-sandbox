import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import {
  getSemitoneOffsetCSystem,
  getSemitoneOffsetBSystem,
  KEY_LABEL_TEXTS,
} from "./consts";
import { semitoneToFrequency } from "../../../audio/utils";
import {
  PHYSICAL_KEYBOARD_MAP,
  BACKSLASH_POSITIONS,
  getCodeLabel,
} from "../../../consts/keyboardLayout";

import type { NoteNameStyle, KeyboardSystemType } from "./consts";
import type { BackslashPosition } from "../../../consts/keyboardLayout";

export type KeyLabelStyle = "keytop" | NoteNameStyle;

/**
 * コードから row/col を取得
 */
const getPosition = (
  code: string,
  backslashPosition: BackslashPosition,
): { row: number; col: number } | undefined => {
  if (code === "Backslash") {
    return BACKSLASH_POSITIONS[backslashPosition];
  }
  return PHYSICAL_KEYBOARD_MAP[code];
};

/**
 * row/col から半音オフセットを取得
 */
const getSemitoneOffset = (
  row: number,
  col: number,
  systemType: KeyboardSystemType,
): number => {
  return systemType === "c-system"
    ? getSemitoneOffsetCSystem(row, col)
    : getSemitoneOffsetBSystem(row, col);
};

// 白鍵の判定用オフセット
const whiteKeyOffsets = [-9, -7, -5, -4, -2, 0, 2].map(
  (offset) => ((offset % 12) + 12) % 12,
);

export const isWhiteKey = (
  code: string,
  backslashPosition: BackslashPosition,
  systemType: KeyboardSystemType,
): boolean => {
  const position = getPosition(code, backslashPosition);
  if (!position) return false;

  const semitoneOffset = getSemitoneOffset(
    position.row,
    position.col,
    systemType,
  );
  return whiteKeyOffsets.includes(((semitoneOffset % 12) + 12) % 12);
};

export const getFrequency = (
  code: string,
  backslashPosition: BackslashPosition,
  systemType: KeyboardSystemType,
): number => {
  const position = getPosition(code, backslashPosition);
  if (!position) {
    throw new Error("position not found");
  }

  const semitoneOffset = getSemitoneOffset(
    position.row,
    position.col,
    systemType,
  );
  return semitoneToFrequency(semitoneOffset);
};

/**
 * 翻訳のhooksが入るので、ここだけ「ノートラベルを返す関数」を返すhookにしておく
 */
export const useGetNoteLabel = () => {
  const { t } = useTranslation();

  const getNoteLabel = useCallback(
    (
      code: string,
      style: KeyLabelStyle,
      backslashPosition: BackslashPosition,
      systemType: KeyboardSystemType,
    ) => {
      if (style === "keytop") return getCodeLabel(code);

      const position = getPosition(code, backslashPosition);
      if (!position) {
        throw new Error("position not found");
      }

      const semitoneOffset = getSemitoneOffset(
        position.row,
        position.col,
        systemType,
      );

      const adjustedOffset = semitoneOffset + 9;
      const noteIndex = ((adjustedOffset % 12) + 12) % 12;
      const octave = Math.floor(adjustedOffset / 12) + 4;

      switch (style) {
        case "note":
          return `${KEY_LABEL_TEXTS[style][noteIndex]}${octave}`;
        case "doremi":
          return t(`keyboard.doremi.${KEY_LABEL_TEXTS[style][noteIndex]}`);
      }
    },
    [t],
  );

  return getNoteLabel;
};
