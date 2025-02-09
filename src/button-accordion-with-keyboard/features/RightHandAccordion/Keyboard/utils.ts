import { semitoneToFrequency } from "../../../audio/utils";
import { KEY_LABEL_TEXTS, KEY_MAP, NoteNameStyle } from "./consts";

// 白鍵の判定用オフセット
const whiteKeyOffsets = [-9, -7, -5, -4, -2, 0, 2].map(
  (offset) => ((offset % 12) + 12) % 12,
);

export const isWhiteKey = (key: string): boolean => {
  const semitoneOffset = KEY_MAP[key];
  if (semitoneOffset === undefined) return false;
  return whiteKeyOffsets.includes(((semitoneOffset % 12) + 12) % 12);
};

export const getFrequency = (key: string): number => {
  const semitoneOffset = KEY_MAP[key];
  if (semitoneOffset === undefined) {
    throw new Error("semitone offset not found");
  }
  return semitoneToFrequency(semitoneOffset);
};

export type KeyLabelStyle = "key" | NoteNameStyle;
export const getNoteLabel = (key: string, style: KeyLabelStyle): string => {
  if (style === "key") return key.toUpperCase();

  const semitoneOffset = KEY_MAP[key];
  if (semitoneOffset === undefined) {
    throw new Error("semitone offset not found");
  }

  const adjustedOffset = semitoneOffset + 9;
  const noteIndex = ((adjustedOffset % 12) + 12) % 12;
  const octave = Math.floor(adjustedOffset / 12) + 4;

  switch (style) {
    case "en":
      return `${KEY_LABEL_TEXTS[style][noteIndex]}${octave}`;
    case "ja":
      return `${KEY_LABEL_TEXTS[style][noteIndex]}`;
  }
};
