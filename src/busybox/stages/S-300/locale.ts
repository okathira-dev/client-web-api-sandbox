import { defineStageLocale } from "../locale";

/** S-300 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "線の向こう", en: "Across the wire" },
  receiveUsb: { ja: "線の向こうから受け取る", en: "Receive across the wire" },
  B01: { ja: "USB転送の箱", en: "USB-transfer box" },
});
