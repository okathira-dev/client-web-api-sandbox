// 音声出力デバイスの型定義
export type AudioOutputDevice = {
  deviceId: string;
  label: string;
};

// デバイス関連定数
export const DEVICE_TYPES = {
  AUDIO_OUTPUT: "audiooutput",
} as const;

export const DEFAULT_DEVICE_ID = "default";
