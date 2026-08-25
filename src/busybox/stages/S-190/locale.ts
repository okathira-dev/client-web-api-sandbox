import { defineStageLocale } from "../locale";

/** S-190 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "画面の中の画面", en: "A screen within the screen" },
  relayedScreen: { ja: "中継された画面", en: "Relayed screen" },
  sharedScreen: { ja: "共有画面のプレビュー", en: "Shared screen preview" },
  noAudio: { ja: "音声なし", en: "No audio" },
  captureScreen: { ja: "画面を映す", en: "Capture a screen" },
  openObserver: { ja: "観測窓を開く", en: "Open observer" },
  openMap: { ja: "地図を開く", en: "Open the map" },
  B01: { ja: "再帰画面の箱", en: "Recursive-screen box" },
  B02: { ja: "録画の箱", en: "Recording box" },
  B03: { ja: "中継の箱", en: "Relay box" },
  B04: { ja: "外縁の印の箱", en: "Edge-marker box" },
});
