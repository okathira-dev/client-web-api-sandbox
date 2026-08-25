import { defineStageLocale } from "../locale";

/** S-380 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "三つの資格情報", en: "Three credentials" },
  passkeyAccount: { ja: "passkeyアカウント", en: "Passkey account" },
  passkeyNote: {
    ja: "作成したpasskeyは端末のpasskey管理画面に残る。遊び終えたらBusybox用passkeyをそこで削除できる。",
    en: "The created passkey remains in your device's passkey manager. You can remove the Busybox passkey there after playing.",
  },
  browserError: { ja: "ブラウザエラー", en: "Browser error" },
  B01: { ja: "保存の箱", en: "Create box" },
  B02: { ja: "利用成功の箱", en: "Use-success box" },
  B03: { ja: "利用失敗の箱", en: "Use-failure box" },
});
