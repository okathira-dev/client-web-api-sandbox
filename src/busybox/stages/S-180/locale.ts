import { defineStageLocale } from "../locale";

/** S-180 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "見えない受け渡し", en: "An invisible handoff" },
  copyReversed: { ja: "逆さの名前をコピー", en: "Copy the reversed name" },
  inspect: { ja: "箱を調べる", en: "Inspect the box" },
  sentReversed: { ja: "逆さの名前を渡した", en: "Sent the reversed name" },
  copyUnavailable: { ja: "コピーできない", en: "Copy unavailable" },
  returnedUpright: { ja: "正しい向きで戻った", en: "It returned upright" },
  clipboardUnreadable: { ja: "読み取れない", en: "Clipboard unreadable" },
  B01: { ja: "コピーの箱", en: "Copy box" },
});
