const CONCERT_PITCH = 440;

export type PitchUnit = "cent" | "hz";

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
