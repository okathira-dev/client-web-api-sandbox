import { defineStageLocale } from "../locale";

/** S-140 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "もう一つの端末", en: "Another device" },
  connectDevices: { ja: "端末をつなぐ", en: "Connect devices" },
  driveNotConfigured: {
    ja: "Google Drive未設定",
    en: "Google Drive is not configured",
  },
  B01: { ja: "バックアップの箱", en: "Backup box" },
  B02: { ja: "別端末の箱", en: "Remote-device box" },
});
