// 音声出力デバイス関連
export const DEFAULT_DEVICE_LABEL = "デフォルト";

// 音声コンテキスト関連
export const SAMPLE_RATE = 44100;
export const BUFFER_SIZE = 2048;

// エラーメッセージ
export const ERROR_MESSAGES = {
  DEVICE_ENUMERATION_FAILED: "デバイスの取得に失敗しました",
  AUDIO_CONTEXT_FAILED: "AudioContextの作成に失敗しました",
  DEVICE_SELECTION_FAILED: "デバイスの選択に失敗しました",
  HTTPS_REQUIRED: "この機能にはHTTPS接続が必要です",
  USER_INTERACTION_REQUIRED: "ユーザーの操作が必要です",
} as const;
