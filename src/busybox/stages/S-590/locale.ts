import { defineStageLocale } from "../locale";

/** S-590 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "出発点から", en: "From the starting point" },
  B01: { ja: "5mの箱", en: "5 m box" },
  B02: { ja: "25mの箱", en: "25 m box" },
  B03: { ja: "100mの箱", en: "100 m box" },
});
