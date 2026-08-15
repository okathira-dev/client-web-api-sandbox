import { defineStageLocale } from "./locale";

/** S-090 のステージ固有コピー。表示文言はここから追加する。 */
export const s090Locale = defineStageLocale({
  stageName: { ja: "外からの呼び声", en: "A call from outside" },
  hint: {
    ja: "このステージのブラウザ挙動を観察する",
    en: "Observe the browser behavior in this stage",
  },
  callOutside: { ja: "外へ呼ぶ", en: "Call outside" },
  outsideBody: {
    ja: "箱が外で待っています。",
    en: "A box is waiting outside.",
  },
  B01: { ja: "通知の箱", en: "Notification box" },
});
