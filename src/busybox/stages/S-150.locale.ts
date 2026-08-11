import type { StageLocaleText } from "./locale";

export const s150Locale = {
  clue: {
    ja: "クリックできない箱へTabで移動し、selectは文字入力で探す。detailsは複数を開閉する。",
    en: "Reach the pointer-inert box with Tab, search the select by typing, and toggle several details.",
  },
  focusButton: { ja: "キーボードでたどる箱", en: "Keyboard-only box" },
  selectLabel: { ja: "メニューを検索", en: "Search the menu" },
  selectPlaceholder: { ja: "項目を入力して探す", en: "Type to search" },
} satisfies Record<string, StageLocaleText>;
