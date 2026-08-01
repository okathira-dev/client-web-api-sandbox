/**
 * 検査ワーカー。
 *
 * 重い処理（映像生成・エンコード・デコード・多重化）をここへ閉じ込め、
 * 検査中も設定ページの操作が止まらないようにする（仕様 5.1）。
 * 1 リクエスト = 1 候補で、途中経過は stage メッセージで返す。
 */

import {
  AUDIO_FLUSH_TIMEOUT_MS,
  AUDIO_FRAMES_PER_CHUNK,
  COMPATIBILITY_AUDIO_FRAME_COUNT,
  COMPATIBILITY_VIDEO_FRAME_COUNT,
  DECODER_FLUSH_TIMEOUT_MS,
  LIVE_FRAME_TIMEOUT_MS,
  MAX_DECODE_QUEUE_SIZE,
  MAX_ENCODE_FLUSH_TIMEOUT_MS,
  MAX_ENCODE_QUEUE_SIZE,
  MIN_ENCODE_FLUSH_TIMEOUT_MS,
  MIN_MUXED_BYTES,
  SUPPORT_CHECK_TIMEOUT_MS,
  SUSTAINED_THROUGHPUT_WARNING_RATIO,
} from "../consts/inspection";
import {
  createCompatibilityAudioSamples,
  createSustainedAudioGenerator,
  getCompatibilityFrameOps,
  getSustainedFrameOps,
  type SyntheticAudioGenerator,
} from "../domain/synthetic";
import type {
  AudioInspectionUnit,
  AudioUnitResult,
  EnvironmentInfo,
  InspectionStage,
  LiveSourceInfo,
  PerformanceMetrics,
  TestMode,
  VideoInspectionUnit,
  VideoUnitResult,
} from "../domain/types";
import {
  createNoiseTileCanvases,
  drawFrameOps,
} from "../utils/syntheticCanvas";
import {
  createAbortError,
  describeError,
  isAbortError,
  throwIfAborted,
  wait,
  withDeadline,
} from "./async";
import {
  type AudioChunkEntry,
  muxAudioChunks,
  muxVideoChunks,
  type VideoChunkEntry,
} from "./muxing";
import type { WorkerRequest, WorkerResponse } from "./protocol";

/**
 * tsconfig の `lib` は DOM 側なので `DedicatedWorkerGlobalScope` が入っていない。
 * `webworker` を足すと DOM と宣言が衝突するため、ここで使う分だけを型として置く。
 */
type WorkerScope = {
  postMessage: (message: WorkerResponse) => void;
  addEventListener: (
    type: "message",
    listener: (event: MessageEvent<WorkerRequest>) => void,
  ) => void;
};

const workerScope = self as unknown as WorkerScope;

const post = (response: WorkerResponse): void => {
  workerScope.postMessage(response);
};

type StageReporter = (stage: InspectionStage) => void;

// ---------------------------------------------------------------------------
// 環境情報
// ---------------------------------------------------------------------------

/** WebGPU の型定義は導入していないので、必要な部分だけを構造的に受ける。 */
type GpuAdapterInfoLike = {
  readonly vendor?: string;
  readonly architecture?: string;
  readonly device?: string;
};
type GpuLike = {
  requestAdapter?: (options?: {
    powerPreference?: string;
  }) => Promise<{ info?: GpuAdapterInfoLike } | null>;
};

const readGpuInfo = async (): Promise<EnvironmentInfo["gpu"]> => {
  try {
    const gpu = (navigator as Navigator & { gpu?: GpuLike }).gpu;
    const adapter = await gpu?.requestAdapter?.({
      powerPreference: "high-performance",
    });
    if (!adapter?.info) return null;
    return {
      vendor: adapter.info.vendor ?? null,
      architecture: adapter.info.architecture ?? null,
      device: adapter.info.device ?? null,
    };
  } catch {
    // アダプター情報が取れなくても検査自体は続行できる。
    return null;
  }
};

