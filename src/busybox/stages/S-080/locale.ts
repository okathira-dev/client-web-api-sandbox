import { defineStageLocale } from "../locale";

/** S-080 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "別の入口", en: "Another entrance" },
  installHint: {
    ja: "ブラウザの「アプリをインストール」または「ホーム画面に追加」でBusyboxを入れ、そのアイコンから開く。後の起動問題でもこのPWAを使う。",
    en: "Install Busybox with your browser's Install app or Add to Home Screen command, then open its icon. Later launch puzzles use this PWA too.",
  },
  B01: { ja: "別の入口の箱", en: "Installed-app box" },
});
