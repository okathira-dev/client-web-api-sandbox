import { defineStageLocale } from "./locale";

export const s060Locale = defineStageLocale({
  stageName: { ja: "帰ってくる箱", en: "The returning box" },
  revisitClue: { ja: "また、ここで。", en: "See you here again." },
  post: { ja: "オフライン郵便を投函", en: "Post offline beacon" },
  waitingWorker: {
    ja: "Service Workerの制御を待っています",
    en: "Waiting for Service Worker control",
  },
  readyOffline: {
    ja: "オフライン郵便を投函できます",
    en: "Offline beacon is ready",
  },
  needOffline: {
    ja: "ネットワークを切断すると投函できます",
    en: "Disconnect the network to post",
  },
  noReceipt: { ja: "receiptがまだありません", en: "No receipt yet" },
  receiptConsumed: { ja: "receiptを受け取りました", en: "Receipt consumed" },
  receiptUnavailable: {
    ja: "receipt保存領域を利用できません",
    en: "Receipt store unavailable",
  },
  rejected: {
    ja: "sendBeacon()が拒否されました",
    en: "sendBeacon() was rejected",
  },
  accepted: {
    ja: "sendBeacon()を受理。receiverへ移動します",
    en: "sendBeacon() accepted; navigating to receiver",
  },
  B01: { ja: "再訪の箱", en: "Return box" },
  B02: { ja: "オフライン郵便の箱", en: "Offline-mail box" },
});
