import { KEYBOARD_LAYOUT } from "./instrumentConfig";

// ベース音のタイプ
export type BassType = "Counter" | "Fundamental" | "Major" | "Minor";

// 音程の配列（Db, Ab, Eb, Bb, F, C, G, D, A, E, B, F#）
// A4を基準（0）として半音の数を指定
const ROOT_NOTES = [
  4, // Db (+4)
  11, // Ab (+11)
  6, // Eb (+6)
  1, // Bb (+1)
  8, // F  (+8)
  3, // C  (+3)
  10, // G  (+10)
  5, // D  (+5)
  0, // A  (+0)
  7, // E  (+7)
  2, // B  (+2)
  9, // F# (+9)
] as const;

// 行番号からベース音のタイプを取得
export const getTypeFromRow = (row: number): BassType => {
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

// セミトーン（半音）の配列を返す関数
const calculateSemitones = (type: BassType, rootSemitone: number): number[] => {
  switch (type) {
    case "Counter":
      return [
        rootSemitone + 4, // メジャーサード
      ];
    case "Fundamental":
      return [
        rootSemitone, //     ルート音
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

// TODO: 実際のアコーディオンでの音程を調べる
// セミトーンを0-11の範囲に正規化する関数
const normalizeSemitone = (semitone: number): number => {
  return ((semitone % 12) + 12) % 12;
};

// ベースで鳴る音程に正規化する
const normalizeBassSemitones = (semitones: number[]): number[] => {
  return semitones.map((semitone) => normalizeSemitone(semitone) - 12);
};

// セミトーン（半音）の配列を返す関数
export const getBassSemitones = (row: number, col: number): number[] => {
  const type = getTypeFromRow(row);
  const rootSemitone = ROOT_NOTES[col];
  if (rootSemitone === undefined) throw new Error("Invalid root semitone");
  const semitones = calculateSemitones(type, rootSemitone);
  return normalizeBassSemitones(semitones);
};
