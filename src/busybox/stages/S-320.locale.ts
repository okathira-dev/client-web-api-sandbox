import { defineStageLocale } from "./locale";

/** S-320 のステージ固有コピー。表示文言はここから追加する。 */
export const s320Locale = defineStageLocale({
  stageName: { ja: "折れ目をまたぐ", en: "Across the fold" },
  hint: {
    ja: "このステージのブラウザ挙動を観察する",
    en: "Observe the browser behavior in this stage",
  },
  segment: { ja: "面", en: "segment(s)" },
  continuous: { ja: "連続", en: "continuous" },
  folded: { ja: "折りたたみ", en: "folded" },
  foldHint: {
    ja: "折りたたみ端末で折れ目を作る。",
    en: "Create a fold on a foldable device.",
  },
  B01: { ja: "折れ目の箱", en: "Fold box" },
});
