import { defineStageLocale } from "./locale";

/** S-460 のステージ固有コピー。表示文言はここから追加する。 */
export const s460Locale = defineStageLocale({
  stageName: { ja: "タイトルバーの内側", en: "Inside the title bar" },
  hint: {
    ja: "このステージのブラウザ挙動を観察する",
    en: "Observe the browser behavior in this stage",
  },
  overlayVisible: { ja: "overlay", en: "overlay" },
  browserWindow: { ja: "window", en: "window" },
  B01: { ja: "オーバーレイの箱", en: "Overlay box" },
});
