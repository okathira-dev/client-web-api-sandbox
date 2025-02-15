import {
  EN_KEYBOARD_LAYOUT,
  JA_KEYBOARD_LAYOUT,
} from "../../../consts/keyboardLayout";

import type { KeyboardLayoutType } from "../../../consts/keyboardLayout";

export type { KeyboardLayoutType };
export { EN_KEYBOARD_LAYOUT, JA_KEYBOARD_LAYOUT };

// 右手側キーボードのキーマッピング（英語キーボード）
export const EN_KEY_MAP: Record<string, number> = {
  // 1列目
  "1": -18,
  "2": -15,
  "3": -12,
  "4": -9,
  "5": -6,
  "6": -3,
  "7": 0,
  "8": 3,
  "9": 6,
  "0": 9,
  "-": 12,
  "=": 15,
  // 2列目
  q: -16,
  w: -13,
  e: -10,
  r: -7,
  t: -4,
  y: -1,
  u: 2,
  i: 5,
  o: 8,
  p: 11,
  "[": 14,
  "]": 17,
  "\\": 20,
  // 3列目
  a: -14,
  s: -11,
  d: -8,
  f: -5,
  g: -2,
  h: 1,
  j: 4,
  k: 7,
  l: 10,
  ";": 13,
  "'": 16,
  // 4列目
  z: -12,
  x: -9,
  c: -6,
  v: -3,
  b: 0,
  n: 3,
  m: 6,
  ",": 9,
  ".": 12,
  "/": 15,
};

// 右手側キーボードのキーマッピング（日本語キーボード）
export const JA_KEY_MAP: Record<string, number> = {
  // 1列目
  "1": -18,
  "2": -15,
  "3": -12,
  "4": -9,
  "5": -6,
  "6": -3,
  "7": 0,
  "8": 3,
  "9": 6,
  "0": 9,
  "-": 12,
  "^": 15,
  // 2列目
  q: -16,
  w: -13,
  e: -10,
  r: -7,
  t: -4,
  y: -1,
  u: 2,
  i: 5,
  o: 8,
  p: 11,
  "@": 14,
  "[": 17,
  // 3列目
  a: -14,
  s: -11,
  d: -8,
  f: -5,
  g: -2,
  h: 1,
  j: 4,
  k: 7,
  l: 10,
  ";": 13,
  ":": 16,
  "]": 19,
  // 4列目
  z: -12,
  x: -9,
  c: -6,
  v: -3,
  b: 0,
  n: 3,
  m: 6,
  ",": 9,
  ".": 12,
  "/": 15,
  "\\": 18,
};

// 音階の名前のマッピング
export type NoteNameStyle = "en" | "ja";
export const KEY_LABEL_TEXTS: Record<NoteNameStyle, string[]> = {
  en: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
  ja: [
    "ド",
    "ド#",
    "レ",
    "レ#",
    "ミ",
    "ファ",
    "ファ#",
    "ソ",
    "ソ#",
    "ラ",
    "ラ#",
    "シ",
  ],
};
