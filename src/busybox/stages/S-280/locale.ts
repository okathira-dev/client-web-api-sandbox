import { defineStageLocale } from "../locale";

/** S-280 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "近くの電池", en: "A nearby battery" },
  readBattery: { ja: "近くの電池を読む", en: "Read a nearby battery" },
  B01: { ja: "近くの電池の箱", en: "Nearby-battery box" },
});
