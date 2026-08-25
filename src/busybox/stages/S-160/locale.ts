import { defineStageLocale } from "../locale";

/** S-160 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "速さの軌跡", en: "A trace of speed" },
  traceLabel: {
    ja: "ゆっくりと速く動かす軌跡",
    en: "A trace drawn both slowly and quickly",
  },
  B01: { ja: "入力軌跡の箱", en: "Pointer-trace box" },
});
