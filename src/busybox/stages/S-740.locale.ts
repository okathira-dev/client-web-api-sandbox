import { defineStageLocale } from "./locale";

export const s740Locale = defineStageLocale({
  stageName: { ja: "留守番温室", en: "Unattended greenhouse" },
  B01: { ja: "開花の箱", en: "Bloom box" },
  register: { ja: "温室を預ける", en: "Register greenhouse" },
  water: { ja: "水を預ける", en: "Leave water" },
  light: { ja: "光を預ける", en: "Leave light" },
  refresh: { ja: "成長を見る", en: "Inspect growth" },
  reset: { ja: "温室を片付ける", en: "Clear greenhouse" },
  idle: {
    ja: "まず温室をbrowserへ預けます。",
    en: "First register the greenhouse with the browser.",
  },
  unsupported: {
    ja: "Periodic Background Syncを利用できません。timerでは育てません。",
    en: "Periodic Background Sync is unavailable; no timer substitute is used.",
  },
  registered: {
    ja: "登録しました。水を預け、すべてのBusybox画面を閉じて待ちます。",
    en: "Registered. Leave water, close every Busybox window, and wait.",
  },
  waterLeft: {
    ja: "水を預けました。画面がない時のbrowserの訪問を待ちます。",
    en: "Water is waiting for a browser visit while no window is open.",
  },
  sprout: {
    ja: "芽が出ました。今度は光を預けて、もう一度留守にします。",
    en: "It sprouted. Leave light, then go away once more.",
  },
  lightLeft: {
    ja: "光を預けました。二度目の留守番を待ちます。",
    en: "Light is waiting for the second unattended visit.",
  },
  bloom: {
    ja: "留守の間に開花画像が届きました。",
    en: "The bloom image arrived while the page was away.",
  },
  waiting: {
    ja: "まだbrowserの実periodicsyncは届いていません。",
    en: "No real periodicsync event has arrived yet.",
  },
  cleared: {
    ja: "温室の登録と記録を削除しました。",
    en: "Greenhouse data was cleared.",
  },
  failed: {
    ja: "温室を準備できませんでした。",
    en: "The greenhouse could not be prepared.",
  },
  imageAlt: { ja: "温室の現在の成長", en: "Current greenhouse growth" },
});
