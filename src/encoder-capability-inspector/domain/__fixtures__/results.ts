/** テスト用のレポート・結果ビルダー。本体からは参照しない。 */

import { REPORT_VERSION } from "../../consts/inspection";
import type {
  AudioUnitResult,
  EnvironmentInfo,
  InspectionReport,
  PerformanceMetrics,
  UnitResult,
  VideoUnitResult,
} from "../types";

export const environmentFixture: EnvironmentInfo = {
  userAgent: "test-agent",
  browserBrands: null,
  platform: "test-platform",
  hardwareConcurrency: 8,
  deviceMemoryGb: null,
  gpu: null,
  webCodecs: {
    videoEncoder: true,
    videoDecoder: true,
    audioEncoder: true,
    audioDecoder: true,
    offscreenCanvas: true,
  },
};

export const performanceFixture = (
  overrides: Partial<PerformanceMetrics> = {},
): PerformanceMetrics => ({
  frameCount: 2,
  processingMs: 20,
  averageProcessingMs: 10,
  frameBudgetMs: 33.33,
  frameTimePercent: 30,
  achievedFps: 100,
  requestedFps: 30,
  outputBytes: 4096,
  maxQueueSize: 1,
  inputWaitMs: 0,
  sourcePreparationMs: 1,
  decodeMs: 5,
  muxMs: 2,
  ...overrides,
});

export const videoResultFixture = (
  overrides: Partial<VideoUnitResult> = {},
): VideoUnitResult => ({
  kind: "video",
  id: "video:avc1.640028:prefer-hardware",
  candidateId: "avc1.640028",
  label: "High · Level 4.0",
  codec: "avc1.640028",
  family: "h264",
  profile: "High",
  level: "4.0",
  bitDepth: 8,
  experimental: false,
  hardwareAcceleration: "prefer-hardware",
  requestedConfig: {
    codec: "avc1.640028",
    width: 1920,
    height: 1080,
    bitrate: 20_000_000,
    framerate: 30,
  },
  source: null,
  testMode: "compatibility",
  inputMode: "synthetic",
  declared: true,
  encodedChunks: 2,
  decodedFrames: 2,
  muxedBytes: 4096,
  usable: true,
  warning: null,
  error: null,
  stage: "complete",
  performance: performanceFixture(),
  startedAt: 1000,
  completedAt: 1200,
  elapsedMs: 200,
  sustained: null,
  ...overrides,
});

export const audioResultFixture = (
  overrides: Partial<AudioUnitResult> = {},
): AudioUnitResult => ({
  kind: "audio",
  id: "audio:opus:2:128000",
  candidateId: "opus:2:128000",
  label: "Opus Stereo 128 kbps",
  codec: "opus",
  family: "opus",
  channels: 2,
  sampleRate: 48_000,
  bitrate: 128_000,
  requestedConfig: {
    codec: "opus",
    sampleRate: 48_000,
    numberOfChannels: 2,
    bitrate: 128_000,
  },
  source: null,
  testMode: "compatibility",
  inputMode: "synthetic",
  declared: true,
  encodedChunks: 2,
  decodedFrames: 1920,
  muxedBytes: 2048,
  usable: true,
  warning: null,
  error: null,
  stage: "complete",
  performance: performanceFixture(),
  startedAt: 1000,
  completedAt: 1050,
  elapsedMs: 50,
  sustained: null,
  ...overrides,
});

export const reportFixture = (
  overrides: Partial<InspectionReport> = {},
): InspectionReport => {
  const results: readonly UnitResult[] = overrides.results ?? [
    videoResultFixture(),
  ];
  return {
    version: REPORT_VERSION,
    status: "complete",
    startedAt: 1000,
    updatedAt: 2000,
    completedAt: 2000,
    activeMs: 1000,
    environment: environmentFixture,
    totalUnits: results.length,
    completedUnits: results.length,
    candidatePauseMs: 0,
    current: null,
    error: null,
    previousCompleted: null,
    sustained: null,
    ...overrides,
    results,
  };
};
