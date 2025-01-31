import {
  semitoneToFrequency,
  KeyLabelStyle,
  KEY_LABEL_TEXTS,
} from "../shared/audioConfig";

// リードの定義
export const RIGHT_HAND_REEDS = {
  LOW: "L1",
  MID_1: "M1",
  MID_2: "M2",
  MID_3: "M3",
  HIGH: "H1",
} as const;

export type ReedName = keyof typeof RIGHT_HAND_REEDS;

// 右手側のキーマッピング
export const RIGHT_HAND_KEY_MAP: Record<string, number> = {
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

// キーボードのレイアウト
export const RIGHT_HAND_KEYBOARD_LAYOUT = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
  ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
] as const;

// 白鍵の判定用オフセット
const whiteKeyOffsets = [-9, -7, -5, -4, -2, 0, 2].map(
  (offset) => ((offset % 12) + 12) % 12,
);

// ユーティリティ関数
export const isWhiteKey = (key: string): boolean => {
  const semitoneOffset = RIGHT_HAND_KEY_MAP[key];
  if (semitoneOffset === undefined) return false;
  return whiteKeyOffsets.includes(((semitoneOffset % 12) + 12) % 12);
};

export const getFrequency = (key: string): number => {
  const semitoneOffset = RIGHT_HAND_KEY_MAP[key];
  if (semitoneOffset === undefined) {
    throw new Error("semitone offset not found");
  }
  return semitoneToFrequency(semitoneOffset);
};

export const getNoteLabel = (key: string, style: KeyLabelStyle): string => {
  if (style === "key") return key.toUpperCase();

  const semitoneOffset = RIGHT_HAND_KEY_MAP[key];
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
