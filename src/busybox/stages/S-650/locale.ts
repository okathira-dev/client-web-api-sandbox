import { defineStageLocale } from "../locale";

/** S-650 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "許可の四扉", en: "Four permission doors" },
  geolocation: { ja: "位置情報", en: "geolocation" },
  notifications: { ja: "通知", en: "notifications" },
  camera: { ja: "カメラ", en: "camera" },
  microphone: { ja: "マイク", en: "microphone" },
  requested: { ja: "要求済み", en: "requested" },
  denied: { ja: "拒否または利用不可", en: "denied or unavailable" },
  unknown: { ja: "不明", en: "unknown" },
  B01: { ja: "位置情報の箱", en: "Geolocation box" },
  B02: { ja: "通知の箱", en: "Notification box" },
  B03: { ja: "カメラの箱", en: "Camera box" },
  B04: { ja: "マイクの箱", en: "Microphone box" },
});
