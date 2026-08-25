import { defineStageLocale } from "../locale";

export const locale = defineStageLocale({
  stageName: { ja: "架空の財布", en: "Fictional wallets" },
  start: { ja: "財布を開く", en: "Open the wallet" },
  waiting: {
    ja: "ブラウザの決済UIを待っています。",
    en: "Waiting for the browser payment UI.",
  },
  B01: { ja: "承認の箱", en: "Approval box" },
  B02: { ja: "拒否の箱", en: "Decline box" },
  B03: { ja: "再試行の箱", en: "Retry box" },
  B04: { ja: "◇財布の箱", en: "Diamond wallet box" },
  unavailable: {
    ja: "Payment Handlerを利用できません。",
    en: "Payment Handler is unavailable.",
  },
});
