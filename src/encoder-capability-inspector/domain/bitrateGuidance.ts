import type {
  AudioCandidate,
  AudioFamily,
  UnitResult,
  VideoCandidate,
  VideoFamily,
} from "./types";

/**
 * WebCodecs does not expose a cross-codec bitrate-range query.  The catalog is
 * therefore deliberately explicit about whether a value comes from a codec
 * standard, a browser implementation, or a publishing guide.
 */
export type BitrateAuthority =
  | "standard"
  | "implementation"
  | "recommendation"
  | "comparison";

export type BitrateFactKind =
  | "range"
  | "discrete"
  | "dynamic"
  | "unbounded"
  | "none"
  | "target";

export type BitrateSourceId =
  | "h264-standard"
  | "hevc-standard"
  | "vp9-levels"
  | "av1-standard"
  | "vp8-webm"
  | "avc-webcodecs-registration"
  | "hevc-webcodecs-registration"
  | "vp9-webcodecs-registration"
  | "av1-webcodecs-registration"
  | "vp8-webcodecs-registration"
  | "opus-rfc"
  | "aac-chromium-windows"
  | "aac-chromium-macos"
  | "aac-safari-macos"
  | "youtube-upload"
  | "apple-hls"
  | "google-vp9"
  | "google-vp9-quantizer"
  | "webm-encoder-parameters"
  | "project-comparison";

export type BitrateSource = {
  readonly id: BitrateSourceId;
  readonly title: string;
  readonly url: string;
};

export type BitrateFact = {
  readonly authority: BitrateAuthority;
  readonly kind: BitrateFactKind;
  readonly min?: number;
  readonly max?: number;
  readonly values?: readonly number[];
  readonly value?: number;
  readonly source?: BitrateSourceId;
  /** Translation key suffix for a context such as “stereo music”. */
  readonly context?: string;
};

export type BitrateGuidance = {
  readonly family: VideoFamily | AudioFamily;
  readonly profile: string;
  readonly level: string | null;
  readonly codec: string;
  readonly support: readonly BitrateFact[];
  readonly recommendations: readonly BitrateFact[];
  readonly quantizer: QuantizerGuidance | null;
  /** The value used by this inspector, kept separate from published guidance. */
  readonly testBitrate: number | null;
  readonly testQuantizer: number | null;
};

export type QuantizerQualityDirection =
  | "lowerIsHigherQuality"
  | "notApplicable";

export type QuantizerGuidance = {
  readonly support: readonly BitrateFact[];
  readonly recommendations: readonly BitrateFact[];
  readonly qualityDirection: QuantizerQualityDirection;
  /** A bounded, codec-specific value used only as a cross-codec test point. */
  readonly comparisonValue: number | null;
};

