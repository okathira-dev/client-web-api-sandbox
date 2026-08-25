import { defineStageLocale } from "../locale";

/** S-570 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "姿勢の巡回", en: "An orientation circuit" },
  B01: { ja: "巡回の箱", en: "Circuit box" },
});
