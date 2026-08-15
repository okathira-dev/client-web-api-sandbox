import { defineStageLocale } from "./locale";

/** S-340 のステージ固有コピー。表示文言はここから追加する。 */
export const s340Locale = defineStageLocale({
  stageName: { ja: "形をつなぐ", en: "Connect the shapes" },
  hint: {
    ja: "このステージのブラウザ挙動を観察する",
    en: "Observe the browser behavior in this stage",
  },
  connectShapes: { ja: "形をつなぐ", en: "Connect the shapes" },
  B01: { ja: "画面遷移の箱", en: "View-transition box" },
});
