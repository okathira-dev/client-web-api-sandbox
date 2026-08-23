import { defineStageLocale } from "./locale";

/** S-440 のステージ固有コピー。表示文言はここから追加する。 */
export const s440Locale = defineStageLocale({
  stageName: { ja: ".busyboxの入口", en: "The .busybox entrance" },
  saveBusybox: { ja: ".busyboxを保存", en: "Save .busybox" },
  B01: { ja: "ファイル起動の箱", en: "File-launch box" },
});
