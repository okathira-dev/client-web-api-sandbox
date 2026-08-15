import { defineStageLocale } from "./locale";

/** S-450 のステージ固有コピー。表示文言はここから追加する。 */
export const s450Locale = defineStageLocale({
  stageName: { ja: "専用の合図", en: "A private signal" },
  hint: {
    ja: "このステージのブラウザ挙動を観察する",
    en: "Observe the browser behavior in this stage",
  },
  sendPrivateSignal: { ja: "専用の合図を送る", en: "Send the private signal" },
  B01: { ja: "プロトコルの箱", en: "Protocol box" },
});
