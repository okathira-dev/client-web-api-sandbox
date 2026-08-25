import { defineStageLocale } from "../locale";

export const locale = defineStageLocale({
  stageName: { ja: "キーボードでたどる", en: "Keyboard paths" },
  clue: {
    ja: "クリックできない箱へTabで移動し、selectは文字入力で探す。detailsは複数を開閉する。",
    en: "Reach the pointer-inert box with Tab, search the select by typing, and toggle several details.",
  },
  focusButton: { ja: "キーボードでたどる箱", en: "Keyboard-only box" },
  selectLabel: { ja: "メニューを検索", en: "Search the menu" },
  selectPlaceholder: { ja: "項目を入力して探す", en: "Type to search" },
  B01: { ja: "フォーカスの箱", en: "Focus box" },
  B02: { ja: "検索選択の箱", en: "Typeahead-select box" },
  B03: { ja: "排他開示の箱", en: "Exclusive-disclosure box" },
});