const getWorkerEnvironment = async (): Promise<
  Pick<EnvironmentInfo, "gpu" | "webCodecs">
> => ({
  gpu: await readGpuInfo(),
  webCodecs: {
    videoEncoder: typeof VideoEncoder !== "undefined",
    videoDecoder: typeof VideoDecoder !== "undefined",
    audioEncoder: typeof AudioEncoder !== "undefined",
    audioDecoder: typeof AudioDecoder !== "undefined",
    offscreenCanvas: typeof OffscreenCanvas !== "undefined",
  },
});

// ---------------------------------------------------------------------------
// 計測
// ---------------------------------------------------------------------------

const buildPerformance = ({
  frameCount,
  processingMs,
  frameBudgetMs,
  requestedFps,
  outputBytes,
  maxQueueSize,
  inputWaitMs,
  sourcePreparationMs,
}: {
  frameCount: number;
  processingMs: number;
  frameBudgetMs: number;
  requestedFps: number;
  outputBytes: number;
  maxQueueSize: number;
  inputWaitMs: number;
  sourcePreparationMs: number;
}): PerformanceMetrics => {
  const averageProcessingMs = processingMs / Math.max(1, frameCount);
  return {
    frameCount,
    processingMs: Math.round(processingMs),
    averageProcessingMs: Math.round(averageProcessingMs * 100) / 100,
    frameBudgetMs: Math.round(frameBudgetMs * 100) / 100,
    // 100 を超えると、1 フレームの処理に許容時間より長くかかっている。
    frameTimePercent:
      Math.round((averageProcessingMs / frameBudgetMs) * 1000) / 10,
    achievedFps:
      Math.round((frameCount * 1000 * 10) / Math.max(1, processingMs)) / 10,
    requestedFps,
    outputBytes,
    maxQueueSize,
    inputWaitMs: Math.round(inputWaitMs),
    sourcePreparationMs: Math.round(sourcePreparationMs),
    decodeMs: null,
    muxMs: null,
  };
};

// ---------------------------------------------------------------------------
// 映像
// ---------------------------------------------------------------------------

/**
 * ノイズタイルは候補をまたいで同じものを使うので、ワーカーの生存期間で 1 度だけ作る。
 * 候補ごとに作り直すと、484 回ぶんの生成が丸ごと計測に乗ってしまう。
 */
let noiseTiles: OffscreenCanvas[] | null = null;

const getNoiseTiles = (): OffscreenCanvas[] => {
  noiseTiles ??= createNoiseTileCanvases();
  return noiseTiles;
};

const getVideoFrameCount = (
  unit: VideoInspectionUnit,
  testMode: TestMode,
  durationMs: number,
): number =>
  testMode === "sustained"
    ? Math.max(
        COMPATIBILITY_VIDEO_FRAME_COUNT,
        Math.ceil((unit.fps * durationMs) / 1000),
      )
    : COMPATIBILITY_VIDEO_FRAME_COUNT;

/** 高解像度ほど flush に時間がかかるため、画素数に応じて上限を伸ばす。 */
const getEncodeFlushTimeoutMs = (width: number, height: number): number => {
  const pixelFactor = (width * height) / (1920 * 1080);
  return Math.min(
    MAX_ENCODE_FLUSH_TIMEOUT_MS,
    Math.max(MIN_ENCODE_FLUSH_TIMEOUT_MS, 10_000 + pixelFactor * 6_000),
  );
};

