/**
 * 検査対象の候補行列。
 *
 * コーデック名ではなく Profile / Level / ビット深度まで含んだ具体的な codec string 単位で並べる。
 * 各行の解像度・FPS・ビットレートは、公式配信ガイドの代表的な初期目標を
 * 対応付けた比較負荷である。Level の規格上限や実録画の推奨設定そのものではない。
 */

import type {
  AudioCandidate,
  ContainerFormat,
  VideoBitrateMode,
  VideoCandidate,
  VideoFamily,
} from "../domain/types";
import { AUDIO_BITRATE_MODES, VIDEO_BITRATE_MODES } from "../domain/types";

/** [レベル識別子, 表示名, 幅, 高さ, FPS, ビットレート] */
type LevelRow = readonly [
  code: string,
  level: string,
  width: number,
  height: number,
  fps: number,
  bitrate: number,
];

/** YouTube の H.264 SDR アップロード目標。範囲は代表値へ丸める。 */
const H264_LEVELS: readonly LevelRow[] = [
  ["1E", "3.0", 640, 480, 30, 2_500_000],
  ["1F", "3.1", 1280, 720, 30, 5_000_000],
  ["20", "3.2", 1280, 720, 60, 7_500_000],
  ["28", "4.0", 1920, 1080, 30, 8_000_000],
  ["29", "4.1", 1920, 1080, 30, 8_000_000],
  ["2A", "4.2", 1920, 1080, 60, 12_000_000],
  ["32", "5.0", 2560, 1440, 60, 24_000_000],
  ["33", "5.1", 3840, 2160, 30, 40_000_000],
  ["34", "5.2", 3840, 2160, 60, 60_000_000],
  ["3C", "6.0", 3840, 2160, 60, 60_000_000],
  ["3D", "6.1", 3840, 2160, 60, 60_000_000],
  ["3E", "6.2", 3840, 2160, 60, 60_000_000],
];

/** [profile_idc + constraint flags, 表示名, ビット深度] */
const H264_PROFILES: readonly (readonly [
  prefix: string,
  profile: string,
  bitDepth?: number,
])[] = [
  ["42E0", "Constrained Baseline"],
  ["4D40", "Main"],
  ["6400", "High"],
  ["6E00", "High 10", 10],
  ["7A00", "High 4:2:2", 10],
  ["F400", "High 4:4:4 Predictive", 10],
];

/** Apple HLS の HEVC 初期目標。FPS の無い行は最も近い公式目標へ寄せる。 */
const HEVC_LEVELS: readonly LevelRow[] = [
  ["93", "3.1", 1280, 720, 30, 2_400_000],
  ["120", "4.0", 1920, 1080, 30, 4_500_000],
  ["123", "4.1", 1920, 1080, 60, 5_800_000],
  ["150", "5.0", 2560, 1440, 60, 8_100_000],
  ["153", "5.1", 3840, 2160, 30, 11_600_000],
  ["156", "5.2", 3840, 2160, 60, 16_800_000],
  ["180", "6.0", 3840, 2160, 60, 16_800_000],
  ["183", "6.1", 3840, 2160, 60, 16_800_000],
  ["186", "6.2", 3840, 2160, 60, 16_800_000],
];

/** [profile ID, compatibility flags, 表示名, ビット深度] */
const HEVC_PROFILES: readonly (readonly [
  profileId: number,
  compatibility: number,
  profile: string,
  bitDepth: number,
])[] = [
  [1, 6, "Main", 8],
  [2, 4, "Main 10", 10],
];

/**
 * `hvc1` と `hev1` はどちらも HEVC だがパラメーターセットの置き場所が違い、
 * 実装によって片方だけ通ることがあるため両方を候補にする。
 */
const HEVC_SAMPLE_ENTRIES = ["hvc1", "hev1"] as const;

/** Google VP9 設定表の VOD 目標。 */
const VP9_LEVELS: readonly LevelRow[] = [
  ["31", "3.1", 1280, 720, 30, 1_024_000],
  ["40", "4.0", 1920, 1080, 30, 1_800_000],
  ["41", "4.1", 1920, 1080, 60, 3_000_000],
  ["50", "5.0", 2560, 1440, 60, 9_000_000],
  ["51", "5.1", 3840, 2160, 30, 12_000_000],
  ["52", "5.2", 3840, 2160, 60, 18_000_000],
  ["60", "6.0", 3840, 2160, 60, 18_000_000],
  ["61", "6.1", 3840, 2160, 60, 18_000_000],
  ["62", "6.2", 3840, 2160, 60, 18_000_000],
];

