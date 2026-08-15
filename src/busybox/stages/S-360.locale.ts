import { defineStageLocale } from "./locale";

/** S-360 のステージ固有コピー。表示文言はここから追加する。 */
export const s360Locale = defineStageLocale({
  stageName: { ja: "窓を渡る音", en: "Sound across windows" },
  hint: {
    ja: "このステージのブラウザ挙動を観察する",
    en: "Observe the browser behavior in this stage",
  },
  openReceiver: { ja: "受信側を開く", en: "Open receiver" },
  closeConnection: { ja: "接続を閉じる", en: "Close connection" },
  B01: { ja: "接続の箱", en: "Connection box" },
  B02: { ja: "切断の箱", en: "Disconnect box" },
});
