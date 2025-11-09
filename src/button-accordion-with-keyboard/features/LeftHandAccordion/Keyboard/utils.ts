import { NOTE_LABELS, EVEN_COL_OFFSET, ODD_COL_OFFSET } from "./consts";
import { semitoneToFrequency } from "../../../audio/utils";
import {
  PHYSICAL_KEYBOARD_MAP,
  BACKSLASH_POSITIONS,
  getCodeLabel,
} from "../../../consts/keyboardLayout";

import type { BackslashPosition } from "../../../consts/keyboardLayout";
import type { StradellaType, StradellaSoundType } from "../types";

/**
 * col から ROOT_NOTE を計算する関数
 *
 * ストラデラベースシステムの列番号から、A4を基準とした半音オフセットを計算する
 *
 * 計算の考え方: 偶数列と奇数列は独立した系列で、それぞれ2半音ずつ上昇する。
 *
 * Math.floor(col / 2) で各系列内のインデックスを取得し、
 * それを2倍することで「系列内で何番目か × 2半音」を得る
 *
 * @param col 列番号 (0-11 またはそれ以上)
 * @returns A4を基準とした半音の差
 */
const getRootNote = (col: number): number => {
  const index = Math.floor(col / 2); // 各系列内でのインデックス
  const baseOffset = index * 2; // 系列内での増分（2半音ずつ）

  return col % 2 === 0
    ? EVEN_COL_OFFSET + baseOffset
    : ODD_COL_OFFSET + baseOffset;
};

/**
 * コードから row/col を取得
 */
const getPosition = (
  code: string,
  backslashPosition: BackslashPosition,
): { row: number; col: number } | undefined => {
  if (code === "Backslash") {
    return BACKSLASH_POSITIONS[backslashPosition];
  }
  return PHYSICAL_KEYBOARD_MAP[code];
};

// 行番号からベース音のタイプを取得
export const getTypeFromRow = (row: number): StradellaType => {
  switch (row) {
    case 0:
      return "counter";
    case 1:
      return "fundamental";
    case 2:
      return "major";
    case 3:
      return "minor";
    default:
      throw new Error("Invalid row number");
  }
};

// セミトーン（半音）の配列を返す関数
const calculateSemitones = (
  type: StradellaType,
  rootSemitone: number,
): number[] => {
  switch (type) {
    case "counter":
      return [
        rootSemitone + 4, // メジャーサード
      ];
    case "fundamental":
      return [
        rootSemitone, // ルート音
      ];
    case "major":
      return [
        rootSemitone, //     ルート音
        rootSemitone + 4, // メジャーサード
        rootSemitone + 7, // 完全5度
      ];
    case "minor":
      return [
        rootSemitone, //     ルート音
        rootSemitone + 3, // マイナーサード
        rootSemitone + 7, // 完全5度
      ];
  }
};

// セミトーン（半音）の配列を返す関数
const getSemitones = (row: number, col: number): number[] => {
  const type = getTypeFromRow(row);
  const rootSemitone = getRootNote(col);
  const semitones = calculateSemitones(type, rootSemitone);
  return semitones;
};

// A4を基準とした音程から音階名のインデックスを計算する
const getNoteIndex = (semitone: number, offset: number = 9): number => {
  return (((semitone + offset) % 12) + 12) % 12;
};

// codeから周波数の配列を返す
export const getFrequencies = (
  code: string,
  backslashPosition: BackslashPosition,
): number[] | undefined => {
  const position = getPosition(code, backslashPosition);
  if (!position) return undefined;

  const { row, col } = position;
  const semitones = getSemitones(row, col);
  const frequencies = semitones.map(semitoneToFrequency);
  return frequencies;
};

// codeからそれがベース音かコードかを返す
export const getStradellaSoundType = (
  code: string,
  backslashPosition: BackslashPosition,
): StradellaSoundType | undefined => {
  const position = getPosition(code, backslashPosition);
  if (!position) return undefined;

  const { row } = position;
  const type = getTypeFromRow(row);
  return type === "counter" || type === "fundamental" ? "bassNote" : "chord";
};

// 中央のインデックスを定義（F = 5）
const CENTER_INDEX = 5;

// rootNoteからラベルを取得する
const getNoteLabel = (rootNote: number, shouldUseFlat: boolean): string => {
  const noteIndex = getNoteIndex(rootNote);
  const noteLabel = shouldUseFlat
    ? (NOTE_LABELS.en.flat[noteIndex] ?? "?")
    : (NOTE_LABELS.en.sharp[noteIndex] ?? "?");
  return noteLabel;
};

/**
 * キーコードに対応するラベルを取得する
 */
export const getKeyLabel = (
  code: string,
  labelStyle: "keytop" | "note",
  backslashPosition: BackslashPosition,
): string => {
  if (labelStyle === "keytop") {
    return getCodeLabel(code);
  }

  const position = getPosition(code, backslashPosition);
  if (!position) return getCodeLabel(code);

  const { row, col } = position;
  const type = getTypeFromRow(row);
  const rootNote = getRootNote(col);

  // 中央（F）より左側はフラット、右側はシャープを使用
  const shouldUseFlat = col <= CENTER_INDEX;

  switch (type) {
    case "counter":
      return getNoteLabel(rootNote + 4, shouldUseFlat);
    case "fundamental":
      return getNoteLabel(rootNote, shouldUseFlat);
    case "major":
      return `${getNoteLabel(rootNote, shouldUseFlat)}M`;
    case "minor":
      return `${getNoteLabel(rootNote, shouldUseFlat)}m`;
  }
};
