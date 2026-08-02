/**
 * 検査の中核となる型定義。
 *
 * 映像候補と音声候補は形が大きく異なるため、`kind` を判別子とする Union で表現し、
 * 「映像だけが持つ情報」（Profile / Level / ハードウェア方針）を音声側から参照できないようにする。
 */

export const VIDEO_FAMILIES = ["h264", "h265", "vp9", "av1", "vp8"] as const;
export type VideoFamily = (typeof VIDEO_FAMILIES)[number];

export const AUDIO_FAMILIES = ["aac", "opus"] as const;
export type AudioFamily = (typeof AUDIO_FAMILIES)[number];

export const HARDWARE_PREFERENCES = [
  "prefer-hardware",
  "no-preference",
  "prefer-software",
] as const;
export type HardwarePreference = (typeof HARDWARE_PREFERENCES)[number];

/** mediabunny の `VideoCodec` / `AudioCodec` のうち本検査で使う値。 */
export type VideoContainerCodec = "avc" | "hevc" | "vp9" | "av1" | "vp8";
export type AudioContainerCodec = "aac" | "opus";
export type ContainerFormat = "mp4" | "webm";

/**
 * WebCodecs 自体はビットレートの許容範囲を照会する API を持たない。
 * ここには仕様または実装から確認できた値だけを入れ、検査に使う値とは分けて保持する。
 */
export type KnownBitrateConstraint = {
  readonly kind: "discrete";
  readonly values: readonly number[];
  readonly source: "chromium-windows-mf-aac";
};

/** 1 つの codec string に対する検査条件。ハードウェア方針はまだ含まない。 */
export type VideoCandidate = {
  readonly candidateId: string;
  readonly family: VideoFamily;
  /** `VideoEncoderConfig.codec` へ渡す文字列。例: `avc1.640028` */
  readonly codec: string;
  readonly profile: string;
  readonly level: string;
  readonly bitDepth: number;
  readonly width: number;
  readonly height: number;
  readonly fps: number;
  /** 今回の実エンコードに渡す値。Level の規格上限を表すとは限らない。 */
  readonly bitrate: number;
  readonly knownBitrateConstraint: KnownBitrateConstraint | null;
  readonly container: ContainerFormat;
  readonly containerCodec: VideoContainerCodec;
  readonly label: string;
};

export type AudioCandidate = {
  readonly candidateId: string;
  readonly family: AudioFamily;
  readonly codec: string;
  /** AAC は codec string に profile が入るため、実出力の ASC とも照合する。 */
  readonly profile: string;
  readonly audioObjectType: number | null;
  readonly channels: number;
  readonly sampleRate: number;
  /** 今回の実エンコードに渡す代表値。品質ごとの網羅検査には使わない。 */
  readonly bitrate: number;
  readonly knownBitrateConstraint: KnownBitrateConstraint | null;
  readonly container: ContainerFormat;
  readonly containerCodec: AudioContainerCodec;
  readonly label: string;
};

/** 実際に検査を実行する単位。映像は 1 候補 × ハードウェア方針 3 種へ展開される。 */
export type VideoInspectionUnit = VideoCandidate & {
  readonly kind: "video";
  readonly id: string;
  readonly hardwareAcceleration: HardwarePreference;
};

export type AudioInspectionUnit = AudioCandidate & {
  readonly kind: "audio";
  readonly id: string;
};

export type InspectionUnit = VideoInspectionUnit | AudioInspectionUnit;

/** 候補ごとの処理段階。UI の進行表示と失敗箇所の切り分けに使う。 */
export const INSPECTION_STAGES = [
  "declared",
  "configure",
  "encode",
  "flush",
  "decode",
  "mux",
  "complete",
] as const;
export type InspectionStage = (typeof INSPECTION_STAGES)[number];

export type TestMode = "compatibility" | "sustained";
export type InputMode = "synthetic" | "live";

/**
 * キャプチャした音声トラックの素性。
 *
 * 音声候補をライブ入力で検査するとき、実際に何 ch で取れたかが結果の意味を左右する。
 * 画面共有の音声は、実装によってはモノラルに落ちてくることがあり、
 * その状態で 2ch 候補を通しても「2ch を実際に扱えた」ことにはならない。
 */
export type LiveAudioInfo = {
  readonly channelCount: number | null;
  readonly sampleRate: number | null;
};

/** ライブ入力の素性。画面内容そのものは一切保持しない。 */
export type LiveSourceInfo = {
  readonly width: number | null;
  readonly height: number | null;
  readonly frameRate: number | null;
  readonly displaySurface: string | null;
  /** 音声トラックを共有しなかった場合は null。 */
  readonly audio: LiveAudioInfo | null;
};

export type LiveSourceStats = LiveSourceInfo & {
  /** エンコードへ渡せたフレーム数。 */
  readonly framesReceived: number;
  /** タイムスタンプ間隔から推定した入力欠落数。 */
  readonly missingInputFrames: number;
};

