import { defineStageLocale } from "../locale";

/** S-070 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "通信のない返事", en: "An offline reply" },
  B01: { ja: "オフラインの箱", en: "Offline box" },
});
