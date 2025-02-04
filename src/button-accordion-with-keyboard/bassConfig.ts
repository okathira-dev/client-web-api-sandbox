import { KEYBOARD_LAYOUT } from "./instrumentConfig";

// ベース音のタイプ
export type StradellaType = "Counter" | "Fundamental" | "Major" | "Minor";

// Altoの音程の配列（Db, Ab, Eb, Bb, F, C, G, D, A, E, B, F#）
// A4を基準（0）として半音の差を指定
const ROOT_NOTES = [
  4 - 12, // Db4
  11 - 12, // Ab4
  6 - 12, // Eb4
  13 - 12, // Bb4
  8 - 12, // F4
  15 - 12, // C5
  10 - 12, // G4
  17 - 12, // D5
  12 - 12, // A4
  19 - 12, // E5
  14 - 12, // B4
  21 - 12, // F#5
];

// 行番号からベース音のタイプを取得
export const getTypeFromRow = (row: number): StradellaType => {
  switch (row) {
    case 0:
      return "Counter";
    case 1:
      return "Fundamental";
    case 2:
      return "Major";
    case 3:
      return "Minor";
    default:
      throw new Error("Invalid row number");
  }
};

// キーとベースボタンのマッピング
export const BASS_KEY_MAP: Record<string, { row: number; col: number }> = {};
KEYBOARD_LAYOUT.forEach((row, rowIndex) => {
  row.forEach((key, colIndex) => {
    if (key !== null) {
      BASS_KEY_MAP[key] = { row: rowIndex, col: colIndex };
    }
  });
});

// TODO: リードセットの実装
// const chordReeds = ["soprano", "alto"] as const; // TODO: "contralto" もあるらしいが音程がよくわからないので調べる
// const bassReeds = ["tenor", "bass"] as const;
// type ChordReed = (typeof chordReeds)[number];
// type BassReed = (typeof bassReeds)[number];

// type ChordReedSet = {
//   [key in ChordReed]: boolean;
// };
// type BassReedSet = {
//   [key in BassReed]: boolean;
// };

// セミトーン（半音）の配列を返す関数
const calculateSemitones = (
  type: StradellaType,
  rootSemitone: number,
): number[] => {
  switch (type) {
    case "Counter":
      return [
        rootSemitone + 4, // メジャーサード
      ];
    case "Fundamental":
      return [
        rootSemitone, // ルート音
      ];
    case "Major":
      return [
        rootSemitone, //     ルート音
        rootSemitone + 4, // メジャーサード
        rootSemitone + 7, // 完全5度
      ];
    case "Minor":
      return [
        rootSemitone, //     ルート音
        rootSemitone + 3, // マイナーサード
        rootSemitone + 7, // 完全5度
      ];
  }
};

// セミトーン（半音）の配列を返す関数
export const getBassSemitones = (row: number, col: number): number[] => {
  const type = getTypeFromRow(row);
  const rootSemitone = ROOT_NOTES[col];
  if (rootSemitone === undefined) throw new Error("Invalid root semitone");
  const semitones = calculateSemitones(type, rootSemitone);
  return semitones;
};

// A4を基準とした音程から音階名のインデックスを計算する
const getNoteIndex = (semitone: number, offset: number = 9): number => {
  return (((semitone + offset) % 12) + 12) % 12;
};

// 音階の名前のマッピング
export const NOTE_LABELS = {
  en: {
    flat: ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"],
    sharp: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
  },
} as const;

// 中央のインデックスを定義（F = 5）
const CENTER_INDEX = 5;

// キーに対応する音階とコードの種類を取得する
export const getKeyLabel = (key: string): string => {
  const bassInfo = BASS_KEY_MAP[key];
  if (!bassInfo) return key.toUpperCase();

  const { row, col } = bassInfo;
  const type = getTypeFromRow(row);
  const rootNote = ROOT_NOTES[col];
  if (rootNote === undefined) return key.toUpperCase();

  // 中央（F）より左側はフラット、右側はシャープを使用
  const useFlat = col <= CENTER_INDEX;
  const noteIndex = getNoteIndex(rootNote);
  const noteLabel = useFlat
    ? (NOTE_LABELS.en.flat[noteIndex] ?? "?")
    : (NOTE_LABELS.en.sharp[noteIndex] ?? "?");

  // メジャーサードのインデックスを事前に計算
  const thirdNoteIndex = getNoteIndex(rootNote + 4);
  const thirdNoteLabel = useFlat
    ? (NOTE_LABELS.en.flat[thirdNoteIndex] ?? "?")
    : (NOTE_LABELS.en.sharp[thirdNoteIndex] ?? "?");

  switch (type) {
    case "Counter":
      return thirdNoteLabel;
    case "Fundamental":
      return noteLabel;
    case "Major":
      return `${noteLabel}M`;
    case "Minor":
      return `${noteLabel}m`;
  }
};
