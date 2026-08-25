import { defineStageLocale } from "../locale";

/** S-540 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "光の両端", en: "Both ends of light" },
  B01: { ja: "暗闇の箱", en: "Darkness box" },
  B02: { ja: "眩光の箱", en: "Bright-light box" },
});
