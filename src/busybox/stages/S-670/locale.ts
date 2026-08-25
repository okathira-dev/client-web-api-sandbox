import { defineStageLocale } from "../locale";

/** S-670 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "Console迷路", en: "Console maze" },
  wall: {
    ja: "壁。盤面をConsoleへ再表示した。",
    en: "Wall; the board was printed again.",
  },
  exit: { ja: "出口に到達。", en: "Exit reached." },
  printed: {
    ja: "盤面をConsoleへ再表示した。",
    en: "Board printed to Console.",
  },
  resetStatus: { ja: "開始位置へ戻した。", en: "Reset to the start." },
  controls: { ja: "迷路操作", en: "Maze controls" },
  reset: { ja: "リセット", en: "Reset" },
  initial: {
    ja: "Consoleを開いて盤面を見る。",
    en: "Open Console to see the board.",
  },
  B01: { ja: "診断盤面の箱", en: "Diagnostic-board box" },
});
