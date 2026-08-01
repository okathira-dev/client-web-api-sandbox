/**
 * 翻訳リソースの型。ja / en の両方をこの型で縛り、片方だけキーが増えることを防ぐ。
 * 値の中の `{{...}}` は i18next の補間。
 */

export type AppTranslations = {
  title: string;
  description: string;
  language: string;
  languageJa: string;
  languageEn: string;
};

export type RunnerTranslations = {
  start: string;
  rerun: string;
  resume: string;
  cancelFull: string;
  cancelHint: string;
  cancelSustained: string;
  reset: string;
  pauseLabel: string;
  pauseInvalid: string;
  pauseHelp: string;
  completed: string;
  cancelled: string;
  failed: string;
  unknownReason: string;
};

/** 検査全体の実行状態。レポートの `status` に対応する。 */
export type RunStatusTranslations = {
  notStarted: string;
  running: string;
  complete: string;
  cancelled: string;
  failed: string;
};

/** 候補 1 件を処理する途中の段階。結果の `stage` に対応する。 */
export type StageTranslations = {
  declared: string;
  output: string;
  decode: string;
  mux: string;
  complete: string;
};

/** 候補を処理していない間に、いま何を待っているかを示す文言。 */
export type IdleTranslations = {
  idle: string;
  waiting: string;
  complete: string;
  cancelled: string;
  failed: string;
};

export type ProgressTranslations = {
  unitCount: string;
  elapsed: string;
  eta: string;
  pass: string;
  warning: string;
  fail: string;
  pause: string;
  familyHeading: string;
  familyUntested: string;
  familyRatio: string;
  familyNote: string;
  environment: string;
  cores: string;
  stage: StageTranslations;
  idle: IdleTranslations;
};

export type SustainedTranslations = {
  heading: string;
  description: string;
  captureFailed: string;
  liveAudioNote: string;
  liveAudioMono: string;
  audioSourceLine: string;
  audioSourceNone: string;
  inputLabel: string;
  inputSynthetic: string;
  inputLive: string;
  durationLabel: string;
  durationInvalid: string;
  durationHelp: string;
  memoryCaution: string;
  run: string;
  selectPassedVideo: string;
  clearSelection: string;
  statusChip: string;
  statusDetail: string;
  sourceLine: string;
};

/** 合成パターンのプレビュー。検査へ渡す入力そのものを見せる。 */
export type PreviewTranslations = {
  heading: string;
  description: string;
  compatibilityHeading: string;
  compatibilityNote: string;
  sustainedHeading: string;
  sustainedNote: string;
  compatibilityVideoLabel: string;
  sustainedVideoLabel: string;
  compatibilityAudioLabel: string;
  sustainedAudioLabel: string;
  playVideo: string;
  pauseVideo: string;
  play: string;
  stop: string;
  volumeNote: string;
  runningNote: string;
  unavailable: string;
};

export type TableTranslations = {
  summary: string;
  selectedSuffix: string;
  empty: string;
  noMatch: string;
  label: string;
  selectAll: string;
  selectOne: string;
  columnFamily: string;
  columnCodec: string;
  columnVariant: string;
  columnStatus: string;
  columnDetails: string;
  columnBudget: string;
  columnSustained: string;
  columnTime: string;
  filterAll: string;
  filterCodecPlaceholder: string;
  filterDetailsPlaceholder: string;
  sortHint: string;
  budgetHint: string;
  budgetOver: string;
  budgetUnder: string;
  experimentalBadge: string;
  experimentalFilterLabel: string;
  experimentalAll: string;
  experimentalExclude: string;
  experimentalOnly: string;
  backendHint: string;
  backendMatched: string;
  backendLikely: string;
  backendUnknown: string;
  backend_hardware: string;
  backend_software: string;
  sustainedDone: string;
  sustainedNone: string;
  sustainedFrames: string;
  timeQuick: string;
  timeSlow: string;
  statusPass: string;
  statusWarning: string;
  statusFail: string;
  declaredButFailed: string;
  sourceLine: string;
};

export type FamilyTranslations = {
  h264: string;
  h265: string;
  vp9: string;
  av1: string;
  vp8: string;
  aac: string;
  opus: string;
};

/** 映像・音声の別。ファミリー名だけでは読み取れないので併記する。 */
export type KindTranslations = {
  video: string;
  audio: string;
};

/** 対応が期待しにくい構成と判断した理由。 */
export type ExperimentalTranslations = {
  "bit-depth-10": string;
  "chroma-422": string;
  "chroma-444": string;
  "high-profile": string;
  "level-6x": string;
};

/**
 * ワーカー・実行制御が返す失敗コードの説明。
 * コードはそのまま表示にも残すため、ここでは補足文だけを持つ。
 * 未知のコードは翻訳せずそのまま出す。
 */
export type CodeTranslations = {
  "isConfigSupported-false": string;
  "encoder-no-output": string;
  "video-decoder-unavailable": string;
  "video-decoder-unsupported": string;
  "video-decoder-no-output": string;
  "audio-decoder-unavailable": string;
  "audio-decoder-unsupported": string;
  "audio-decoder-no-output": string;
  "mux-output-too-small": string;
  "webcodecs-video-unavailable": string;
  "webcodecs-audio-unavailable": string;
  "offscreen-canvas-2d-unavailable": string;
  "throughput-below-75-percent": string;
  "live-capture-ended": string;
  "live-capture-unavailable": string;
  "live-capture-video-track-unavailable": string;
  "live-capture-audio-track-unavailable": string;
  "live-audio-captured-as-mono": string;
  "media-stream-track-processor-unavailable": string;
  "display-capture-unavailable": string;
  "capability-report-not-found": string;
  "no-units-selected": string;
  "inspection-already-running": string;
  "inspection-worker-crashed": string;
  "inspection-worker-busy": string;
  "indexeddb-open-failed": string;
  "indexeddb-request-failed": string;
  "indexeddb-transaction-aborted": string;
};

export type TranslationResource = {
  app: AppTranslations;
  runner: RunnerTranslations;
  runStatus: RunStatusTranslations;
  progress: ProgressTranslations;
  sustained: SustainedTranslations;
  preview: PreviewTranslations;
  table: TableTranslations;
  family: FamilyTranslations;
  kind: KindTranslations;
  experimental: ExperimentalTranslations;
  codes: CodeTranslations;
};