const VP9_PROFILES: readonly (readonly [code: string, bitDepth: number])[] = [
  ["00", 8],
  ["02", 10],
];

/** AV1 に一律の公式配信表はないため、VP9 の Web 配信目標を比較起点にする。 */
const AV1_LEVELS: readonly LevelRow[] = [
  ["05", "3.1", 1280, 720, 30, 1_024_000],
  ["08", "4.0", 1920, 1080, 30, 1_800_000],
  ["09", "4.1", 1920, 1080, 60, 3_000_000],
  ["12", "5.0", 2560, 1440, 60, 9_000_000],
  ["13", "5.1", 3840, 2160, 30, 12_000_000],
  ["14", "5.2", 3840, 2160, 60, 18_000_000],
  ["16", "6.0", 3840, 2160, 60, 18_000_000],
  ["17", "6.1", 3840, 2160, 60, 18_000_000],
  ["18", "6.2", 3840, 2160, 60, 18_000_000],
];

const AV1_PROFILES: readonly (readonly [
  code: string,
  profile: string,
  bitDepth: number,
])[] = [
  ["0", "Main", 8],
  ["0", "Main", 10],
  ["1", "High", 10],
];

const CONTAINER_BY_FAMILY: Record<VideoFamily, ContainerFormat> = {
  h264: "mp4",
  h265: "mp4",
  vp9: "webm",
  av1: "webm",
  vp8: "webm",
};

const VIDEO_MODE_DEFINITIONS: readonly VideoBitrateMode[] = VIDEO_BITRATE_MODES;

/** 各登録仕様の quantizer 範囲内にある比較用の中間値。推奨品質値ではない。 */
const VIDEO_QUANTIZERS: Record<VideoFamily, number | null> = {
  h264: 28,
  h265: 28,
  vp9: 40,
  // AV1's WebCodecs registration defines a 0–63 quantizer range.
  av1: 32,
  // VP8 は WebCodecs の codec-specific encode option が定義されていない。
  vp8: null,
};

const expandVideoCandidate = (
  base: Omit<
    VideoCandidate,
    "candidateId" | "bitrate" | "probeBitrate" | "bitrateMode" | "quantizer"
  >,
  probeBitrate: number,
): VideoCandidate[] =>
  VIDEO_MODE_DEFINITIONS.map((bitrateMode) => ({
    ...base,
    candidateId: `${base.codec}:${bitrateMode}`,
    bitrateMode,
    bitrate: bitrateMode === "quantizer" ? null : probeBitrate,
    probeBitrate,
    quantizer:
      bitrateMode === "quantizer" ? VIDEO_QUANTIZERS[base.family] : null,
  }));

const buildH264Candidates = (): VideoCandidate[] =>
  H264_PROFILES.flatMap(([prefix, profile, bitDepth]) =>
    H264_LEVELS.flatMap(([levelCode, level, width, height, fps, bitrate]) => {
      const codec = `avc1.${prefix}${levelCode}`;
      return expandVideoCandidate(
        {
          family: "h264",
          codec,
          profile,
          level,
          bitDepth: bitDepth ?? 8,
          width,
          height,
          fps,
          container: CONTAINER_BY_FAMILY.h264,
          containerCodec: "avc",
          label: `${profile} · Level ${level}`,
        },
        bitrate,
      );
    }),
  );

const buildHevcCandidates = (): VideoCandidate[] =>
  HEVC_PROFILES.flatMap(([profileId, compatibility, profile, bitDepth]) =>
    HEVC_SAMPLE_ENTRIES.flatMap((sampleEntry) =>
      HEVC_LEVELS.flatMap(([levelIdc, level, width, height, fps, bitrate]) => {
        const codec = `${sampleEntry}.${profileId}.${compatibility}.L${levelIdc}.B0`;
        return expandVideoCandidate(
          {
            family: "h265",
            codec,
            profile: `${profile} (${sampleEntry})`,
            level,
            bitDepth,
            width,
            height,
            fps,
            container: CONTAINER_BY_FAMILY.h265,
            containerCodec: "hevc",
            label: `${profile} ${sampleEntry} · Level ${level}`,
          },
          bitrate,
        );
      }),
    ),
  );

