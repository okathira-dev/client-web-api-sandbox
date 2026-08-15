import { defineLocale } from "../i18n";

export const uiLocale = defineLocale({
  primaryNav: { ja: "メインナビゲーション", en: "Primary navigation" },
  privacyPermissions: {
    ja: "プライバシーと権限",
    en: "Privacy and permissions",
  },
  stageMap: { ja: "ステージ地図", en: "Stage map" },
  zoomOut: { ja: "地図を縮小", en: "Zoom map out" },
  zoomIn: { ja: "地図を拡大", en: "Zoom map in" },
  centerMap: { ja: "中央へ", en: "Center" },
  stageLoading: { ja: "ステージを読み込んでいます…", en: "Loading stage…" },
  stageCrashed: {
    ja: "この箱は応答を停止しました。一覧へ戻って、もう一度試してください。",
    en: "This box stopped responding. Return to the box room and try again.",
  },
  clusterInput: { ja: "入力と文字", en: "Input & text" },
  clusterLifecycle: { ja: "ページの往来", en: "Page journeys" },
  clusterMedia: { ja: "音・映像・通知", en: "Media & notices" },
  clusterPwa: { ja: "PWAと認証", en: "PWA & identity" },
  clusterHardware: { ja: "端末と周辺機器", en: "Device & hardware" },
  clusterSensors: { ja: "位置とセンサー", en: "Location & sensors" },
});

const stageCardLabels = {
  ja: (stage: string, solved: number, total: number, status: string) =>
    `${stage}、${solved}/${total}、${status}`,
  en: (stage: string, solved: number, total: number, status: string) =>
    `${stage}, ${solved}/${total}, ${status}`,
} as const;

export type UiLocaleKey = keyof typeof uiLocale;
export type StageMapClusterLabel =
  | "clusterInput"
  | "clusterLifecycle"
  | "clusterMedia"
  | "clusterPwa"
  | "clusterHardware"
  | "clusterSensors";

export function uiText(
  locale: "ja" | "en",
  key: Exclude<UiLocaleKey, "stageCardLabel">,
): string {
  return uiLocale[key][locale];
}

export function stageCardLabel(
  locale: "ja" | "en",
  stage: string,
  solved: number,
  total: number,
  status: string,
): string {
  return stageCardLabels[locale](stage, solved, total, status);
}
