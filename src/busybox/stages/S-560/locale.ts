import { defineStageLocale } from "../locale";

/** S-560 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "三軸の一回転", en: "One turn on each axis" },
  B01: { ja: "X回転の箱", en: "X-turn box" },
  B02: { ja: "Y回転の箱", en: "Y-turn box" },
  B03: { ja: "Z回転の箱", en: "Z-turn box" },
});
