import { defineStageLocale } from "./locale";

/** S-110 のステージ固有コピー。表示文言はここから追加する。 */
export const s110Locale = defineStageLocale({
  stageName: { ja: "光だけを見る", en: "See only light" },
  hint: {
    ja: "このステージのブラウザ挙動を観察する",
    en: "Observe the browser behavior in this stage",
  },
  seeOnlyLight: { ja: "光だけを見る", en: "See only light" },
  B01: { ja: "光の箱", en: "Light box" },
});
