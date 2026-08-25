import { defineStageLocale } from "../locale";

/** S-290 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "生の入力", en: "Raw input" },
  waitHid: { ja: "HID入力を待つ", en: "Wait for HID input" },
  B01: { ja: "入力レポートの箱", en: "Input-report box" },
});
