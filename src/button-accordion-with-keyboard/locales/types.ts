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

// キーボードの表示方法の型
export type KeyboardViewTranslations = {
  label: string;
  keytop: string;
  note: string;
  doremi: string;
};

// バックスラッシュの位置関連の型
export type BackslashPositionTranslations = {
  label: string;
  secondRow: string;
  thirdRow: string;
};

// キーボードシステム関連の型
export type KeyboardSystemTranslations = {
  label: string;
  b: string;
  c: string;
};

// キーボードノート関連の型
export type KeyboardDoremiNotesTranslations = {
  c: string;
  cSharp: string;
  d: string;
  dSharp: string;
  e: string;
  f: string;
  fSharp: string;
  g: string;
  gSharp: string;
  a: string;
  aSharp: string;
  b: string;
};

// キーボード全体の型
export type KeyboardTranslations = {
  view: KeyboardViewTranslations;
  backslashPosition: BackslashPositionTranslations;
  system: KeyboardSystemTranslations;
  doremi: KeyboardDoremiNotesTranslations;
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
