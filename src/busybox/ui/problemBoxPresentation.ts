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
  "S-150-B01": {
    color: "#c084fc",
    clue: "dom",
    label: { ja: "文書構造の箱", en: "Document-structure box" },
  },
  "S-160-B01": {
    color: "#38bdf8",
    clue: "path",
    label: { ja: "入力軌跡の箱", en: "Pointer-trace box" },
  },
  "S-170-B01": {
    color: "#fbbf24",
    clue: "time",
    label: { ja: "時間の箱", en: "Animation-time box" },
  },
  "S-180-B01": {
    color: "#a78bfa",
    clue: "copy",
    label: { ja: "コピーの箱", en: "Copy box" },
  },
  "S-180-B02": {
    color: "#818cf8",
    clue: "paste",
    label: { ja: "貼り付けの箱", en: "Paste box" },
  },
  "S-190-B01": {
    color: "#22d3ee",
    clue: "screen",
    label: { ja: "再帰画面の箱", en: "Recursive-screen box" },
  },
  "S-200-B01": {
    color: "#fb7185",
    clue: "gamepad",
    label: { ja: "同時入力の箱", en: "Simultaneous-input box" },
  },
  "S-210-B01": {
    color: "#fbbf24",
    clue: "badge",
    label: { ja: "外側の数字の箱", en: "Outer-number box" },
  },
  "S-220-B01": {
    color: "#fb7185",
    clue: "history",
    label: { ja: "履歴の箱", en: "History box" },
  },
  "S-230-B01": {
    color: "#60a5fa",
    clue: "pip",
    label: { ja: "小窓の箱", en: "Picture-in-picture box" },
  },
  "S-240-B01": {
    color: "#34d399",
    clue: "share",
    label: { ja: "共有の箱", en: "Share box" },
  },
  "S-250-B01": {
    color: "#fbbf24",
    clue: "lock",
    label: { ja: "鍵を持つ箱", en: "Lock-holder box" },
  },
  "S-250-B02": {
    color: "#fb7185",
    clue: "wait",
    label: { ja: "鍵を待つ箱", en: "Lock-waiter box" },
  },
  "S-260-B01": {
    color: "#a78bfa",
    clue: "eyedropper",
    label: { ja: "色を採る箱", en: "Color-picker box" },
  },
  "S-270-B01": {
    color: "#34d399",
    clue: "gpu",
    label: { ja: "並列計算の箱", en: "Parallel-compute box" },
  },
  "S-280-B01": {
    color: "#22d3ee",
    clue: "bluetooth",
    label: { ja: "近くの電池の箱", en: "Nearby-battery box" },
  },
  "S-290-B01": {
    color: "#60a5fa",
    clue: "hid",
    label: { ja: "入力レポートの箱", en: "Input-report box" },
  },
  "S-300-B01": {
    color: "#818cf8",
    clue: "usb",
    label: { ja: "USB転送の箱", en: "USB-transfer box" },
  },
  "S-310-B01": {
    color: "#c084fc",
    clue: "launch",
    label: { ja: "再起動の箱", en: "Launch-handler box" },
  },
  "S-320-B01": {
    color: "#c084fc",
    clue: "fold",
    label: { ja: "折れ目の箱", en: "Fold box" },
  },
  "S-330-B01": {
    color: "#facc15",
    clue: "wake",
    label: { ja: "灯りを保つ箱", en: "Wake-lock box" },
  },
  "S-330-B02": {
    color: "#fde68a",
    clue: "return",
    label: { ja: "灯りを戻す箱", en: "Wake-lock return box" },
  },
  "S-340-B01": {
    color: "#34d399",
    clue: "transition",
    label: { ja: "画面遷移の箱", en: "View-transition box" },
  },
} as const satisfies Record<string, ProblemBoxPresentation>;

export type ProblemBoxId = keyof typeof problemBoxPresentation;
