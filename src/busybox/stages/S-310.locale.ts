import { defineStageLocale } from "./locale";

/** S-310 のステージ固有コピー。表示文言はここから追加する。 */
export const s310Locale = defineStageLocale({
  stageName: { ja: "もう一度の起動", en: "Launch once more" },
  relaunchHint: {
    ja: "インストールしたBusyboxへ、このURLからもう一度入る。",
    en: "Open this URL into the installed Busybox again.",
  },
  launchUrl: { ja: "起動用URL", en: "Launch URL" },
  B01: { ja: "再起動の箱", en: "Launch-handler box" },
  B02: { ja: "ショートカットの箱", en: "Shortcut box" },
  B03: { ja: "新しいメモの箱", en: "New-note box" },
});
