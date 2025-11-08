// キーボードシステムタイプ（B-systemとC-system）
export type KeyboardSystemType = "b-system" | "c-system";

/**
 * row/col から半音オフセットを計算する関数（C-system）
 * @param row 行番号 (0-3)
 * @param col 列番号
 * @returns 半音オフセット
 */
export const getSemitoneOffsetCSystem = (row: number, col: number): number => {
  const rowOffsets = [-18, -16, -14, -12];
  const offset = rowOffsets[row];
  if (offset === undefined) {
    throw new Error(`Invalid row number: ${row}`);
  }
  return offset + col * 3;
};

/**
 * row/col から半音オフセットを計算する関数（B-system）
 * @param row 行番号 (0-3)
 * @param col 列番号
 * @returns 半音オフセット
 */
export const getSemitoneOffsetBSystem = (row: number, col: number): number => {
  const rowOffsets = [-13, -12, -11, -10];
  const offset = rowOffsets[row];
  if (offset === undefined) {
    throw new Error(`Invalid row number: ${row}`);
  }
  return offset + col * 3;
};

// 音階の名前のマッピング
export type NoteNameStyle = "note" | "doremi";
export const KEY_LABEL_TEXTS: Record<NoteNameStyle, string[]> = {
  note: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
  doremi: [
    "c",
    "cSharp",
    "d",
    "dSharp",
    "e",
    "f",
    "fSharp",
    "g",
    "gSharp",
    "a",
    "aSharp",
    "b",
  ],
};
