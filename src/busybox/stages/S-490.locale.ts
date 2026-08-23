import { defineStageLocale } from "./locale";

/** S-490 のステージ固有コピー。表示文言はここから追加する。 */
export const s490Locale = defineStageLocale({
  stageName: { ja: "名前を置く", en: "Place the name" },
  answerPlaceholder: { ja: "busybox", en: "busybox" },
  B01: { ja: "busyboxの箱", en: "busybox box" },
});
