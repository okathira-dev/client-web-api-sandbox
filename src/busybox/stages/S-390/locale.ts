import { defineStageLocale } from "../locale";

/** S-390 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "待つ資格情報", en: "A waiting credential" },
  noMatchKey: { ja: "一致しない鍵", en: "No-match key" },
  beginWaiting: { ja: "待機開始", en: "Begin waiting" },
  abort: { ja: "中断", en: "Abort" },
  B01: { ja: "一致なしの箱", en: "No-match box" },
  B02: { ja: "中断の箱", en: "Abort box" },
});