const verifyVideoDecode = async (
  entries: readonly VideoChunkEntry[],
  decoderConfig: VideoDecoderConfig,
  signal: AbortSignal,
): Promise<number> => {
  throwIfAborted(signal);
  if (typeof VideoDecoder === "undefined") {
    throw new Error("video-decoder-unavailable");
  }
  const support = await withDeadline(
    VideoDecoder.isConfigSupported(decoderConfig),
    SUPPORT_CHECK_TIMEOUT_MS,
    signal,
    "video-decoder-support",
  );
  if (!support.supported) throw new Error("video-decoder-unsupported");

  let decodedFrames = 0;
  let decoderError: Error | null = null;
  const decoder = new VideoDecoder({
    output: (frame) => {
      decodedFrames += 1;
      frame.close();
    },
    error: (error) => {
      decoderError = error;
    },
  });
  try {
    decoder.configure(support.config ?? decoderConfig);
    for (const entry of entries) {
      throwIfAborted(signal);
      decoder.decode(entry.chunk);
      while (decoder.decodeQueueSize > MAX_DECODE_QUEUE_SIZE) {
        throwIfAborted(signal);
        await wait(5);
      }
    }
    await withDeadline(
      decoder.flush(),
      DECODER_FLUSH_TIMEOUT_MS,
      signal,
      "video-decoder-flush",
    );
    if (decoderError) throw decoderError;
    if (decodedFrames === 0) throw new Error("video-decoder-no-output");
    return decodedFrames;
  } finally {
    try {
      decoder.close();
    } catch {
      // 既に閉じているだけなので無視してよい。
    }
  }
};

type LiveSource = {
  reader: ReadableStreamDefaultReader<VideoFrame>;
  info: LiveSourceInfo;
};

const readLiveFrame = async (
  liveSource: LiveSource,
  signal: AbortSignal,
): Promise<{ frame: VideoFrame; inputWaitMs: number }> => {
  const waitStartedAt = performance.now();
  const entry = await withDeadline(
    liveSource.reader.read(),
    LIVE_FRAME_TIMEOUT_MS,
    signal,
    "live-frame",
  );
  const inputWaitMs = performance.now() - waitStartedAt;
  if (entry.done || !entry.value) throw new Error("live-capture-ended");
  return { frame: entry.value, inputWaitMs };
};

/** ライブ入力を検査条件の解像度に合わせる。一致していれば描き直さずに包み替える。 */
const toEncodableFrame = ({
  sourceFrame,
  canvas,
  context,
  width,
  height,
  timestamp,
  duration,
}: {
  sourceFrame: VideoFrame;
  canvas: OffscreenCanvas;
  context: OffscreenCanvasRenderingContext2D;
  width: number;
  height: number;
  timestamp: number;
  duration: number;
}): VideoFrame => {
  const needsResize =
    sourceFrame.displayWidth !== width || sourceFrame.displayHeight !== height;
  if (!needsResize) {
    try {
      return new VideoFrame(sourceFrame, { timestamp, duration });
    } finally {
      sourceFrame.close();
    }
  }
  try {
    context.drawImage(sourceFrame, 0, 0, width, height);
  } finally {
    sourceFrame.close();
  }
  return new VideoFrame(canvas, { timestamp, duration });
};

