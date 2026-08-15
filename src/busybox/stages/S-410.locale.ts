import { defineStageLocale } from "./locale";

/** S-410 のステージ固有コピー。表示文言はここから追加する。 */
export const s410Locale = defineStageLocale({
  stageName: { ja: "通知の迷路", en: "Notification maze" },
  hint: {
    ja: "このステージのブラウザ挙動を観察する",
    en: "Observe the browser behavior in this stage",
  },
  notificationBody: { ja: "矢印だけで進む", en: "Proceed with the arrows" },
  beginNotifications: { ja: "通知を始める", en: "Begin notifications" },
  B01: { ja: "通知操作の箱", en: "Notification-actions box" },
});
