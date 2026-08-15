import { defineStageLocale } from "./locale";

/** S-240 のステージ固有コピー。表示文言はここから追加する。 */
export const s240Locale = defineStageLocale({
  stageName: { ja: "渡した印", en: "The shared mark" },
  hint: {
    ja: "このステージのブラウザ挙動を観察する",
    en: "Observe the browser behavior in this stage",
  },
  shareMark: { ja: "箱の印:", en: "A mark from the box:" },
  share: { ja: "印を渡す", en: "Share the mark" },
  B01: { ja: "共有の箱", en: "Share box" },
  B02: { ja: "共有先の箱", en: "Share-target box" },
});