const runVideoUnit = async (
  unit: VideoInspectionUnit,
  {
    signal,
    onStage,
    testMode,
    durationMs,
    liveSource,
  }: {
    signal: AbortSignal;
    onStage: StageReporter;
    testMode: TestMode;
    durationMs: number;
    liveSource: LiveSource | null;
  },
): Promise<VideoUnitResult> => {
  const startedAtMs = performance.now();
  const startedAt = Date.now();
  const requestedConfig: VideoEncoderConfig = {
    codec: unit.codec,
    width: unit.width,
    height: unit.height,
    bitrate: unit.bitrate,
    framerate: unit.fps,
    bitrateMode: "variable",
    latencyMode: "quality",
    hardwareAcceleration: unit.hardwareAcceleration,
  };

  let stage: InspectionStage = "declared";
  let declared = false;
  let encodedChunks: number | null = null;
  let decodedFrames: number | null = null;
  let muxedBytes: number | null = null;
  let usable = false;
  let warning: string | null = null;
  let error: string | null = null;
  let metrics: PerformanceMetrics | null = null;
  let sourceStats: VideoUnitResult["source"] = null;

  let encoder: VideoEncoder | null = null;
  let encoderError: Error | null = null;
  let entries: VideoChunkEntry[] = [];

  try {
    throwIfAborted(signal);
    onStage("declared");
    if (
      typeof VideoEncoder === "undefined" ||
      typeof VideoFrame === "undefined" ||
      typeof OffscreenCanvas === "undefined"
    ) {
      throw new Error("webcodecs-video-unavailable");
    }

    const support = await withDeadline(
      VideoEncoder.isConfigSupported(requestedConfig),
      SUPPORT_CHECK_TIMEOUT_MS,
      signal,
      "video-encoder-support",
    );
    declared = support.supported === true;
    if (!declared) throw new Error("isConfigSupported-false");

    stage = "output";
    onStage("output");
    encoder = new VideoEncoder({
      output: (chunk, meta) => {
        entries.push({ chunk, meta });
      },
      error: (encodeError) => {
        encoderError = encodeError;
      },
    });
    encoder.configure(support.config ?? requestedConfig);

    const canvas = new OffscreenCanvas(unit.width, unit.height);
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("offscreen-canvas-2d-unavailable");

    const frameDurationUs = Math.round(1_000_000 / unit.fps);
    const frameCount = getVideoFrameCount(unit, testMode, durationMs);
    const isSustained = testMode === "sustained";

    let inputWaitMs = 0;
    let sourcePreparationMs = 0;
    let maxQueueSize = 0;
    let missingInputFrames = 0;
    let previousInputTimestamp: number | null = null;

    /*
      一括実用検査の合成入力は 1 枚を使い回す。
      全候補を 1 周する検査なので、入力生成は軽いほどよく、
      フレーム予算の比較も入力生成の揺れに左右されないほうがいい。
      動きと情報量が要るのは、エンコーダーの実力を測る実用継続検査のほう。
    */
    if (!liveSource && !isSustained) {
      drawFrameOps(
        context,
        getCompatibilityFrameOps(unit.width, unit.height),
        getNoiseTiles(),
      );
    }

    const encodeStartedAt = performance.now();
    for (let index = 0; index < frameCount; index += 1) {
      throwIfAborted(signal);
      const sourceStartedAt = performance.now();

      let frame: VideoFrame;
      if (liveSource) {
        const input = await readLiveFrame(liveSource, signal);
        inputWaitMs += input.inputWaitMs;
        const expectedIntervalUs =
          1_000_000 / (liveSource.info.frameRate ?? unit.fps);
        if (
          previousInputTimestamp !== null &&
          Number.isFinite(input.frame.timestamp)
        ) {
          missingInputFrames += Math.max(
            0,
            Math.round(
              (input.frame.timestamp - previousInputTimestamp) /
                expectedIntervalUs,
            ) - 1,
          );
        }
        previousInputTimestamp = Number.isFinite(input.frame.timestamp)
          ? input.frame.timestamp
          : null;
        frame = toEncodableFrame({
          sourceFrame: input.frame,
          canvas,
          context,
          width: unit.width,
          height: unit.height,
          timestamp: index * frameDurationUs,
          duration: frameDurationUs,
        });
      } else {
        if (isSustained) {
          drawFrameOps(
            context,
            getSustainedFrameOps(index, unit.width, unit.height),
            getNoiseTiles(),
          );
        }
        frame = new VideoFrame(canvas, {
          timestamp: index * frameDurationUs,
          duration: frameDurationUs,
        });
      }
      sourcePreparationMs += performance.now() - sourceStartedAt;

      try {
        encoder.encode(frame, { keyFrame: index === 0 });
      } finally {
        frame.close();
      }

      maxQueueSize = Math.max(maxQueueSize, encoder.encodeQueueSize);
      // 定期的にイベントループを譲り、cancel メッセージを取りこぼさないようにする。
      if (index % 8 === 7) await wait(0);
      while (encoder.encodeQueueSize > MAX_ENCODE_QUEUE_SIZE) {
        throwIfAborted(signal);
        await wait(5);
      }
    }

    await withDeadline(
      encoder.flush(),
      getEncodeFlushTimeoutMs(unit.width, unit.height),
      signal,
      "video-encode-flush",
    );
    if (encoderError) throw encoderError;
    if (entries.length === 0) throw new Error("encoder-no-output");
    encodedChunks = entries.length;

    /*
      入力の用意にかかった時間は差し引き、エンコーダーが捌けた速さだけを見る。
      合成パターンの生成もライブフレームの拡縮も検査治具の都合であって、
      実際の録画では既にできているフレームが渡ってくる。
    */
    const processingMs = Math.max(
      0,
      performance.now() - encodeStartedAt - inputWaitMs - sourcePreparationMs,
    );
    metrics = buildPerformance({
      frameCount,
      processingMs,
      frameBudgetMs: 1000 / unit.fps,
      requestedFps: unit.fps,
      outputBytes: entries.reduce(
        (total, entry) => total + entry.chunk.byteLength,
        0,
      ),
      maxQueueSize,
      inputWaitMs,
      sourcePreparationMs,
    });

    if (liveSource) {
      sourceStats = {
        ...liveSource.info,
        framesReceived: frameCount,
        missingInputFrames,
      };
    }

    // 少数フレームの単発結果で性能を断定しない。継続検査でだけ警告を出す。
    if (
      isSustained &&
      metrics.achievedFps < unit.fps * SUSTAINED_THROUGHPUT_WARNING_RATIO
    ) {
      warning = "throughput-below-75-percent";
    }

    stage = "decode";
    onStage("decode");
    const decoderConfig: VideoDecoderConfig = entries.find(
      (entry) => entry.meta?.decoderConfig,
    )?.meta?.decoderConfig ?? {
      codec: unit.codec,
      codedWidth: unit.width,
      codedHeight: unit.height,
    };
    const decodeStartedAt = performance.now();
    decodedFrames = await verifyVideoDecode(entries, decoderConfig, signal);
    metrics = {
      ...metrics,
      decodeMs: Math.round(performance.now() - decodeStartedAt),
    };

    stage = "mux";
    onStage("mux");
    const muxStartedAt = performance.now();
    muxedBytes = await muxVideoChunks({
      entries,
      container: unit.container,
      containerCodec: unit.containerCodec,
      frameRate: unit.fps,
    });
    metrics = {
      ...metrics,
      muxMs: Math.round(performance.now() - muxStartedAt),
    };
    if (muxedBytes < MIN_MUXED_BYTES) throw new Error("mux-output-too-small");

    usable = true;
    stage = "complete";
    onStage("complete");
  } catch (thrown) {
    if (isAbortError(thrown)) throw thrown;
    error = describeError(thrown);
  } finally {
    try {
      encoder?.close();
    } catch {
      // configure 前や既に閉じている場合。失敗しても解放済みとして扱ってよい。
    }
    entries = [];
  }

  return {
    kind: "video",
    id: unit.id,
    candidateId: unit.candidateId,
    label: unit.label,
    codec: unit.codec,
    family: unit.family,
    profile: unit.profile,
    level: unit.level,
    bitDepth: unit.bitDepth,
    experimental: unit.experimental,
    hardwareAcceleration: unit.hardwareAcceleration,
    requestedConfig,
    source: sourceStats,
    testMode,
    inputMode: liveSource ? "live" : "synthetic",
    declared,
    encodedChunks,
    decodedFrames,
    muxedBytes,
    usable,
    warning,
    error,
    stage,
    performance: metrics,
    startedAt,
    completedAt: Date.now(),
    elapsedMs: Math.round(performance.now() - startedAtMs),
    sustained: null,
  };
};

