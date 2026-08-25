import { defineStageLocale } from "../locale";

export const locale = defineStageLocale({
  B01: { ja: "戻る箱", en: "Return box" },
  B02: { ja: "留守番箱", en: "Offline box" },
  revisitClue: {
    ja: "一度この箱を離れて、もう一度戻ってきてください。",
    en: "Leave this box once, then return to it.",
  },
  post: { ja: "留守番郵便を投函", en: "Post offline mail" },
  waitingWorker: {
    ja: "Service Workerの準備を待っています。",
    en: "Waiting for the service worker.",
  },
  needOffline: {
    ja: "オフラインに切り替えてください。",
    en: "Go offline to post the mail.",
  },
  readyOffline: {
    ja: "投函できます。",
    en: "Ready to post.",
  },
  accepted: { ja: "郵便を預けました。", en: "Mail accepted." },
  rejected: { ja: "郵便を預けられません。", en: "Mail was not accepted." },
  receiptConsumed: { ja: "留守番郵便を受け取りました。", en: "Mail received." },
  receiptUnavailable: {
    ja: "郵便を確認できません。",
    en: "Mail could not be checked.",
  },
});