export type PerformanceMetrics = {
  readonly frameCount: number;
  /**
   * エンコードに要した時間。入力待ちと入力の用意（合成パターンの生成・ライブ
   * フレームの拡縮）は差し引いてある。実際の録画では既にできているフレームが
   * 渡ってくるので、検査治具の都合をエンコーダーの実力に混ぜない。
   */
  readonly processingMs: number;
  readonly averageProcessingMs: number;
  /** 1 フレームあたりの許容時間 (1000 / fps)。 */
  readonly frameBudgetMs: number;
  /** averageProcessingMs / frameBudgetMs をパーセントで表したもの。100 超で予算超過。 */
  readonly frameTimePercent: number;
  readonly achievedFps: number;
  readonly requestedFps: number;
  readonly outputBytes: number;
  readonly maxQueueSize: number;
  /** ライブ入力でフレームが届くのを待った時間。合成入力では 0。 */
  readonly inputWaitMs: number;
  /** 入力を用意するのにかかった時間。`processingMs` からは除いてある。 */
  readonly sourcePreparationMs: number;
  readonly decodeMs: number | null;
  readonly muxMs: number | null;
};

export type UnitResultBase = {
  readonly id: string;
  readonly candidateId: string;
  readonly label: string;
  readonly codec: string;
  /** 実エンコードに渡したビットレート。 */
  readonly bitrate: number;
  /** 仕様・公式実装で確認済みの制約。未確認の範囲は記録しない。 */
  readonly knownBitrateConstraint: KnownBitrateConstraint | null;
  readonly testMode: TestMode;
  readonly inputMode: InputMode;
  /** `isConfigSupported` が受理したか。 */
  readonly declared: boolean;
  readonly encodedChunks: number | null;
  readonly decodedFrames: number | null;
  readonly muxedBytes: number | null;
  /** エンコード・デコード・多重化がすべて通ったか。 */
  readonly usable: boolean;
  readonly warning: string | null;
  readonly error: string | null;
  /** 失敗した場合に、どの段階で止まったか。 */
  readonly stage: InspectionStage;
  readonly performance: PerformanceMetrics | null;
  readonly startedAt: number;
  readonly completedAt: number;
  readonly elapsedMs: number;
  /** Sustained test を実行済みならその結果。基本検査とは独立に保持する。 */
  readonly sustained: UnitResult | null;
};

export type VideoUnitResult = UnitResultBase & {
  readonly kind: "video";
  readonly family: VideoFamily;
  readonly profile: string;
  readonly level: string;
  readonly bitDepth: number;
  readonly hardwareAcceleration: HardwarePreference;
  readonly requestedConfig: VideoEncoderConfig;
  readonly source: LiveSourceStats | null;
};

export type AudioUnitResult = UnitResultBase & {
  readonly kind: "audio";
  readonly family: AudioFamily;
  readonly profile: string;
  readonly expectedAudioObjectType: number | null;
  /** 出力 `decoderConfig.description` の ASC から読んだ値。読めなければ null。 */
  readonly outputAudioObjectType: number | null;
  readonly channels: number;
  readonly sampleRate: number;
  readonly requestedConfig: AudioEncoderConfig;
  /** ライブ入力で検査したときの、実際に取れた音声の素性。 */
  readonly source: LiveAudioInfo | null;
};

export type UnitResult = VideoUnitResult | AudioUnitResult;

export type EnvironmentInfo = {
  readonly userAgent: string;
  readonly browserBrands: string | null;
  readonly platform: string | null;
  readonly hardwareConcurrency: number | null;
  readonly deviceMemoryGb: number | null;
  readonly gpu: {
    readonly vendor: string | null;
    readonly architecture: string | null;
    readonly device: string | null;
  } | null;
  readonly webCodecs: {
    readonly videoEncoder: boolean;
    readonly videoDecoder: boolean;
    readonly audioEncoder: boolean;
    readonly audioDecoder: boolean;
    readonly offscreenCanvas: boolean;
  };
};

export type ReportStatus = "running" | "complete" | "cancelled" | "failed";

/** 進行中の候補。結果一覧とは別に保持し、これの更新で結果行を再描画しない。 */
export type CurrentInspection = {
  readonly id: string;
  readonly kind: InspectionUnit["kind"];
  readonly codec: string;
  readonly label: string;
  readonly stage: InspectionStage;
};

export type SustainedRunState = {
  readonly status: ReportStatus;
  readonly startedAt: number;
  readonly updatedAt: number;
  readonly completedAt: number | null;
  readonly durationSeconds: number;
  readonly inputMode: InputMode;
  readonly source: LiveSourceInfo | null;
  readonly candidatePauseMs: number;
  readonly totalUnits: number;
  readonly completedUnits: number;
  readonly unitIds: readonly string[];
  readonly current: CurrentInspection | null;
  readonly error: string | null;
};

export type InspectionReport = {
  readonly version: number;
  readonly status: ReportStatus;
  /** 最初の実行を始めた時刻。再開しても引き継ぐ。 */
  readonly startedAt: number;
  readonly updatedAt: number;
  readonly completedAt: number | null;
  /**
   * 実際に検査していた時間の累計。`updatedAt` の時点までの値。
   * 中断して再開すると `startedAt` からの経過には止まっていた時間が入ってしまうので、
   * 経過表示と残り見込みはこちらを使う。
   */
  readonly activeMs: number;
  readonly environment: EnvironmentInfo;
  readonly totalUnits: number;
  readonly completedUnits: number;
  readonly candidatePauseMs: number;
  /** 新しい結果ほど先頭。完了行は参照を保ったまま再利用する。 */
  readonly results: readonly UnitResult[];
  readonly current: CurrentInspection | null;
  readonly error: string | null;
  /**
   * 直前に完全完了したレポート。中断された再検査が直前の完全結果を壊さないために保持する。
   * 完全完了したレポート自身はこれを持たない（入れ子を 1 段に限る）。
   */
  readonly previousCompleted: InspectionReport | null;
  readonly sustained: SustainedRunState | null;
};
