export const CONCERT_PITCH = 440;
export const SAMPLE_RATE = 44100;

// 共通の型定義
export type PitchUnit = "cent" | "hz";
export type NoteNameStyle = "en" | "ja";
export type KeyLabelStyle = "key" | NoteNameStyle;

// 周波数変換の共通関数
export const semitoneToFrequency = (semitone: number): number => {
  return CONCERT_PITCH * Math.pow(2, semitone / 12);
};

export const hzToCent = (hz: number): number => {
  return 1200 * Math.log2(hz / CONCERT_PITCH);
};

export const centToHz = (cent: number): number => {
  return CONCERT_PITCH * Math.pow(2, cent / 1200);
};

// 音階の名前のマッピング
export const KEY_LABEL_TEXTS: Record<NoteNameStyle, string[]> = {
  en: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
  ja: [
    "ド",
    "ド#",
    "レ",
    "レ#",
    "ミ",
    "ファ",
    "ファ#",
    "ソ",
    "ソ#",
    "ラ",
    "ラ#",
    "シ",
  ],
};
