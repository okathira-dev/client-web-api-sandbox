import { defineStageLocale } from "./locale";

/** S-010 のステージ固有コピー。表示文言はここから追加する。 */
export const s010Locale = defineStageLocale({
  stageName: { ja: "三つの手", en: "Three hands" },
  hint: {
    ja: "このステージのブラウザ挙動を観察する",
    en: "Observe the browser behavior in this stage",
  },
  B01: { ja: "マウスの箱", en: "Mouse box" },
  B02: { ja: "タッチの箱", en: "Touch box" },
  B03: { ja: "ペンの箱", en: "Pen box" },
});
