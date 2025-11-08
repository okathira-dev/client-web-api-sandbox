/**
 * 左手側キーボードは共通のレイアウト定義を使用します
 * @see ../../../consts/keyboardLayout.ts
 */

/**
 * col から ROOT_NOTE を計算する関数
 * col: 0 のとき offset = 4 - 12 = -8
 * パターン:
 * - 偶数 col (0,2,4,6,8,10): -8, -6, -4, -2, 0, 2 → col - 8
 * - 奇数 col (1,3,5,7,9,11): -13, -11, -9, -7, -5, -3 → col - 14
 *
 * @param col 列番号 (0-11 またはそれ以上)
 * @returns A4を基準とした半音の差
 */
export const getRootNote = (col: number): number => {
  return col % 2 === 0 ? col - 8 : col - 14;
};

// 音階の名前のマッピング
export const NOTE_LABELS = {
  en: {
    flat: ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"],
    sharp: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
  },
} as const;
