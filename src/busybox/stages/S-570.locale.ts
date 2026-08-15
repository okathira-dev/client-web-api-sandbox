import { defineStageLocale } from "./locale";

/** S-570 のステージ固有コピー。表示文言はここから追加する。 */
export const s570Locale = defineStageLocale({
  stageName: { ja: "姿勢の巡回", en: "An orientation circuit" },
  hint: {
    ja: "このステージのブラウザ挙動を観察する",
    en: "Observe the browser behavior in this stage",
  },
  B01: { ja: "巡回の箱", en: "Circuit box" },
});
