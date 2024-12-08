// A4の周波数[Hz]
export const CONCERT_PITCH = 440;

// ボタンアコーディオンの音階のマッピング
// 右上のキーは半音１つ分高く、右隣のキーは半音３つ分高い。そのため同じ音が鳴るキーが存在する。
// 'C'のキーがC4となるように、A4を基準にした半音の差分を記述している。
export const KEY_MAP: Record<string, number> = {
  // 1列目
  "1": -21,
  "2": -18,
  "3": -15,
  "4": -12,
  "5": -9,
  "6": -6,
  "7": -3,
  "8": 0,
  "9": 3,
  "0": 6,
  "-": 9,
  "=": 12,
  // 2列目
  q: -19,
  w: -16,
  e: -13,
  r: -10,
  t: -7,
  y: -4,
  u: -1,
  i: 2,
  o: 5,
  p: 8,
  "[": 11,
  "]": 14,
  "\\": 17,
  // 3列目
  a: -17,
  s: -14,
  d: -11,
  f: -8,
  g: -5,
  h: -2,
  j: 1,
  k: 4,
  l: 7,
  ";": 10,
  "'": 13,
  // 4列目
  z: -15,
  x: -12,
  c: -9,
  v: -6,
  b: -3,
  n: 0,
  m: 3,
  ",": 6,
  ".": 9,
  "/": 12,
};

// 基準音から半音何個分離れているかを受け取り周波数を計算する
export const semitoneToFrequency = (semitone: number) => {
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
