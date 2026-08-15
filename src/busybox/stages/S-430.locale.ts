import { defineStageLocale } from "./locale";

/** S-430 のステージ固有コピー。表示文言はここから追加する。 */
export const s430Locale = defineStageLocale({
  stageName: { ja: "外側から止める", en: "Pause from outside" },
  hint: {
    ja: "このステージのブラウザ挙動を観察する",
    en: "Observe the browser behavior in this stage",
  },
  startSound: { ja: "音を始める", en: "Start sound" },
  outsideControl: { ja: "外部操作", en: "Outside control" },
  pausedOutside: { ja: "外部から一時停止", en: "Paused outside" },
  playing: { ja: "再生中", en: "Playing" },
  idle: { ja: "待機中", en: "Idle" },
  B01: { ja: "外部停止の箱", en: "External-pause box" },
});
