/**
 * 検査対象の候補行列。
 *
 * コーデック名ではなく Profile / Level / ビット深度まで含んだ具体的な codec string 単位で並べる。
 * 各行の解像度・FPS・ビットレートは、その Level が本来想定する上限に近い値を選んでいる。
 * これは「その Level を名乗る設定が実際にその負荷を捌けるか」を見るための条件であって、
 * 実録画の推奨設定ではない。
 */

import type {
  AudioCandidate,
  ContainerFormat,
  ExperimentalReason,
  VideoCandidate,
  VideoFamily,
} from "../domain/types";

/** [レベル識別子, 表示名, 幅, 高さ, FPS, ビットレート, 対応が期待しにくいか] */
type LevelRow = readonly [
  code: string,
  level: string,
  width: number,
  height: number,
  fps: number,
  bitrate: number,
  experimental?: boolean,
];

/**
 * 候補 1 件の experimental 理由をまとめる。
 * Level 由来の理由は行の真偽値から起こし、Profile 由来の理由と重複させない。
 */
const collectExperimentalReasons = (
  levelExperimental: boolean | undefined,
  profileReasons: readonly ExperimentalReason[] = [],
): readonly ExperimentalReason[] => [
  ...profileReasons,
  ...(levelExperimental ? (["level-6x"] as const) : []),
];

const H264_LEVELS: readonly LevelRow[] = [
  ["1E", "3.0", 640, 480, 30, 5_000_000],
  ["1F", "3.1", 1280, 720, 30, 10_000_000],
  ["20", "3.2", 1280, 720, 60, 15_000_000],
  ["28", "4.0", 1920, 1080, 30, 20_000_000],
  ["29", "4.1", 1920, 1080, 30, 30_000_000],
  ["2A", "4.2", 1920, 1080, 60, 30_000_000],
  ["32", "5.0", 2560, 1440, 60, 40_000_000],
  ["33", "5.1", 3840, 2160, 30, 50_000_000],
  ["34", "5.2", 3840, 2160, 60, 60_000_000],
  ["3C", "6.0", 3840, 2160, 60, 60_000_000, true],
  ["3D", "6.1", 3840, 2160, 60, 60_000_000, true],
  ["3E", "6.2", 3840, 2160, 60, 60_000_000, true],
];

/** [profile_idc + constraint flags, 表示名, experimental の理由, ビット深度] */
const H264_PROFILES: readonly (readonly [
  prefix: string,
  profile: string,
  reasons: readonly ExperimentalReason[],
  bitDepth?: number,
])[] = [
  ["42E0", "Constrained Baseline", []],
  ["4D40", "Main", []],
  ["6400", "High", []],
  ["6E00", "High 10", ["bit-depth-10"], 10],
  ["7A00", "High 4:2:2", ["chroma-422", "bit-depth-10"], 10],
  ["F400", "High 4:4:4 Predictive", ["chroma-444", "bit-depth-10"], 10],
];

