import { defineStageLocale } from "../locale";

/** S-130 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "箱の外の鍵", en: "A key outside the box" },
  sendKey: { ja: "鍵を外へ", en: "Send key outside" },
  returnKey: { ja: "鍵を戻す", en: "Bring key back" },
  B01: { ja: "鍵を外へ出す箱", en: "Export-key box" },
  B02: { ja: "鍵を戻す箱", en: "Import-key box" },
});
