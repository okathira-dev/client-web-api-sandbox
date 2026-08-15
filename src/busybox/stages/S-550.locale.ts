import { defineStageLocale } from "./locale";

/** S-550 のステージ固有コピー。表示文言はここから追加する。 */
export const s550Locale = defineStageLocale({
  stageName: { ja: "重さが消える瞬間", en: "When weight disappears" },
  hint: {
    ja: "このステージのブラウザ挙動を観察する",
    en: "Observe the browser behavior in this stage",
  },
  B01: { ja: "低加速度の箱", en: "Low-acceleration box" },
});
