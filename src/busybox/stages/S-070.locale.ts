import { defineStageLocale } from "./locale";

/** S-070 のステージ固有コピー。表示文言はここから追加する。 */
export const s070Locale = defineStageLocale({
  stageName: { ja: "通信のない返事", en: "An offline reply" },
  hint: {
    ja: "このステージのブラウザ挙動を観察する",
    en: "Observe the browser behavior in this stage",
  },
  B01: { ja: "オフラインの箱", en: "Offline box" },
});
