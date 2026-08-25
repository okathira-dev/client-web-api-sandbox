import { defineStageLocale } from "../locale";

export const locale = defineStageLocale({
  stageName: { ja: "窓を越えるドラッグ", en: "Drag across boundaries" },
  dropTarget: { ja: "ドロップ先", en: "Drop target" },
  dropHint: {
    ja: "緑=受け付ける / 赤=受け付けない。ドラッグ中も色とカーソルを確認。",
    en: "Green accepts this payload; red rejects it. Watch the color and cursor while dragging.",
  },
  pageImage: { ja: "ページ内画像", en: "In-page image" },
  pageImageHelp: {
    ja: "画像を保存せず、そのままこの箱へドラッグする。",
    en: "Drag the image straight to this box without saving it.",
  },
  pageImageAlt: { ja: "ページ内D&D用画像", en: "In-page drag image" },
  dropPage: { ja: "ページ内画像をここへ", en: "Drop the page image here" },
  pageNeedsImage: {
    ja: "ページ内画像のURLを受け取れませんでした。",
    en: "No in-page image URL was received.",
  },
  pageReceived: {
    ja: "ページ内画像を受け取りました",
    en: "In-page image received",
  },
  fileImage: { ja: "OSファイル", en: "OS file" },
  fileImageHelp: {
    ja: "画像はドラッグ禁止。保存してから、OSのファイル一覧からここへドラッグする。",
    en: "This image cannot be dragged. Save it, then drag the file here from the OS file list.",
  },
  fileImageAlt: { ja: "保存して使う画像", en: "Image to save first" },
  downloadPng: { ja: "PNGを保存", en: "Download PNG" },
  dropFile: {
    ja: "保存したPNGファイルをここへ",
    en: "Drop the saved PNG file here",
  },
  fileNeedsPng: {
    ja: "保存したPNGファイルをここへドロップしてください。",
    en: "Drop the saved PNG file here.",
  },
  fileReceived: { ja: "OSファイルを受け取りました", en: "OS file received" },
  windowImage: { ja: "別windowの画像", en: "Separate-window image" },
  windowImageHelp: {
    ja: "iframeの画像は赤い禁止状態になります。別windowを開き、そちらの画像をここへドラッグする。",
    en: "The iframe image is rejected in red. Open a separate window and drag its image here.",
  },
  iframeTitle: { ja: "iframe内の画像", en: "Image inside an iframe" },
  openWindow: { ja: "別windowを開く", en: "Open a separate window" },
  windowOpened: {
    ja: "別windowを開きました。その画像をこの箱へドラッグしてください。",
    en: "The separate window is open. Drag its image to this box.",
  },
  windowReceived: {
    ja: "別windowの画像を受け取りました",
    en: "Separate-window image received",
  },
  popupBlocked: {
    ja: "別windowを開けません。ポップアップを許可してください。",
    en: "The separate window was blocked. Allow popups and try again.",
  },
  dropWindow: {
    ja: "別windowの画像をここへ",
    en: "Drop the separate-window image here",
  },
  needSeparateWindow: {
    ja: "iframeでは開きません。別windowの画像をドラッグしてください。",
    en: "The iframe image does not open this box. Drag the image from the separate window.",
  },
  wrongImage: { ja: "別の画像です", en: "This is a different image" },
  received: { ja: "受け取りました", en: "received" },
  unreadable: { ja: "画像を読み取れません", en: "Could not read the image" },
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
  B01: { ja: "ページ内画像の箱", en: "In-page image box" },
  B02: { ja: "OSファイルの箱", en: "OS file box" },
  B03: { ja: "別window画像の箱", en: "Separate-window image box" },
});
