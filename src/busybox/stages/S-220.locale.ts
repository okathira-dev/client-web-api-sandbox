import type { StageLocaleText } from "./locale";

export const s220Locale = {
  buildTrail: { ja: "道を3つ積む", en: "Build three steps" },
  useBack: { ja: "ブラウザの戻るを3回", en: "Use browser Back three times" },
  branchFromB: { ja: "AからBへ進む", en: "Go from A to B" },
  branchFromA: {
    ja: "戻ったら別の枝Cへ進む",
    en: "After Back, branch from A to C",
  },
  unavailable: {
    ja: "Navigation APIを利用できません",
    en: "Navigation API unavailable",
  },
  nativeNavigate: {
    ja: "native navigateイベント",
    en: "native navigate event",
  },
  currentEntry: {
    ja: "currententrychange; canGoForward=",
    en: "currententrychange; canGoForward=",
  },
  disposed: { ja: "current entryを破棄しました", en: "current entry disposed" },
} satisfies Record<string, StageLocaleText>;
