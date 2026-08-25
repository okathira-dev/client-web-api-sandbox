import { defineStageLocale } from "../locale";

export const locale = defineStageLocale({
  stageName: { ja: "留守番する箱", en: "Idle Watch" },
  intro: {
    ja: "開始後、ブラウザは実際の離席と画面ロックを見守ります。60秒の時計ではなく端末の状態が鍵です。",
    en: "After starting, the browser watches real idleness and screen locking. Device state, not a 60-second clock, is the key.",
  },
  start: { ja: "見守りを始める", en: "Start watching" },
  requesting: { ja: "許可を確認中…", en: "Checking permission…" },
  watching: {
    ja: "端末の状態を見守っています。",
    en: "Watching device state.",
  },
  denied: {
    ja: "Idle Detectionの許可が必要です。",
    en: "Idle Detection permission is required.",
  },
  failed: {
    ja: "見守りを開始できませんでした。",
    en: "Could not start watching.",
  },
  idleUnlocked: {
    ja: "離席を観測しました。",
    en: "Observed idle and unlocked.",
  },
  screenLocked: {
    ja: "画面ロックを観測しました。",
    en: "Observed screen locked.",
  },
  B01: { ja: "離席した箱", en: "Idle box" },
  B02: { ja: "画面を閉じた箱", en: "Locked-screen box" },
});
