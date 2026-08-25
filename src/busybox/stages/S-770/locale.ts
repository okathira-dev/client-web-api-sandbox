import { defineStageLocale } from "../locale";

export const locale = defineStageLocale({
  stageName: { ja: "身分証棚", en: "Federated identity shelf" },
  B01: { ja: "Google FedCMの箱", en: "Google FedCM box" },
  startGoogle: { ja: "Googleの身分証を提示", en: "Present Google identity" },
  idle: {
    ja: "browserが仲介するGoogleのaccount chooserを手動で完了します。",
    en: "Manually complete Google's browser-mediated account chooser.",
  },
  loading: {
    ja: "公式providerを読み込んでいます…",
    en: "Loading the official provider…",
  },
  waiting: {
    ja: "browserのFedCM画面を待っています…",
    en: "Waiting for the browser FedCM surface…",
  },
  success: {
    ja: "FedCMによる手動提示を確認しました。",
    en: "Confirmed a manual FedCM presentation.",
  },
  unconfigured: {
    ja: "公開origin用のGoogle FedCM Client IDが未設定です。",
    en: "No Google FedCM client ID is configured for this public origin.",
  },
  unavailable: {
    ja: "Google Identity ServicesまたはFedCMを利用できません。",
    en: "Google Identity Services or FedCM is unavailable.",
  },
  rejected: {
    ja: "FedCM以外の結果、automatic結果、取消、または失敗は箱を開きません。",
    en: "Non-FedCM, automatic, cancelled, or failed results do not open the box.",
  },
  privacy: {
    ja: "返されたtokenやaccount属性は表示・保存・送信せず、判定直後に破棄します。",
    en: "Returned tokens and account properties are never shown, stored, or forwarded and are discarded immediately.",
  },
});
