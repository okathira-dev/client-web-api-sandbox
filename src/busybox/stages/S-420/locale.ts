import { defineStageLocale } from "../locale";

/** S-420 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "通知の金庫", en: "Notification vault" },
  vaultBody: {
    ja: "← → で入力し、本文で提出",
    en: "Enter with ← →, submit with the body",
  },
  sendVault: { ja: "金庫を外へ出す", en: "Send the vault outside" },
  B01: { ja: "金庫の箱", en: "Vault box" },
});
