import type { Locale } from "../i18n";
import type { ClueIconName } from "./ClueIcon";

interface ProblemBoxPresentation {
  color: string;
  clue: ClueIconName;
  label: Record<Locale, string>;
}

export const problemBoxPresentation = {
  "S-000-B01": {
    color: "#a78bfa",
    clue: "click",
    label: { ja: "クリックする箱", en: "Click box" },
  },
  "S-010-B01": {
    color: "#60a5fa",
    clue: "mouse",
    label: { ja: "マウスの箱", en: "Mouse box" },
  },
  "S-010-B02": {
    color: "#fb7185",
    clue: "touch",
    label: { ja: "タッチの箱", en: "Touch box" },
  },
  "S-010-B03": {
    color: "#34d399",
    clue: "pen",
    label: { ja: "ペンの箱", en: "Pen box" },
  },
  "S-020-B01": {
    color: "#818cf8",
    clue: "resize",
    label: { ja: "画面幅の箱", en: "Viewport box" },
  },
  "S-030-B01": {
    color: "#fbbf24",
    clue: "selection",
    label: { ja: "選択範囲の箱", en: "Selection box" },
  },
  "S-040-B01": {
    color: "#94a3b8",
    clue: "hidden",
    label: { ja: "見ない時間の箱", en: "Hidden-time box" },
  },
  "S-050-B01": {
    color: "#38bdf8",
    clue: "windows",
    label: { ja: "二つの窓の箱", en: "Two-window box" },
  },
  "S-060-B01": {
    color: "#c084fc",
    clue: "return",
    label: { ja: "再訪の箱", en: "Return box" },
  },
  "S-070-B01": {
    color: "#2dd4bf",
    clue: "offline",
    label: { ja: "オフラインの箱", en: "Offline box" },
  },
  "S-080-B01": {
    color: "#f59e0b",
    clue: "install",
    label: { ja: "別の入口の箱", en: "Installed-app box" },
  },
  "S-090-B01": {
    color: "#f472b6",
    clue: "notification",
    label: { ja: "通知の箱", en: "Notification box" },
  },
  "S-100-B01": {
    color: "#fb7185",
    clue: "orientation",
    label: { ja: "端末姿勢の箱", en: "Orientation box" },
  },
  "S-110-B01": {
    color: "#facc15",
    clue: "light",
    label: { ja: "光の箱", en: "Light box" },
  },
  "S-120-B01": {
    color: "#22d3ee",
    clue: "sound",
    label: { ja: "音の箱", en: "Sound box" },
  },
  "S-130-B01": {
    color: "#34d399",
    clue: "export",
    label: { ja: "鍵を外へ出す箱", en: "Export-key box" },
  },
  "S-130-B02": {
    color: "#10b981",
    clue: "import",
    label: { ja: "鍵を戻す箱", en: "Import-key box" },
  },
  "S-140-B01": {
    color: "#60a5fa",
    clue: "backup",
    label: { ja: "バックアップの箱", en: "Backup box" },
  },
  "S-140-B02": {
    color: "#a78bfa",
    clue: "devices",
    label: { ja: "別端末の箱", en: "Remote-device box" },
  },
} as const satisfies Record<string, ProblemBoxPresentation>;

export type ProblemBoxId = keyof typeof problemBoxPresentation;
