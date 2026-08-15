import { defineStageLocale } from "./locale";

export const s510Locale = defineStageLocale({
  stageName: { ja: "窓を越えるファイル", en: "A file across windows" },
  dropTarget: { ja: "ドロップ先", en: "Drop target" },
  realFile: { ja: "実ファイル", en: "Real file" },
  realFileHelp: {
    ja: "画像を保存し、OSのファイルからここへドラッグする。",
    en: "Save the image, then drag it here from the OS file manager.",
  },
  downloadPng: { ja: "PNGを保存", en: "Download PNG" },
  dropPng: { ja: "PNGファイルをここへ", en: "Drop the PNG here" },
  iframeImage: { ja: "iframeの画像", en: "Iframe image" },
  iframeTitle: { ja: "窓越しの画像", en: "Cross-origin image source" },
  dropIframe: { ja: "iframeの画像をここへ", en: "Drop the iframe image here" },
  receivedLayers: { ja: "受領レイヤー", en: "Received layers" },
  noPng: {
    ja: "PNGファイルをここへドロップしてください",
    en: "Drop a PNG file here",
  },
  wrongImage: { ja: "別の画像です", en: "This is a different image" },
  received: { ja: "受け取りました", en: "received" },
  unreadable: { ja: "画像を読み取れません", en: "Could not read the image" },
  needIframeDrag: {
    ja: "iframeの画像をドラッグしてからドロップしてください",
    en: "Drag an iframe image before dropping it",
  },
  forbidden: {
    ja: "許可されていない画像です",
    en: "This image is not allowed",
  },
  digestFailed: {
    ja: "画像の照合に失敗しました",
    en: "Image verification failed",
  },
  fetchFailed: {
    ja: "画像の取得に失敗しました",
    en: "Could not fetch the image",
  },
  B01: { ja: "ドロップの箱", en: "Drop box" },
  B02: { ja: "窓越し現像の箱", en: "Cross-window developing box" },
});
