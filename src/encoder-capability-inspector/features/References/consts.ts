/**
 * 参考文献。
 *
 * codec string の書き方や、この検査が何を確かめているのかを追えるようにするための一覧。
 * 題名は原典のまま英語で持ち、補足だけを翻訳する（`references.<id>` を引く）。
 */

export const REFERENCE_GROUPS = [
  {
    id: "spec",
    links: [
      {
        id: "webcodecs",
        title: "WebCodecs",
        url: "https://www.w3.org/TR/webcodecs/",
      },
      {
        id: "webcodecs-explainer",
        title: "WebCodecs Explainer",
        url: "https://github.com/w3c/webcodecs/blob/main/explainer.md",
      },
      {
        id: "webcodecs-mdn",
        title: "MDN: WebCodecs API",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API",
      },
      {
        id: "is-config-supported",
        title: "MDN: VideoEncoder.isConfigSupported()",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/VideoEncoder/isConfigSupported_static",
      },
      {
        id: "configure",
        title: "MDN: VideoEncoder.configure()",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/VideoEncoder/configure",
      },
    ],
  },
  {
    id: "codec-string",
    links: [
      {
        id: "codec-registry",
        title: "WebCodecs Codec Registry",
        url: "https://www.w3.org/TR/webcodecs-codec-registry/",
      },
      {
        id: "rfc6381",
        title: "RFC 6381: The 'Codecs' and 'Profiles' Parameters",
        url: "https://datatracker.ietf.org/doc/html/rfc6381",
      },
      {
        id: "mdn-codecs-parameter",
        title: "MDN: The codecs parameter in common media types",
        url: "https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/codecs_parameter",
      },
      {
        id: "avc-registration",
        title: "WebCodecs AVC (H.264) Codec Registration",
        url: "https://www.w3.org/TR/webcodecs-avc-codec-registration/",
      },
      {
        id: "hevc-registration",
        title: "WebCodecs HEVC (H.265) Codec Registration",
        url: "https://www.w3.org/TR/webcodecs-hevc-codec-registration/",
      },
      {
        id: "vp9-registration",
        title: "WebCodecs VP9 Codec Registration",
        url: "https://www.w3.org/TR/webcodecs-vp9-codec-registration/",
      },
      {
        id: "vp8-registration",
        title: "WebCodecs VP8 Codec Registration",
        url: "https://www.w3.org/TR/webcodecs-vp8-codec-registration/",
      },
      {
        id: "av1-registration",
        title: "WebCodecs AV1 Codec Registration",
        url: "https://www.w3.org/TR/webcodecs-av1-codec-registration/",
      },
      {
        id: "aac-registration",
        title: "WebCodecs AAC Codec Registration",
        url: "https://www.w3.org/TR/webcodecs-aac-codec-registration/",
      },
      {
        id: "opus-registration",
        title: "WebCodecs Opus Codec Registration",
        url: "https://www.w3.org/TR/webcodecs-opus-codec-registration/",
      },
    ],
  },
  {
    id: "codec",
    links: [
      {
        id: "h264",
        title:
          "ITU-T H.264: Advanced video coding for generic audiovisual services",
        url: "https://www.itu.int/rec/T-REC-H.264",
      },
      {
        id: "h265",
        title: "ITU-T H.265: High efficiency video coding",
        url: "https://www.itu.int/rec/T-REC-H.265",
      },
      {
        id: "vp9-mp4",
        title: "VP Codec ISO Media File Format Binding",
        url: "https://www.webmproject.org/vp9/mp4/",
      },
      {
        id: "av1-isobmff",
        title: "AV1 Codec ISO Media File Format Binding",
        url: "https://aomediacodec.github.io/av1-isobmff/",
      },
      {
        id: "mp4ra",
        title: "MP4RA: Registered object types",
        url: "https://mp4ra.org/registered-types/object-types",
      },
      {
        id: "rfc6716",
        title: "RFC 6716: Definition of the Opus Audio Codec",
        url: "https://datatracker.ietf.org/doc/html/rfc6716",
      },
    ],
  },
  {
    id: "implementation",
    links: [
      {
        id: "chrome-webcodecs",
        title: "Chrome for Developers: Video processing with WebCodecs",
        url: "https://developer.chrome.com/docs/web-platform/best-practices/webcodecs",
      },
      {
        id: "chromium-mf-audio-encoder",
        title: "Chromium: Media Foundation audio encoder",
        url: "https://chromium.googlesource.com/chromium/src/+/main/media/gpu/windows/mf_audio_encoder.cc",
      },
      {
        id: "webcodecs-samples",
        title: "WebCodecs samples",
        url: "https://w3c.github.io/webcodecs/samples/",
      },
      {
        id: "track-processor",
        title: "MDN: MediaStreamTrackProcessor",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrackProcessor",
      },
      {
        id: "mediabunny",
        title: "Mediabunny",
        url: "https://mediabunny.dev/",
      },
    ],
  },
] as const;

export type ReferenceGroup = (typeof REFERENCE_GROUPS)[number];
