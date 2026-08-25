import { defineStageLocale } from "../locale";

/** S-450 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "専用の合図", en: "A private signal" },
  sendPrivateSignal: { ja: "専用の合図を送る", en: "Send the private signal" },
  B01: { ja: "プロトコルの箱", en: "Protocol box" },
});