// ---------------------------------------------------------------------------
// 音声
// ---------------------------------------------------------------------------

/**
 * `AudioData` は構築時にサンプルを取り込むので、同じ配列を渡し続けてよい。
 * 一括実用検査では 1 チャンクぶんを作って使い回し、生成の負荷を検査へ持ち込まない。
 */
const createAudioData = ({
  samples,
  channels,
  sampleRate,
  frames,
  timestamp,
}: {
  samples: Float32Array<ArrayBuffer>;
  channels: number;
  sampleRate: number;
  frames: number;
  timestamp: number;
}): AudioData =>
  new AudioData({
    format: "f32-planar",
    sampleRate,
    numberOfFrames: frames,
    numberOfChannels: channels,
    timestamp,
    data: samples,
  });

const verifyAudioDecode = async (
  entries: readonly AudioChunkEntry[],
  decoderConfig: AudioDecoderConfig,
  signal: AbortSignal,
): Promise<number> => {
  throwIfAborted(signal);
  if (typeof AudioDecoder === "undefined") {
    throw new Error("audio-decoder-unavailable");
  }
  const support = await withDeadline(
    AudioDecoder.isConfigSupported(decoderConfig),
    SUPPORT_CHECK_TIMEOUT_MS,
    signal,
    "audio-decoder-support",
  );
  if (!support.supported) throw new Error("audio-decoder-unsupported");

  let decodedFrames = 0;
  let decoderError: Error | null = null;
  const decoder = new AudioDecoder({
    output: (data) => {
      decodedFrames += data.numberOfFrames;
      data.close();
    },
    error: (error) => {
      decoderError = error;
    },
  });
  try {
    decoder.configure(support.config ?? decoderConfig);
    for (const entry of entries) {
      throwIfAborted(signal);
      decoder.decode(entry.chunk);
    }
    await withDeadline(
      decoder.flush(),
      AUDIO_FLUSH_TIMEOUT_MS,
      signal,
      "audio-decoder-flush",
    );
    if (decoderError) throw decoderError;
    if (decodedFrames === 0) throw new Error("audio-decoder-no-output");
    return decodedFrames;
  } finally {
    try {
      decoder.close();
    } catch {
      // 既に閉じているだけなので無視してよい。
    }
  }
};