const HEVC_LEVELS: readonly LevelRow[] = [
  ["93", "3.1", 1280, 720, 30, 10_000_000],
  ["120", "4.0", 1920, 1080, 30, 20_000_000],
  ["123", "4.1", 1920, 1080, 60, 30_000_000],
  ["150", "5.0", 2560, 1440, 60, 40_000_000],
  ["153", "5.1", 3840, 2160, 30, 50_000_000],
  ["156", "5.2", 3840, 2160, 60, 60_000_000],
  ["180", "6.0", 3840, 2160, 60, 60_000_000, true],
  ["183", "6.1", 3840, 2160, 60, 60_000_000, true],
  ["186", "6.2", 3840, 2160, 60, 60_000_000, true],
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

const VP9_LEVELS: readonly LevelRow[] = [
  ["31", "3.1", 1280, 720, 30, 10_000_000],
  ["40", "4.0", 1920, 1080, 30, 20_000_000],
  ["41", "4.1", 1920, 1080, 60, 30_000_000],
  ["50", "5.0", 2560, 1440, 60, 40_000_000],
  ["51", "5.1", 3840, 2160, 30, 50_000_000],
  ["52", "5.2", 3840, 2160, 60, 60_000_000],
  ["60", "6.0", 3840, 2160, 60, 60_000_000, true],
  ["61", "6.1", 3840, 2160, 60, 60_000_000, true],
  ["62", "6.2", 3840, 2160, 60, 60_000_000, true],
];

const VP9_PROFILES: readonly (readonly [code: string, bitDepth: number])[] = [
  ["00", 8],
  ["02", 10],
];

const AV1_LEVELS: readonly LevelRow[] = [
  ["05", "3.1", 1280, 720, 30, 10_000_000],
  ["08", "4.0", 1920, 1080, 30, 20_000_000],
  ["09", "4.1", 1920, 1080, 60, 30_000_000],
  ["12", "5.0", 2560, 1440, 60, 40_000_000],
  ["13", "5.1", 3840, 2160, 30, 50_000_000],
  ["14", "5.2", 3840, 2160, 60, 60_000_000],
  ["16", "6.0", 3840, 2160, 60, 60_000_000, true],
  ["17", "6.1", 3840, 2160, 60, 60_000_000, true],
  ["18", "6.2", 3840, 2160, 60, 60_000_000, true],
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

const buildH264Candidates = (): VideoCandidate[] =>
  H264_PROFILES.flatMap(([prefix, profile, profileReasons, bitDepth]) =>
    H264_LEVELS.map(
      ([levelCode, level, width, height, fps, bitrate, levelExperimental]) => {
        const codec = `avc1.${prefix}${levelCode}`;
        const experimentalReasons = collectExperimentalReasons(
          levelExperimental,
          profileReasons,
        );
        return {
          candidateId: codec,
          family: "h264",
          codec,
          profile,
          level,
          bitDepth: bitDepth ?? 8,
          width,
          height,
          fps,
          bitrate,
          container: CONTAINER_BY_FAMILY.h264,
          containerCodec: "avc",
          experimental: experimentalReasons.length > 0,
          experimentalReasons,
          label: `${profile} · Level ${level}`,
        } satisfies VideoCandidate;
      },
    ),
  );

const buildHevcCandidates = (): VideoCandidate[] =>
  HEVC_PROFILES.flatMap(([profileId, compatibility, profile, bitDepth]) =>
    HEVC_SAMPLE_ENTRIES.flatMap((sampleEntry) =>
      HEVC_LEVELS.map(
        ([levelIdc, level, width, height, fps, bitrate, levelExperimental]) => {
          const codec = `${sampleEntry}.${profileId}.${compatibility}.L${levelIdc}.B0`;
          const experimentalReasons = collectExperimentalReasons(
            levelExperimental,
            bitDepth > 8 ? ["bit-depth-10"] : [],
          );
          return {
            candidateId: codec,
            family: "h265",
            codec,
            profile: `${profile} (${sampleEntry})`,
            level,
            bitDepth,
            width,
            height,
            fps,
            bitrate,
            container: CONTAINER_BY_FAMILY.h265,
            containerCodec: "hevc",
            experimental: experimentalReasons.length > 0,
            experimentalReasons,
            label: `${profile} ${sampleEntry} · Level ${level}`,
          } satisfies VideoCandidate;
        },
      ),
    ),
  );

const buildVp9Candidates = (): VideoCandidate[] =>
  VP9_PROFILES.flatMap(([profileCode, bitDepth]) =>
    VP9_LEVELS.map(
      ([levelCode, level, width, height, fps, bitrate, levelExperimental]) => {
        const codec = `vp09.${profileCode}.${levelCode}.${String(bitDepth).padStart(2, "0")}`;
        const profile = `Profile ${Number(profileCode)} · ${bitDepth}-bit`;
        const experimentalReasons = collectExperimentalReasons(
          levelExperimental,
          bitDepth > 8 ? ["bit-depth-10"] : [],
        );
        return {
          candidateId: codec,
          family: "vp9",
          codec,
          profile,
          level,
          bitDepth,
          width,
          height,
          fps,
          bitrate,
          container: CONTAINER_BY_FAMILY.vp9,
          containerCodec: "vp9",
          experimental: experimentalReasons.length > 0,
          experimentalReasons,
          label: `${profile} · Level ${level}`,
        } satisfies VideoCandidate;
      },
    ),
  );

const buildAv1Candidates = (): VideoCandidate[] =>
  AV1_PROFILES.flatMap(([profileCode, profile, bitDepth]) =>
    AV1_LEVELS.map(
      ([levelCode, level, width, height, fps, bitrate, levelExperimental]) => {
        const codec = `av01.${profileCode}.${levelCode}M.${String(bitDepth).padStart(2, "0")}`;
        const profileLabel = `${profile} · ${bitDepth}-bit`;
        const experimentalReasons = collectExperimentalReasons(
          levelExperimental,
          [
            ...(profileCode !== "0" ? (["high-profile"] as const) : []),
            ...(bitDepth > 8 ? (["bit-depth-10"] as const) : []),
          ],
        );
        return {
          candidateId: codec,
          family: "av1",
          codec,
          profile: profileLabel,
          level,
          bitDepth,
          width,
          height,
          fps,
          bitrate,
          container: CONTAINER_BY_FAMILY.av1,
          containerCodec: "av1",
          experimental: experimentalReasons.length > 0,
          experimentalReasons,
          label: `${profileLabel} · Level ${level}`,
        } satisfies VideoCandidate;
      },
    ),
  );

const VP8_CANDIDATE: VideoCandidate = {
  candidateId: "vp8",
  family: "vp8",
  codec: "vp8",
  profile: "VP8",
  level: "—",
  bitDepth: 8,
  width: 1920,
  height: 1080,
  fps: 30,
  bitrate: 20_000_000,
  container: CONTAINER_BY_FAMILY.vp8,
  containerCodec: "vp8",
  experimental: false,
  experimentalReasons: [],
  label: "VP8",
};

export const VIDEO_CANDIDATES: readonly VideoCandidate[] = [
  ...buildH264Candidates(),
  ...buildHevcCandidates(),
  ...buildVp9Candidates(),
  ...buildAv1Candidates(),
  VP8_CANDIDATE,
];

const AAC_BITRATES = [96_000, 128_000, 192_000, 256_000, 320_000] as const;
const OPUS_BITRATES = [
  64_000, 96_000, 128_000, 192_000, 256_000, 320_000,
] as const;
const AUDIO_CHANNEL_COUNTS = [1, 2] as const;
const AUDIO_SAMPLE_RATE = 48_000;

export const AUDIO_CANDIDATES: readonly AudioCandidate[] = [
  ...AAC_BITRATES.flatMap((bitrate) =>
    AUDIO_CHANNEL_COUNTS.map(
      (channels) =>
        ({
          candidateId: `aac:${channels}:${bitrate}`,
          family: "aac",
          codec: "mp4a.40.2",
          channels,
          sampleRate: AUDIO_SAMPLE_RATE,
          bitrate,
          container: "mp4",
          containerCodec: "aac",
          label: `AAC ${channels === 2 ? "Stereo" : "Mono"} ${bitrate / 1000} kbps`,
        }) satisfies AudioCandidate,
    ),
  ),
  ...OPUS_BITRATES.flatMap((bitrate) =>
    AUDIO_CHANNEL_COUNTS.map(
      (channels) =>
        ({
          candidateId: `opus:${channels}:${bitrate}`,
          family: "opus",
          codec: "opus",
          channels,
          sampleRate: AUDIO_SAMPLE_RATE,
          bitrate,
          container: "webm",
          containerCodec: "opus",
          label: `Opus ${channels === 2 ? "Stereo" : "Mono"} ${bitrate / 1000} kbps`,
        }) satisfies AudioCandidate,
    ),
  ),
];