export const BITRATE_SOURCES: Record<BitrateSourceId, BitrateSource> = {
  "h264-standard": {
    id: "h264-standard",
    title: "ITU-T H.264, Annex A",
    url: "https://www.itu.int/rec/T-REC-H.264",
  },
  "hevc-standard": {
    id: "hevc-standard",
    title: "ITU-T H.265, Annex A",
    url: "https://www.itu.int/rec/T-REC-H.265",
  },
  "vp9-levels": {
    id: "vp9-levels",
    title: "WebM VP9 levels",
    url: "https://www.webmproject.org/vp9/levels/",
  },
  "av1-standard": {
    id: "av1-standard",
    title: "AOMedia AV1 specification, Annex A",
    url: "https://aomediacodec.github.io/av1-spec/av1-spec.pdf",
  },
  "vp8-webm": {
    id: "vp8-webm",
    title: "WebM FAQ (VP8/VP9 bitrate note)",
    url: "https://www.webmproject.org/about/faq/",
  },
  "avc-webcodecs-registration": {
    id: "avc-webcodecs-registration",
    title: "W3C AVC WebCodecs registration",
    url: "https://www.w3.org/TR/webcodecs-avc-codec-registration/",
  },
  "hevc-webcodecs-registration": {
    id: "hevc-webcodecs-registration",
    title: "W3C HEVC WebCodecs registration",
    url: "https://www.w3.org/TR/webcodecs-hevc-codec-registration/",
  },
  "vp9-webcodecs-registration": {
    id: "vp9-webcodecs-registration",
    title: "W3C VP9 WebCodecs registration",
    url: "https://www.w3.org/TR/webcodecs-vp9-codec-registration/",
  },
  "av1-webcodecs-registration": {
    id: "av1-webcodecs-registration",
    title: "W3C AV1 WebCodecs registration",
    url: "https://www.w3.org/TR/webcodecs-av1-codec-registration/",
  },
  "vp8-webcodecs-registration": {
    id: "vp8-webcodecs-registration",
    title: "W3C VP8 WebCodecs registration",
    url: "https://www.w3.org/TR/webcodecs-vp8-codec-registration/",
  },
  "opus-rfc": {
    id: "opus-rfc",
    title: "RFC 6716, Opus codec",
    url: "https://www.rfc-editor.org/rfc/rfc6716.html#section-2.1.1",
  },
  "aac-chromium-windows": {
    id: "aac-chromium-windows",
    title: "Chromium Windows Media Foundation AAC encoder",
    url: "https://chromium.googlesource.com/chromium/src/+/main/media/gpu/windows/mf_audio_encoder.cc",
  },
  "aac-chromium-macos": {
    id: "aac-chromium-macos",
    title: "Chromium macOS AudioToolbox AAC encoder",
    url: "https://chromium.googlesource.com/chromium/src/+/main/media/filters/mac/audio_toolbox_audio_encoder.cc",
  },
  "aac-safari-macos": {
    id: "aac-safari-macos",
    title: "WebKit macOS WebCodecs AudioEncoder",
    url: "https://github.com/WebKit/WebKit/blob/main/Source/WebCore/Modules/webcodecs/WebCodecsAudioEncoder.cpp",
  },
  "youtube-upload": {
    id: "youtube-upload",
    title: "YouTube recommended upload encoding settings",
    url: "https://support.google.com/youtube/answer/1722171",
  },
  "apple-hls": {
    id: "apple-hls",
    title: "Apple HLS Authoring Specification",
    url: "https://developer.apple.com/documentation/http-live-streaming/hls-authoring-specification-for-apple-devices",
  },
  "google-vp9": {
    id: "google-vp9",
    title: "Google VP9 encoding settings",
    url: "https://developers.google.com/media/vp9/settings",
  },
  "google-vp9-quantizer": {
    id: "google-vp9-quantizer",
    title: "Google VP9 bitrate modes",
    url: "https://developers.google.com/media/vp9/bitrate-modes",
  },
  "webm-encoder-parameters": {
    id: "webm-encoder-parameters",
    title: "WebM encoder parameters",
    url: "https://www.webmproject.org/docs/encoder-parameters/",
  },
  "project-comparison": {
    id: "project-comparison",
    title: "Inspector comparison baseline",
    url: "https://github.com/okathira-dev/client-web-api-sandbox/tree/main/src/encoder-capability-inspector",
  },
};

const H264_MAX_BITRATES: Record<string, number> = {
  "3.0": 10_000_000,
  "3.1": 14_000_000,
  "3.2": 20_000_000,
  "4.0": 20_000_000,
  "4.1": 50_000_000,
  "4.2": 50_000_000,
  "5.0": 135_000_000,
  "5.1": 240_000_000,
  "5.2": 240_000_000,
  "6.0": 240_000_000,
  "6.1": 480_000_000,
  "6.2": 800_000_000,
};

const HEVC_MAX_BITRATES: Record<string, number> = {
  "3.1": 10_000_000,
  "4.0": 12_000_000,
  "4.1": 20_000_000,
  "5.0": 25_000_000,
  "5.1": 40_000_000,
  "5.2": 60_000_000,
  "6.0": 60_000_000,
  "6.1": 120_000_000,
  "6.2": 240_000_000,
};

const VP9_MAX_BITRATES: Record<string, number> = {
  "3.1": 12_000_000,
  "4.0": 18_000_000,
  "4.1": 30_000_000,
  "5.0": 60_000_000,
  "5.1": 120_000_000,
  "5.2": 180_000_000,
  "6.0": 180_000_000,
  "6.1": 240_000_000,
  "6.2": 480_000_000,
};