const getAudioChunkCount = (
  unit: AudioInspectionUnit,
  testMode: TestMode,
  durationMs: number,
): number =>
  testMode === "sustained"
    ? Math.max(
        COMPATIBILITY_AUDIO_FRAME_COUNT,
        Math.ceil(
          (unit.sampleRate * durationMs) / (1000 * AUDIO_FRAMES_PER_CHUNK),
        ),
      )
    : COMPATIBILITY_AUDIO_FRAME_COUNT;

const runAudioUnit = async (
  unit: AudioInspectionUnit,
  {
    signal,
    onStage,
    testMode,
    durationMs,
  }: {
    signal: AbortSignal;
    onStage: StageReporter;
    testMode: TestMode;
    durationMs: number;
  },
): Promise<AudioUnitResult> => {
  const startedAtMs = performance.now();
  const startedAt = Date.now();
  const requestedConfig: AudioEncoderConfig = {
    codec: unit.codec,
    sampleRate: unit.sampleRate,
    numberOfChannels: unit.channels,
    bitrate: unit.bitrate,
  };

  let stage: InspectionStage = "declared";
  let declared = false;
  let encodedChunks: number | null = null;
  let decodedFrames: number | null = null;
  let muxedBytes: number | null = null;
  let usable = false;
  let error: string | null = null;
  let metrics: PerformanceMetrics | null = null;

  let encoder: AudioEncoder | null = null;
  let encoderError: Error | null = null;
  let entries: AudioChunkEntry[] = [];

  try {
    throwIfAborted(signal);
    onStage("declared");
    if (
      typeof AudioEncoder === "undefined" ||
      typeof AudioData === "undefined"
    ) {
      throw new Error("webcodecs-audio-unavailable");
    }

    const support = await withDeadline(
      AudioEncoder.isConfigSupported(requestedConfig),
      SUPPORT_CHECK_TIMEOUT_MS,
      signal,
      "audio-encoder-support",
    );
    declared = support.supported === true;
    if (!declared) throw new Error("isConfigSupported-false");

    stage = "output";
    onStage("output");
    encoder = new AudioEncoder({
      output: (chunk, meta) => {
        entries.push({ chunk, meta });
      },
      error: (encodeError) => {
        encoderError = encodeError;
      },
    });
    encoder.configure(support.config ?? requestedConfig);

    const chunkCount = getAudioChunkCount(unit, testMode, durationMs);
    const isSustained = testMode === "sustained";
    /*
      実用継続検査は掃引と微小ノイズでチャンクごとに中身が変わる。位相は生成器が
      持ち回るので、チャンクの境界で波形が飛ばない。
      一括実用検査は同じ 1 チャンクを繰り返す。周波数を 50Hz の倍数に揃えてあるので、
      繰り返しても継ぎ目が出ない。
    */
    const generator: SyntheticAudioGenerator | null = isSustained
      ? createSustainedAudioGenerator({
          channels: unit.channels,
          sampleRate: unit.sampleRate,
        })
      : null;
    const samples = generator
      ? new Float32Array(AUDIO_FRAMES_PER_CHUNK * unit.channels)
      : createCompatibilityAudioSamples({
          channels: unit.channels,
          sampleRate: unit.sampleRate,
          frames: AUDIO_FRAMES_PER_CHUNK,
        });

    let sourcePreparationMs = 0;
    const encodeStartedAt = performance.now();
    for (let index = 0; index < chunkCount; index += 1) {
      throwIfAborted(signal);
      const sourceStartedAt = performance.now();
      generator?.fill(samples, AUDIO_FRAMES_PER_CHUNK);
      const data = createAudioData({
        samples,
        channels: unit.channels,
        sampleRate: unit.sampleRate,
        frames: AUDIO_FRAMES_PER_CHUNK,
        timestamp: Math.round(
          (index * AUDIO_FRAMES_PER_CHUNK * 1_000_000) / unit.sampleRate,
        ),
      });
      sourcePreparationMs += performance.now() - sourceStartedAt;
      try {
        encoder.encode(data);
      } finally {
        data.close();
      }
      if (index % 32 === 31) await wait(0);
    }

    await withDeadline(
      encoder.flush(),
      AUDIO_FLUSH_TIMEOUT_MS,
      signal,
      "audio-encode-flush",
    );
    if (encoderError) throw encoderError;
    if (entries.length === 0) throw new Error("encoder-no-output");
    encodedChunks = entries.length;

    const chunkBudgetMs = (AUDIO_FRAMES_PER_CHUNK * 1000) / unit.sampleRate;
    metrics = buildPerformance({
      frameCount: chunkCount,
      // 映像と同じく、入力の用意にかかった時間はエンコーダーの実力に数えない。
      processingMs: Math.max(
        0,
        performance.now() - encodeStartedAt - sourcePreparationMs,
      ),
      frameBudgetMs: chunkBudgetMs,
      requestedFps: unit.sampleRate / AUDIO_FRAMES_PER_CHUNK,
      outputBytes: entries.reduce(
        (total, entry) => total + entry.chunk.byteLength,
        0,
      ),
      maxQueueSize: 0,
      inputWaitMs: 0,
      sourcePreparationMs,
    });

    stage = "decode";
    onStage("decode");
    const decoderConfig: AudioDecoderConfig = entries.find(
      (entry) => entry.meta?.decoderConfig,
    )?.meta?.decoderConfig ?? {
      codec: unit.codec,
      sampleRate: unit.sampleRate,
      numberOfChannels: unit.channels,
    };
    const decodeStartedAt = performance.now();
    decodedFrames = await verifyAudioDecode(entries, decoderConfig, signal);
    metrics = {
      ...metrics,
      decodeMs: Math.round(performance.now() - decodeStartedAt),
    };

    stage = "mux";
    onStage("mux");
    const muxStartedAt = performance.now();
    muxedBytes = await muxAudioChunks({
      entries,
      container: unit.container,
      containerCodec: unit.containerCodec,
    });
    metrics = {
      ...metrics,
      muxMs: Math.round(performance.now() - muxStartedAt),
    };
    if (muxedBytes < MIN_MUXED_BYTES) throw new Error("mux-output-too-small");

    usable = true;
    stage = "complete";
    onStage("complete");
  } catch (thrown) {
    if (isAbortError(thrown)) throw thrown;
    error = describeError(thrown);
  } finally {
    try {
      encoder?.close();
    } catch {
      // 既に閉じているだけなので無視してよい。
    }
    entries = [];
  }

  return {
    kind: "audio",
    id: unit.id,
    candidateId: unit.candidateId,
    label: unit.label,
    codec: unit.codec,
    family: unit.family,
    channels: unit.channels,
    sampleRate: unit.sampleRate,
    bitrate: unit.bitrate,
    requestedConfig,
    testMode,
    inputMode: "synthetic",
    declared,
    encodedChunks,
    decodedFrames,
    muxedBytes,
    usable,
    warning: null,
    error,
    stage,
    performance: metrics,
    startedAt,
    completedAt: Date.now(),
    elapsedMs: Math.round(performance.now() - startedAtMs),
    sustained: null,
  };
};

