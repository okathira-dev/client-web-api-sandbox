// 各機能ごとの型定義

// ピッチ関連の型
export type PitchTranslations = {
  base: string;
  relative: string;
  units: {
    cent: string;
    hz: string;
  };
};

// リード関連の型
export type ReedsTranslations = {
  toggle: string;
  bassNote: string;
  chord: string;
};

// レジスター関連の型
export type RegisterTranslations = {
  title: string;
  description: string;
};

// オーディオ関連の型
export type AudioTranslations = {
  device: string;
  errors: {
    permission: string;
    browser: string;
    change: string;
  };
};

// レイテンシー関連の型
export type LatencyTranslations = {
  label: string;
  value: string;
  unavailable: string;
  update: string;
  lookAhead: string;
  base: string;
  output: string;
  total: string;
};

// ディスプレイ関連の型
export type DisplayTranslations = {
  label: string;
  left: string;
  right: string;
};

// アコーディオン全体の型
export type AccordionTranslations = {
  title: string;
  pitch: PitchTranslations;
  volume: string;
  reeds: ReedsTranslations;
  register: RegisterTranslations;
  audio: AudioTranslations;
  latency: LatencyTranslations;
  display: DisplayTranslations;
};

// キーボードタブ関連の型
export type KeyboardTabsTranslations = {
  label: string;
  key: string;
  note: string;
  en: string;
  ja: string;
};

// キーボードレイアウト関連の型
export type KeyboardLayoutTranslations = {
  label: string;
  en: string;
  ja: string;
};

// キーボード全体の型
export type KeyboardTranslations = {
  tabs: KeyboardTabsTranslations;
  layout: KeyboardLayoutTranslations;
};

// 共通エラーメッセージの型
export type CommonErrorsTranslations = {
  microphoneAccess: {
    denied: string;
    required: string;
  };
  browserLimitations: {
    userInteractionRequired: string;
    audioDeviceChangeUnsupported: string;
  };
  devices: {
    enumerationFailed: string;
    noOutputDevices: string;
    unexpectedError: string;
  };
};

// 共通アクション・ボタンの型
export type CommonActionsTranslations = {
  enable: string;
};

// 共通メッセージの型
export type CommonTranslations = {
  errors: CommonErrorsTranslations;
  actions: CommonActionsTranslations;
};

// 翻訳リソース全体の型
export type TranslationResource = {
  accordion: AccordionTranslations;
  keyboard: KeyboardTranslations;
  common: CommonTranslations;
};