const AV1_MAIN_MBPS: Record<string, number> = {
  "3.1": 10,
  "4.0": 12,
  "4.1": 20,
  "5.0": 30,
  "5.1": 40,
  "5.2": 60,
  "6.0": 60,
  "6.1": 100,
  "6.2": 160,
};

const target = (
  value: number,
  source: BitrateSourceId,
  context?: string,
  authority: BitrateAuthority = "recommendation",
): BitrateFact => ({
  authority,
  kind: "target",
  value,
  source,
  context,
});

const noPublishedValue = (
  source?: BitrateSourceId,
  context?: string,
  authority: BitrateAuthority = "recommendation",
): BitrateFact => ({
  authority,
  kind: "none",
  ...(source ? { source } : {}),
  ...(context ? { context } : {}),
});

const dynamic = (source: BitrateSourceId, context: string): BitrateFact => ({
  authority: "implementation",
  kind: "dynamic",
  source,
  context,
});

const range = (
  min: number,
  max: number | undefined,
  source: BitrateSourceId,
  authority: BitrateAuthority = "standard",
  context?: string,
): BitrateFact => ({
  authority,
  kind: "range",
  min,
  ...(max === undefined ? {} : { max }),
  source,
  context,
});

const maxFor = (
  family: VideoFamily,
  profile: string,
  level: string,
  codec: string,
): BitrateFact[] => {
  if (family === "h264") {
    const base = H264_MAX_BITRATES[level];
    if (!base) return [];
    const multiplier =
      profile === "High"
        ? 1.25
        : profile === "High 10"
          ? 3
          : profile.startsWith("High 4:")
            ? 4
            : 1;
    return [range(0, base * multiplier, "h264-standard")];
  }
  if (family === "h265") {
    const base = HEVC_MAX_BITRATES[level];
    return base
      ? [range(0, base, "hevc-standard", "standard", "hevcMainTier")]
      : [];
  }
  if (family === "vp9") {
    const base = VP9_MAX_BITRATES[level];
    return base ? [range(0, base, "vp9-levels")] : [];
  }
  if (family === "av1") {
    const mainMbps = AV1_MAIN_MBPS[level];
    if (!mainMbps) return [];
    const highTier = codec.includes("H");
    const maxMbps = highTier ? mainMbps * 2 : mainMbps;
    return [
      range(
        0,
        maxMbps * 1_000_000,
        "av1-standard",
        "standard",
        highTier ? "av1HighTier" : "av1MainTier",
      ),
    ];
  }
  return [
    {
      authority: "standard",
      kind: "unbounded",
      source: "vp8-webm",
    },
  ];
};

const QUANTIZER_GUIDANCE: Record<VideoFamily, QuantizerGuidance> = {
  h264: {
    support: [range(0, 51, "avc-webcodecs-registration")],
    recommendations: [noPublishedValue(undefined, "noUniversalQuantizer")],
    qualityDirection: "lowerIsHigherQuality",
    comparisonValue: 28,
  },
  h265: {
    support: [range(0, 51, "hevc-webcodecs-registration")],
    recommendations: [noPublishedValue(undefined, "noUniversalQuantizer")],
    qualityDirection: "lowerIsHigherQuality",
    comparisonValue: 28,
  },
  vp9: {
    support: [range(0, 63, "vp9-webcodecs-registration")],
    recommendations: [target(33, "google-vp9-quantizer", "vp9GoodQuality")],
    qualityDirection: "lowerIsHigherQuality",
    comparisonValue: 40,
  },
  av1: {
    support: [range(0, 63, "av1-webcodecs-registration")],
    recommendations: [noPublishedValue(undefined, "noUniversalQuantizer")],
    qualityDirection: "lowerIsHigherQuality",
    comparisonValue: 32,
  },
  vp8: {
    support: [
      noPublishedValue(
        "vp8-webcodecs-registration",
        "vp8NoQuantizer",
        "standard",
      ),
    ],
    recommendations: [noPublishedValue(undefined, "vp8NoQuantizer")],
    qualityDirection: "notApplicable",
    comparisonValue: null,
  },
};

const videoRecommendationSource = (family: VideoFamily): BitrateSourceId => {
  switch (family) {
    case "h264":
      return "youtube-upload";
    case "h265":
      return "apple-hls";
    case "vp9":
      return "google-vp9";
    case "vp8":
      return "webm-encoder-parameters";
    case "av1":
      return "project-comparison";
  }
};

