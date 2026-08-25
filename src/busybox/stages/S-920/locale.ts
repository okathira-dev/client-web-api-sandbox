import { defineStageLocale } from "../locale";

export const locale = defineStageLocale({
  stageName: { ja: "ポップオーバー迷路", en: "Popover Maze" },
  intro: {
    ja: "浮かぶ部屋をクリックして、画面端で動く影の箱が本物になる場所を探してください。",
    en: "Click through the floating rooms until an edge-aware shadow box becomes real.",
  },
  start: { ja: "迷路を開く", en: "Open maze" },
  frameTitle: { ja: "ポップオーバー迷路の額縁", en: "Popover maze frame" },
  unavailableArea: { ja: "表示不可エリア", en: "OUTSIDE DISPLAY AREA" },
  directionUp: { ja: "上へ進む", en: "Go up" },
  directionRight: { ja: "右へ進む", en: "Go right" },
  directionDown: { ja: "下へ進む", en: "Go down" },
  directionLeft: { ja: "左へ進む", en: "Go left" },
  deadEnd: { ja: "行き止まり", en: "Dead end" },
  ready: {
    ja: "影の箱は画面端で位置を変えます。浮かぶ部屋をたどってください。",
    en: "Shadow boxes move at the viewport edge. Follow the floating rooms.",
  },
  preparing: {
    ja: "迷路の額縁を準備しています…",
    en: "Preparing the maze frame…",
  },
  unavailable: {
    ja: "この迷路にはPopoverとAnchor Positioningが必要です。",
    en: "This maze needs Popover and Anchor Positioning.",
  },
  B01: { ja: "琥珀の終点", en: "Amber finish" },
  B02: { ja: "青緑の終点", en: "Cyan finish" },
  B03: { ja: "紫の終点", en: "Violet finish" },
});
