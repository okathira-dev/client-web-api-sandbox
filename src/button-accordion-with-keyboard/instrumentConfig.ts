// A4の周波数[Hz]
const CONCERT_PITCH = 440;

// ボタンアコーディオンの音階のマッピング
// 右上のキーは半音１つ分高く、右隣のキーは半音３つ分高い。そのため同じ音が鳴るキーが存在する。
// 'Z'のキーがA3となるように、A4を0としたときの半音の差分を記述している。
export const KEY_MAP: Record<string, number> = {
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

// 基準音から半音何個分離れているかを受け取り周波数を計算する
const semitoneToFrequency = (semitone: number) => {
  return CONCERT_PITCH * Math.pow(2, semitone / 12);
};

// 音階と周波数のマッピング
// 0は440, 12は880
// KEY_MAPのvalueに対応する周波数を計算して格納する
const FREQUENCY_MAP: Record<number, number> = Object.fromEntries(
  Object.entries(KEY_MAP).map(([_keyName, semitone]) => [
    semitone,
    semitoneToFrequency(semitone),
  ]),
);

// キーに対応する周波数を取得する
export const getFrequency = (key: string) => {
  const semitoneOffset = KEY_MAP[key];
  if (semitoneOffset === undefined) {
    throw new Error("semitone offset not found");
  }
  const frequency = FREQUENCY_MAP[semitoneOffset];
  if (frequency === undefined) {
    throw new Error("frequency not found");
  }
  return frequency;
};

// キーボードのレイアウト
export const KEYBOARD_LAYOUT = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
  ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
] as const;

// 白鍵のマッピングは以下のような対応になっている
//  C,  D,  E,  F,  G, A, B
// -9, -7, -5, -4, -2, 0, 2
const whiteKeyOffsets = [-9, -7, -5, -4, -2, 0, 2].map(
  (offset) => ((offset % 12) + 12) % 12, // あまりを正の数に変換
);
// 白鍵かどうかを判定する
export const ifWhiteKey = (key: string) => {
  const semitoneOffset = KEY_MAP[key];
  if (semitoneOffset === undefined) return false;
  return whiteKeyOffsets.includes(((semitoneOffset % 12) + 12) % 12);
};
// 音階の名前のマッピング
type NoteNameStyle = "en" | "ja";
export type KeyLabelStyle = "key" | NoteNameStyle;
const KEY_Label_TEXTS: Record<NoteNameStyle, string[]> = {
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
export const getNoteLabel = (key: string, style: KeyLabelStyle): string => {
  if (style === "key") return key.toUpperCase();

  const semitoneOffset = KEY_MAP[key];
  if (semitoneOffset === undefined)
    throw new Error("semitone offset not found");

  const adjustedOffset = semitoneOffset - 3;
  const noteIndex = ((adjustedOffset % 12) + 12) % 12;
  const octave = Math.floor(adjustedOffset / 12) + 4; // A4を基準にオクターブを計算

  switch (style) {
    case "en":
      return `${KEY_Label_TEXTS[style][noteIndex]}${octave}`;
    case "ja":
      return `${KEY_Label_TEXTS[style][noteIndex]}`;
  }
};

// ピッチ指定の単位を定義
export type PitchUnit = "cent" | "hz";

// Hz から cent への変換関数
export const hzToCent = (hz: number): number => {
  return 1200 * Math.log2(hz / CONCERT_PITCH);
};

// cent から Hz への変換関数
export const centToHz = (cent: number): number => {
  return CONCERT_PITCH * Math.pow(2, cent / 1200);
};
