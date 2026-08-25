import { defineStageLocale } from "../locale";

export const locale = defineStageLocale({
  stageName: { ja: "XRの箱", en: "The XR box" },
  B01: { ja: "空間の箱", en: "Immersive-space box" },
  B02: { ja: "選択光線の箱", en: "Selection-ray box" },
  start: { ja: "XR空間を開く", en: "Enter immersive XR" },
  end: { ja: "XRを終了", en: "End XR" },
  idle: {
    ja: "対応機器を接続し、browserのXR開始画面から入ります。",
    en: "Connect a supported device and enter through the browser XR prompt.",
  },
  starting: { ja: "XR機器を確認しています…", en: "Checking XR devices…" },
  pose: {
    ja: "空間が始まりました。正面の箱へ選択光線を向けます。",
    en: "The space is active. Aim the selection ray at the box ahead.",
  },
  selected: { ja: "空間の箱を選択しました。", en: "Selected the box in XR." },
  unsupported: {
    ja: "immersive AR / VR機器を利用できません。",
    en: "No immersive AR or VR device is available.",
  },
  cancelled: {
    ja: "XR開始は取消または失敗しました。",
    en: "XR entry was cancelled or failed.",
  },
  ended: { ja: "XR sessionを終了しました。", en: "The XR session ended." },
});
