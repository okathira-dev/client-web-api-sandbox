import { defineStageLocale } from "./locale";

export const s710Locale = defineStageLocale({
  stageName: { ja: "動画変換室", en: "Video conversion room" },
  iframeTitle: {
    ja: "外部動画圧縮ツール",
    en: "Embedded video compression tool",
  },
  answer: { ja: "合言葉", en: "Password" },
  placeholder: { ja: "busybox{…}", en: "busybox{…}" },
  B01: { ja: "暗闇frameの箱", en: "Dark-frame box" },
  B02: { ja: "decode失敗の箱", en: "Decode-failure box" },
  B03: { ja: "QR frameの箱", en: "QR-frame box" },
  B04: { ja: "metadataの箱", en: "Metadata box" },
});
