import { defineStageLocale } from "../locale";

/** S-500 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "暗号の受け渡し", en: "A cipher handoff" },
  returnHere: { ja: "ここへ戻す", en: "Return it here" },
  B01: { ja: "選び出す箱", en: "Select-it box" },
});
