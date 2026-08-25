import { defineStageLocale } from "../locale";

export const locale = defineStageLocale({
  stageName: { ja: "架空の名刺", en: "A fictional business card" },
  B01: { ja: "五項目の箱", en: "Five-property box" },
  B02: { ja: "伏せた名刺の箱", en: "Withheld-card box" },
  full: { ja: "名刺を選ぶ", en: "Pick the full card" },
  empty: { ja: "項目を伏せて選ぶ", en: "Pick while withholding fields" },
  idle: {
    ja: "この架空人物を端末の連絡先へ作成してから、OSのpickerで選びます。",
    en: "Create this fictional contact on the device, then choose it in the OS picker.",
  },
  fullSuccess: {
    ja: "五項目が一致しました。",
    en: "All five properties matched.",
  },
  emptySuccess: {
    ja: "一件を選び、五項目を渡しませんでした。",
    en: "One contact was selected without sharing the five fields.",
  },
  mismatch: {
    ja: "選択結果は名刺の五項目と一致しません。",
    en: "The selected properties do not match the card.",
  },
  unavailable: {
    ja: "Contact Picker APIを利用できません。独自pickerでは代替しません。",
    en: "Contact Picker is unavailable; no custom picker substitutes for it.",
  },
  cancelled: {
    ja: "連絡先選択を取消しました。",
    en: "Contact selection was cancelled.",
  },
  iconAlt: {
    ja: "Busybox Courierの架空アイコン",
    en: "Fictional Busybox Courier icon",
  },
  saveIcon: { ja: "アイコン画像を保存", en: "Save contact icon" },
  nameLabel: { ja: "name", en: "name" },
  emailLabel: { ja: "email", en: "email" },
  telLabel: { ja: "tel", en: "tel" },
  addressLabel: { ja: "address", en: "address" },
  iconLabel: { ja: "icon", en: "icon" },
});
