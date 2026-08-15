import { defineStageLocale } from "./locale";

/** S-280 のステージ固有コピー。表示文言はここから追加する。 */
export const s280Locale = defineStageLocale({
  stageName: { ja: "近くの電池", en: "A nearby battery" },
  hint: {
    ja: "このステージのブラウザ挙動を観察する",
    en: "Observe the browser behavior in this stage",
  },
  readBattery: { ja: "近くの電池を読む", en: "Read a nearby battery" },
  B01: { ja: "近くの電池の箱", en: "Nearby-battery box" },
});