const buildVp9Candidates = (): VideoCandidate[] =>
  VP9_PROFILES.flatMap(([profileCode, bitDepth]) =>
    VP9_LEVELS.flatMap(([levelCode, level, width, height, fps, bitrate]) => {
      const codec = `vp09.${profileCode}.${levelCode}.${String(bitDepth).padStart(2, "0")}`;
      const profile = `Profile ${Number(profileCode)} · ${bitDepth}-bit`;
      return expandVideoCandidate(
        {
          family: "vp9",
          codec,
          profile,
          level,
          bitDepth,
          width,
          height,
          fps,
          container: CONTAINER_BY_FAMILY.vp9,
          containerCodec: "vp9",
          label: `${profile} · Level ${level}`,
        },
        bitrate,
      );
    }),
  );

const buildAv1Candidates = (): VideoCandidate[] =>
  AV1_PROFILES.flatMap(([profileCode, profile, bitDepth]) =>
    AV1_LEVELS.flatMap(([levelCode, level, width, height, fps, bitrate]) => {
      const codec = `av01.${profileCode}.${levelCode}M.${String(bitDepth).padStart(2, "0")}`;
      const profileLabel = `${profile} · ${bitDepth}-bit`;
      return expandVideoCandidate(
        {
          family: "av1",
          codec,
          profile: profileLabel,
          level,
          bitDepth,
          width,
          height,
          fps,
          container: CONTAINER_BY_FAMILY.av1,
          containerCodec: "av1",
          label: `${profileLabel} · Level ${level}`,
        },
        bitrate,
      );
    }),
  );

/** VP8 は一律の公式表がないため、WebM ガイドの 1080p 例を比較起点にする。 */
const VP8_CANDIDATES: VideoCandidate[] = expandVideoCandidate(
  {
    family: "vp8",
    codec: "vp8",
    profile: "VP8",
    level: "—",
    bitDepth: 8,
    width: 1920,
    height: 1080,
    fps: 30,
    container: CONTAINER_BY_FAMILY.vp8,
    containerCodec: "vp8",
    label: "VP8",
  },
  2_000_000,
);

export const VIDEO_CANDIDATES: readonly VideoCandidate[] = [
  ...buildH264Candidates(),
  ...buildHevcCandidates(),
  ...buildVp9Candidates(),
  ...buildAv1Candidates(),
  ...VP8_CANDIDATES,
];

const AUDIO_CHANNEL_COUNTS = [1, 2] as const;
const AUDIO_SAMPLE_RATE = 48_000;
const AUDIO_PROBE_BITRATE = 128_000;

const expandAudioCandidate = (
  base: Omit<AudioCandidate, "candidateId" | "bitrateMode">,
): AudioCandidate[] =>
  AUDIO_BITRATE_MODES.map((bitrateMode) => ({
    ...base,
    candidateId: `${base.family}:${base.audioObjectType ?? "opus"}:${base.channels}:${bitrateMode}`,
    bitrateMode,
  }));

const AAC_PROFILES = [
  { codec: "mp4a.40.2", profile: "AAC-LC", audioObjectType: 2 },
  { codec: "mp4a.40.5", profile: "HE-AAC v1", audioObjectType: 5 },
  { codec: "mp4a.40.29", profile: "HE-AAC v2", audioObjectType: 29 },
  { codec: "mp4a.40.42", profile: "xHE-AAC", audioObjectType: 42 },
] as const;

export const AUDIO_CANDIDATES: readonly AudioCandidate[] = [
  ...AAC_PROFILES.flatMap(({ codec, profile, audioObjectType }) =>
    AUDIO_CHANNEL_COUNTS.flatMap((channels) =>
      expandAudioCandidate({
        family: "aac",
        codec,
        profile,
        audioObjectType,
        channels,
        sampleRate: AUDIO_SAMPLE_RATE,
        bitrate: AUDIO_PROBE_BITRATE,
        container: "mp4",
        containerCodec: "aac",
        label: `${profile} ${channels === 2 ? "Stereo" : "Mono"}`,
      }),
    ),
  ),
  ...AUDIO_CHANNEL_COUNTS.flatMap((channels) =>
    expandAudioCandidate({
      family: "opus",
      codec: "opus",
      profile: "Opus",
      audioObjectType: null,
      channels,
      sampleRate: AUDIO_SAMPLE_RATE,
      bitrate: AUDIO_PROBE_BITRATE,
      container: "webm",
      containerCodec: "opus",
      label: `Opus ${channels === 2 ? "Stereo" : "Mono"}`,
    }),
  ),
];
