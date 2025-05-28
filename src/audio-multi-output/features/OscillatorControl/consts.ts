// オシレーター設定の型定義
export type OscillatorSettings = {
  waveform: OscillatorType;
  frequency: number;
  phaseInvert: boolean;
};

// 波形タイプ
export const WAVEFORM_TYPES = {
  sine: "正弦波",
  triangle: "三角波",
  square: "矩形波",
  sawtooth: "のこぎり波",
} as const;

export type OscillatorType = keyof typeof WAVEFORM_TYPES;

// デフォルト値
export const DEFAULT_FREQUENCY = 440;
export const FREQUENCY_RANGE = { min: 20, max: 20000 };
export const DEFAULT_PHASE_INVERT = false;

// デフォルト設定
export const DEFAULT_OSCILLATOR_SETTINGS: OscillatorSettings = {
  waveform: "sine",
  frequency: DEFAULT_FREQUENCY,
  phaseInvert: DEFAULT_PHASE_INVERT,
};