// ---------------------------------------------------------------------------
// メッセージループ
// ---------------------------------------------------------------------------

let activeRequest: { requestId: string; controller: AbortController } | null =
  null;
let liveSource: LiveSource | null = null;

const closeLiveSource = async (): Promise<void> => {
  const current = liveSource;
  liveSource = null;
  if (!current) return;
  try {
    await current.reader.cancel();
  } catch {
    // 既に閉じたストリーム。トラック停止は呼び出し元が行う。
  }
  try {
    current.reader.releaseLock();
  } catch {
    // cancel() 済みならロックは解放されている。
  }
};

const handleRunUnit = async (
  request: Extract<WorkerRequest, { type: "run-unit" }>,
): Promise<void> => {
  const controller = new AbortController();
  activeRequest = { requestId: request.requestId, controller };
  const onStage: StageReporter = (stage) => {
    post({ type: "stage", requestId: request.requestId, stage });
  };
  try {
    const result =
      request.unit.kind === "video"
        ? await runVideoUnit(request.unit, {
            signal: controller.signal,
            onStage,
            testMode: request.testMode,
            durationMs: request.durationMs,
            liveSource,
          })
        : await runAudioUnit(request.unit, {
            signal: controller.signal,
            onStage,
            testMode: request.testMode,
            durationMs: request.durationMs,
          });
    post({ type: "unit-result", requestId: request.requestId, result });
  } catch (thrown) {
    post({
      type: "error",
      requestId: request.requestId,
      name: thrown instanceof Error ? thrown.name : "Error",
      message: describeError(thrown),
    });
  } finally {
    if (activeRequest?.requestId === request.requestId) activeRequest = null;
  }
};