const makeVideoGuidance = (candidate: VideoCandidate): BitrateGuidance => ({
  family: candidate.family,
  profile: candidate.profile,
  level: candidate.level === "—" ? null : candidate.level,
  codec: candidate.codec,
  support: maxFor(
    candidate.family,
    candidate.profile,
    candidate.level,
    candidate.codec,
  ),
  recommendations:
    candidate.bitrate === null
      ? [
          target(
            candidate.probeBitrate,
            videoRecommendationSource(candidate.family),
            "comparison",
            "comparison",
          ),
        ]
      : [
          target(
            candidate.bitrate,
            videoRecommendationSource(candidate.family),
            undefined,
            candidate.family === "av1" || candidate.family === "vp8"
              ? "comparison"
              : "recommendation",
          ),
        ],
  quantizer: QUANTIZER_GUIDANCE[candidate.family],
  testBitrate: candidate.bitrate,
  testQuantizer: candidate.quantizer,
});

const makeAudioGuidance = (candidate: AudioCandidate): BitrateGuidance => ({
  family: candidate.family,
  profile: candidate.profile,
  level: null,
  codec: candidate.codec,
  support:
    candidate.family === "aac"
      ? [
          {
            authority: "implementation",
            kind: "discrete",
            values: [96_000, 128_000, 160_000, 192_000],
            source: "aac-chromium-windows",
            context: "windowsChromium",
          },
          dynamic("aac-chromium-macos", "macChromium"),
          dynamic("aac-safari-macos", "macSafari"),
        ]
      : [range(6_000, 510_000, "opus-rfc")],
  recommendations:
    candidate.family === "aac"
      ? [
          {
            authority: "recommendation",
            kind: "none",
            context: "noUniversalValue",
          },
        ]
      : [
          range(8_000, 12_000, "opus-rfc", "recommendation", "opusNbSpeech"),
          range(16_000, 20_000, "opus-rfc", "recommendation", "opusWbSpeech"),
          range(28_000, 40_000, "opus-rfc", "recommendation", "opusFbSpeech"),
          range(48_000, 64_000, "opus-rfc", "recommendation", "opusMonoMusic"),
          range(
            64_000,
            128_000,
            "opus-rfc",
            "recommendation",
            "opusStereoMusic",
          ),
        ],
  quantizer: null,
  testBitrate: candidate.bitrate,
  testQuantizer: null,
});

export const getBitrateGuidance = (
  candidate: VideoCandidate | AudioCandidate,
): BitrateGuidance =>
  candidate.family === "aac" || candidate.family === "opus"
    ? makeAudioGuidance(candidate)
    : makeVideoGuidance(candidate as VideoCandidate);

export const getBitrateGuidanceForResult = (
  result: UnitResult,
): BitrateGuidance =>
  getBitrateGuidance({
    candidateId: result.candidateId,
    family: result.family,
    codec: result.codec,
    profile: result.profile,
    ...(result.kind === "video"
      ? {
          level: result.level,
          bitDepth: result.bitDepth,
          width: result.requestedConfig.width,
          height: result.requestedConfig.height,
          fps: result.requestedConfig.framerate ?? 30,
          bitrate: result.bitrate,
          probeBitrate: result.probeBitrate,
          bitrateMode: result.bitrateMode,
          quantizer: result.quantizer,
          container:
            result.requestedConfig.codec.startsWith("avc") ||
            result.requestedConfig.codec.startsWith("hvc")
              ? "mp4"
              : "webm",
          containerCodec:
            result.family === "h264"
              ? "avc"
              : result.family === "h265"
                ? "hevc"
                : result.family,
          label: result.label,
        }
      : {
          audioObjectType: result.expectedAudioObjectType,
          channels: result.channels,
          sampleRate: result.sampleRate,
          bitrate: result.bitrate ?? result.probeBitrate,
          bitrateMode: result.bitrateMode,
          container: result.family === "aac" ? "mp4" : "webm",
          containerCodec: result.family,
          label: result.label,
        }),
  } as VideoCandidate | AudioCandidate);

export const guidanceKey = (guidance: BitrateGuidance): string =>
  [guidance.family, guidance.profile, guidance.level ?? "—"].join("|");
