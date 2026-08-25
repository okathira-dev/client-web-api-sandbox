import { defineStageLocale } from "../locale";

export const locale = defineStageLocale({
  stageName: { ja: "遠くの映写箱", en: "Distant projection boxes" },
  B01: { ja: "外部文字の箱", en: "Remote text box" },
  B02: { ja: "外部QRの箱", en: "Remote QR box" },
  B03: { ja: "外部画面の箱", en: "Presentation display box" },
  idle: {
    ja: "二種類の外部表示を試します。",
    en: "Try two kinds of external display.",
  },
  remoteHeading: { ja: "同じ動画を外へ", en: "Send the same media" },
  presentationHeading: { ja: "別の画面を外へ", en: "Open a separate display" },
  connectRemote: { ja: "再生先を選ぶ", en: "Choose playback device" },
  showText: { ja: "文字区間を映す", en: "Show text segment" },
  showQr: { ja: "QR区間を映す", en: "Show QR segment" },
  keyLabel: { ja: "外部画面の二語", en: "Two words on the remote display" },
  submitKey: { ja: "文字鍵を渡す", en: "Submit text key" },
  scanQr: { ja: "cameraで外部QRを読む", en: "Scan remote QR with camera" },
  startPresentation: {
    ja: "外部画面へ別pageを送る",
    en: "Send a separate page",
  },
  remoteConnected: {
    ja: "外部再生先へ接続しました。",
    en: "Connected to the remote playback device.",
  },
  remoteWaiting: {
    ja: "接続完了を待っています。",
    en: "Waiting for a completed connection.",
  },
  remoteUnavailable: {
    ja: "Remote Playbackを利用できません。",
    en: "Remote Playback is unavailable.",
  },
  remoteRequired: {
    ja: "先に外部再生先へ接続します。",
    en: "Connect to a remote playback device first.",
  },
  textShown: {
    ja: "文字区間を外部画面へ再生しました。",
    en: "Played the text segment remotely.",
  },
  textSolved: {
    ja: "外部画面の文字鍵が一致しました。",
    en: "The remote text key matched.",
  },
  wrongKey: {
    ja: "現在の外部文字鍵とは一致しません。",
    en: "That is not the current remote text key.",
  },
  qrShown: {
    ja: "QR区間を外部画面へ再生しました。",
    en: "Played the QR segment remotely.",
  },
  qrRequired: {
    ja: "接続中にQR区間を外部再生します。",
    en: "Play the QR segment while remotely connected.",
  },
  qrSolved: {
    ja: "native BarcodeDetectorが現在のQRを読みました。",
    en: "Native BarcodeDetector read the current QR.",
  },
  barcodeUnavailable: {
    ja: "native QR BarcodeDetectorを利用できません。",
    en: "Native QR BarcodeDetector is unavailable.",
  },
  presentationWaiting: {
    ja: "外部receiverの初期表示を待っています。",
    en: "Waiting for the external receiver to render.",
  },
  presentationReady: {
    ja: "外部receiverを表示しました。",
    en: "The external receiver rendered.",
  },
  presentationUnavailable: {
    ja: "Presentation APIを利用できません。",
    en: "Presentation API is unavailable.",
  },
  cancelled: {
    ja: "外部表示は取消、切断、または失敗しました。",
    en: "External display was cancelled, disconnected, or failed.",
  },
});