workerScope.addEventListener(
  "message",
  (event: MessageEvent<WorkerRequest>) => {
    const request = event.data;

    if (request.type === "cancel") {
      if (activeRequest?.requestId === request.requestId) {
        activeRequest.controller.abort(createAbortError());
      }
      return;
    }

    if (request.type === "setup-live-source") {
      void (async () => {
        try {
          await closeLiveSource();
          liveSource = {
            reader: request.readable.getReader(),
            info: request.source,
          };
          post({ type: "ack", requestId: request.requestId });
        } catch (thrown) {
          post({
            type: "error",
            requestId: request.requestId,
            name: thrown instanceof Error ? thrown.name : "Error",
            message: describeError(thrown),
          });
        }
      })();
      return;
    }

    if (request.type === "close-live-source") {
      void closeLiveSource().then(() => {
        post({ type: "ack", requestId: request.requestId });
      });
      return;
    }

    if (request.type === "environment") {
      void getWorkerEnvironment().then((environment) => {
        post({
          type: "environment-result",
          requestId: request.requestId,
          environment,
        });
      });
      return;
    }

    if (activeRequest) {
      post({
        type: "error",
        requestId: request.requestId,
        name: "Error",
        message: "inspection-worker-busy",
      });
      return;
    }

    void handleRunUnit(request);
  },
);
