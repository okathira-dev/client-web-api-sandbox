// キーボードシステムタイプ（B-systemとC-system）
export type KeyboardSystemType = "b-system" | "c-system";

/**
 * C-systemの行ごとの基準オフセット
 */
export const C_SYSTEM_ROW_OFFSETS = [-18, -16, -14, -12] as const;

/**
 * B-systemの行ごとの基準オフセット
 */
export const B_SYSTEM_ROW_OFFSETS = [-13, -12, -11, -10] as const;

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
