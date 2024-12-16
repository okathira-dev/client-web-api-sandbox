import { KEYBOARD_LAYOUT } from "./instrumentConfig";

// ベース音のタイプ
export type StradellaType = "Counter" | "Fundamental" | "Major" | "Minor";

// Altoの音程の配列（Db, Ab, Eb, Bb, F, C, G, D, A, E, B, F#）
// A4を基準（0）として半音の差を指定
const ROOT_NOTES = [
  4 - 12, // Db4
  11 - 12, // Ab4
  6 - 12, // Eb4
  1, // Bb4
  8 - 12, // F4
  3 - 12, // C4
  10 - 12, // G4
  5 - 12, // D4
  0, // A4
  7 - 12, // E4
  2, // B4
  9 - 12, // F#4
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
