import { defineStageLocale } from "../locale";

/** S-250 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "一つだけの鍵", en: "The one lock" },
  openNextColor: { ja: "次の色を開く", en: "Open the next color" },
  B01: { ja: "白になる箱", en: "White-light box" },
  B02: { ja: "閉じる順番の箱", en: "Closing-order box" },
});
