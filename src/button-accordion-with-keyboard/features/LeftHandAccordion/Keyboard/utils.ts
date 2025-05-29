import {
  NOTE_LABELS,
  ROOT_NOTES,
  EN_KEYBOARD_LAYOUT,
  ISO_KEYBOARD_LAYOUT,
  JA_KEYBOARD_LAYOUT,
  EN_KEY_MAP,
  ISO_KEY_MAP,
  JA_KEY_MAP,
  type KeyboardLayoutType,
} from "./consts";
import { semitoneToFrequency } from "../../../audio/utils";

import type { StradellaType, StradellaSoundType } from "../types";

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
  const rootSemitone = ROOT_NOTES[col];
  if (rootSemitone === undefined) throw new Error("Invalid root semitone");
  const semitones = calculateSemitones(type, rootSemitone);
  return semitones;
};

// A4を基準とした音程から音階名のインデックスを計算する
const getNoteIndex = (semitone: number, offset: number = 9): number => {
  return (((semitone + offset) % 12) + 12) % 12;
};

// キーボードレイアウトの切り替え
export const getKeyMap = (keyboardLayout: KeyboardLayoutType) => {
  switch (keyboardLayout) {
    case "en":
      return EN_KEY_MAP;
    case "iso":
      return ISO_KEY_MAP;
    case "ja":
      return JA_KEY_MAP;
  }
};

export const getKeyboardLayout = (keyboardLayout: KeyboardLayoutType) => {
  switch (keyboardLayout) {
    case "en":
      return EN_KEYBOARD_LAYOUT;
    case "iso":
      return ISO_KEYBOARD_LAYOUT;
    case "ja":
      return JA_KEYBOARD_LAYOUT;
  }
};

// keyから周波数の配列を返す
export const getFrequencies = (
  key: string,
  keyboardLayoutType: KeyboardLayoutType,
): number[] | undefined => {
  const keyMap = getKeyMap(keyboardLayoutType);
  const bassInfo = keyMap[key];
  if (!bassInfo) return undefined;

  const { row, col } = bassInfo;
  const semitones = getSemitones(row, col);
  const frequencies = semitones.map(semitoneToFrequency);
  return frequencies;
};

// keyからそれがベース音かコードかを返す
export const getStradellaSoundType = (
  key: string,
  keyboardLayoutType: KeyboardLayoutType,
): StradellaSoundType | undefined => {
  const keyMap = getKeyMap(keyboardLayoutType);
  const bassInfo = keyMap[key];
  if (!bassInfo) return undefined;

  const { row } = bassInfo;
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

// キーに対応するラベルを取得する
export const getKeyLabel = (
  key: string,
  keyboardLayoutType: KeyboardLayoutType,
): string => {
  const keyMap = getKeyMap(keyboardLayoutType);
  const bassInfo = keyMap[key];
  if (!bassInfo) return key.toUpperCase();

  const { row, col } = bassInfo;
  const type = getTypeFromRow(row);
  const rootNote = ROOT_NOTES[col];
  if (rootNote === undefined) return "---";

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
