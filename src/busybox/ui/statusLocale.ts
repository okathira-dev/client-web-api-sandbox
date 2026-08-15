import type { Locale } from "../i18n";

export type CommonStatus =
  | "idle"
  | "active"
  | "waiting"
  | "running"
  | "error"
  | "unavailable"
  | "denied"
  | "success"
  | "syncing"
  | "cancelled"
  | "invalid"
  | "matched"
  | "read"
  | "connected"
  | "closed"
  | "created"
  | "used"
  | "pending"
  | "aborted"
  | "launched"
  | "released"
  | "downloaded"
  | "playing"
  | "granted"
  | "prompt"
  | "default";

const statusLabels: Readonly<
  Record<CommonStatus, Readonly<Record<Locale, string>>>
> = {
  idle: { ja: "待機中", en: "Idle" },
  active: { ja: "有効", en: "Active" },
  waiting: { ja: "待機中", en: "Waiting" },
  running: { ja: "実行中", en: "Running" },
  error: { ja: "エラー", en: "Error" },
  unavailable: { ja: "利用できません", en: "Unavailable" },
  denied: { ja: "拒否されました", en: "Denied" },
  success: { ja: "成功", en: "Success" },
  syncing: { ja: "同期中", en: "Syncing" },
  cancelled: { ja: "キャンセル", en: "Cancelled" },
  invalid: { ja: "無効", en: "Invalid" },
  matched: { ja: "一致", en: "Matched" },
  read: { ja: "読み取り済み", en: "Read" },
  connected: { ja: "接続済み", en: "Connected" },
  closed: { ja: "切断済み", en: "Closed" },
  created: { ja: "作成済み", en: "Created" },
  used: { ja: "使用済み", en: "Used" },
  pending: { ja: "保留中", en: "Pending" },
  aborted: { ja: "中断", en: "Aborted" },
  launched: { ja: "起動済み", en: "Launched" },
  released: { ja: "解放済み", en: "Released" },
  downloaded: { ja: "保存済み", en: "Downloaded" },
  playing: { ja: "再生中", en: "Playing" },
  granted: { ja: "許可済み", en: "Granted" },
  prompt: { ja: "未選択", en: "Prompt" },
  default: { ja: "初期状態", en: "Default" },
};

export function statusText(locale: Locale, status: string): string {
  return statusLabels[status as CommonStatus]?.[locale] ?? status;
}
