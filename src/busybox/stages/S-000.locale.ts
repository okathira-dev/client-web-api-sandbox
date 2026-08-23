import { defineStageLocale } from "./locale";

/** S-000 のステージ固有コピー。表示文言はここから追加する。 */
export const s000Locale = defineStageLocale({
  stageName: { ja: "最初の箱", en: "The first box" },
  B01: { ja: "クリックする箱", en: "Click box" },
});
