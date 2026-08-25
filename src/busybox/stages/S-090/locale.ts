import { defineStageLocale } from "../locale";

/** S-090 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "外からの呼び声", en: "A call from outside" },
  callOutside: { ja: "外へ呼ぶ", en: "Call outside" },
  outsideBody: {
    ja: "箱が外で待っています。",
    en: "A box is waiting outside.",
  },
  B01: { ja: "通知の箱", en: "Notification box" },
});
