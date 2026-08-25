import { defineStageLocale } from "../locale";

/** S-050 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "二つの窓", en: "Two windows" },
  openAnother: { ja: "もう一つ開く", en: "Open another" },
  B01: { ja: "二つの窓の箱", en: "Two-window box" },
});
