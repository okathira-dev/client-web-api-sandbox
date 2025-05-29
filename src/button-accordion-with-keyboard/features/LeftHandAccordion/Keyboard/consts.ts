import {
  EN_KEYBOARD_LAYOUT,
  ISO_KEYBOARD_LAYOUT,
  JA_KEYBOARD_LAYOUT,
} from "../../../consts/keyboardLayout";

import type { KeyboardLayoutType } from "../../../consts/keyboardLayout";

export type { KeyboardLayoutType };
export { EN_KEYBOARD_LAYOUT, ISO_KEYBOARD_LAYOUT, JA_KEYBOARD_LAYOUT };

// Altoの音程の配列（Db, Ab, Eb, Bb, F, C, G, D, A, E, B, F#）
// A4を基準（0）として半音の差を指定
export const ROOT_NOTES = [
  4 - 12, // Db4
  11 - 24, // Ab3
  6 - 12, // Eb4
  13 - 24, // Bb3
  8 - 12, // F4
  15 - 24, // C4
  10 - 12, // G4
  17 - 24, // D4
  12 - 12, // A4 (0)
  19 - 24, // E4
  14 - 12, // B4
  21 - 24, // F#4
];

// キーとベースボタンのマッピング（英語キーボード）
export const EN_KEY_MAP: Record<string, { row: number; col: number }> = {};
EN_KEYBOARD_LAYOUT.forEach((row, rowIndex) => {
  row.forEach((key, colIndex) => {
    if (key !== null) {
      EN_KEY_MAP[key] = { row: rowIndex, col: colIndex };
    }
  });
});

// キーとベースボタンのマッピング（ISOキーボード）
export const ISO_KEY_MAP: Record<string, { row: number; col: number }> = {};
ISO_KEYBOARD_LAYOUT.forEach((row, rowIndex) => {
  row.forEach((key, colIndex) => {
    if (key !== null) {
      ISO_KEY_MAP[key] = {
        row: rowIndex,
        col: rowIndex === 3 ? colIndex - 1 : colIndex,
      };
    }
  });
});

// キーとベースボタンのマッピング（日本語キーボード）
export const JA_KEY_MAP: Record<string, { row: number; col: number }> = {};
JA_KEYBOARD_LAYOUT.forEach((row, rowIndex) => {
  row.forEach((key, colIndex) => {
    if (key !== null) {
      JA_KEY_MAP[key] = { row: rowIndex, col: colIndex };
    }
  });
});

// 音階の名前のマッピング
export const NOTE_LABELS = {
  en: {
    flat: ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"],
    sharp: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
  },
} as const;
