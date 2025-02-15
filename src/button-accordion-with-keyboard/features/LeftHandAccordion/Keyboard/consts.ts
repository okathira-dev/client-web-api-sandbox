// キーボードレイアウト（4行12列）
export const KEYBOARD_LAYOUT = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]"], // 12x4なので "\\" は不要
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
  ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
] as const;

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

// キーとベースボタンのマッピング
export const KEY_MAP: Record<string, { row: number; col: number }> = {};
KEYBOARD_LAYOUT.forEach((row, rowIndex) => {
  row.forEach((key, colIndex) => {
    if (key !== null) {
      KEY_MAP[key] = { row: rowIndex, col: colIndex };
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
