import { defineStageLocale } from "../locale";

export const locale = defineStageLocale({
  stageName: { ja: "戻る道", en: "The path back" },
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
  navigationBranch: {
    ja: "Navigation APIの分岐経路",
    en: "Navigation API branch route",
  },
  browserBack: { ja: "← ブラウザの戻る →", en: "← browser Back →" },
  B01: { ja: "履歴の箱", en: "History box" },
  B02: { ja: "戻る・進むの箱", en: "Back-forward box" },
  B03: { ja: "再読込の箱", en: "Reload box" },
  B04: { ja: "分岐破棄の箱", en: "Branch-disposal box" },
});
