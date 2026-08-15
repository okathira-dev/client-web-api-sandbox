import { defineStageLocale } from "./locale";

/** S-530 のステージ固有コピー。表示文言はここから追加する。 */
export const s530Locale = defineStageLocale({
  stageName: { ja: "三方向の加速", en: "Acceleration in three directions" },
  hint: {
    ja: "このステージのブラウザ挙動を観察する",
    en: "Observe the browser behavior in this stage",
  },
  B01: { ja: "X軸の箱", en: "X-axis box" },
  B02: { ja: "Y軸の箱", en: "Y-axis box" },
  B03: { ja: "Z軸の箱", en: "Z-axis box" },
});
