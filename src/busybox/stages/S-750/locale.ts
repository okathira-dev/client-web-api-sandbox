import { defineStageLocale } from "../locale";

export const locale = defineStageLocale({
  stageName: { ja: "届いた封書", en: "The delivered letter" },
  B01: { ja: "自動受取の箱", en: "Automatic-receipt box" },
  request: { ja: "SMSを待つ", en: "Wait for SMS" },
  copy: { ja: "SMS本文をコピー", en: "Copy SMS body" },
  reset: { ja: "新しい封書", en: "New letter" },
  instruction: {
    ja: "別の電話または協力者から、次の本文をSMSで送ります。電話番号はこのpageへ入力しません。",
    en: "Send this exact SMS from another phone or collaborator. Do not enter a phone number on this page.",
  },
  inputLabel: { ja: "ワンタイムコード", en: "One-time code" },
  idle: {
    ja: "OTP専用のbrowser / OS経路だけを待ちます。",
    en: "Waiting only for a browser or OS OTP-specific path.",
  },
  waiting: { ja: "実SMSを待っています…", en: "Waiting for a real SMS…" },
  received: {
    ja: "OTP専用経路で届きました。",
    en: "Received through an OTP-specific path.",
  },
  copied: { ja: "SMS本文をコピーしました。", en: "Copied the SMS body." },
  manual: {
    ja: "手入力、paste、dropは受取経路になりません。",
    en: "Typing, paste, and drop are not receipt paths.",
  },
  unavailable: {
    ja: "WebOTPは利用できません。対応OSのSecurity Code AutoFillは欄へ直接現れます。",
    en: "WebOTP is unavailable. A supported OS Security Code AutoFill may still fill the field.",
  },
  cancelled: {
    ja: "OTP待機は取消または失敗しました。",
    en: "OTP waiting was cancelled or failed.",
  },
});
