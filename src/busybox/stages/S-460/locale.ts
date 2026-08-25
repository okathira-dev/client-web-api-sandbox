import { defineStageLocale } from "../locale";

/** S-460 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "タイトルバーの内側", en: "Inside the title bar" },
  overlayVisible: { ja: "overlay", en: "overlay" },
  browserWindow: { ja: "window", en: "window" },
  B01: { ja: "オーバーレイの箱", en: "Overlay box" },
});
