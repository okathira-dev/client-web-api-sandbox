import { defineStageLocale } from "../locale";

export const locale = defineStageLocale({
  stageName: { ja: "外側から止める", en: "Pause from outside" },
  startSound: { ja: "音を始める", en: "Start sound" },
  startRecovery: {
    ja: "復帰を待つ音を始める",
    en: "Start audio that waits for recovery",
  },
  outsideControl: { ja: "外部操作", en: "Outside control" },
  pausedOutside: { ja: "外部から一時停止", en: "Paused outside" },
  playing: { ja: "再生中", en: "Playing" },
  idle: { ja: "待機中", en: "Idle" },
  waitingForInterruption: {
    ja: "端末側で別の音を再生し、戻った後の復帰を待っています。",
    en: "Play another sound on the device, then wait for this audio to recover.",
  },
  audioSessionUnsupported: {
    ja: "この環境はAudio Sessionの復帰を報告しません。",
    en: "This environment does not report Audio Session recovery.",
  },
  B01: { ja: "外部停止の箱", en: "External-pause box" },
  B02: { ja: "音声復帰の箱", en: "Audio-recovery box" },
});
