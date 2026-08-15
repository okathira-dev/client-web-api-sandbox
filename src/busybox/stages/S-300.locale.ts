import { defineStageLocale } from "./locale";

/** S-300 のステージ固有コピー。表示文言はここから追加する。 */
export const s300Locale = defineStageLocale({
  stageName: { ja: "線の向こう", en: "Across the wire" },
  hint: {
    ja: "このステージのブラウザ挙動を観察する",
    en: "Observe the browser behavior in this stage",
  },
  receiveUsb: { ja: "線の向こうから受け取る", en: "Receive across the wire" },
  B01: { ja: "USB転送の箱", en: "USB-transfer box" },
});
