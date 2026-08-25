import { defineStageLocale } from "../locale";

export const locale = defineStageLocale({
  stageName: { ja: "その場でつくる字幕", en: "Captions Made Live" },
  intro: {
    ja: "映像に現れる3つの記号へ、再生中に対応する字幕を足してください。字幕はファイルからではなく、この場でtrackへ追加されます。",
    en: "Add the matching caption while each of the three symbols appears. Captions are added to the track here, not loaded from a file.",
  },
  redCircle: { ja: "赤い円", en: "Red circle" },
  blueTriangle: { ja: "青い三角", en: "Blue triangle" },
  yellowSquare: { ja: "黄色い四角", en: "Yellow square" },
  added: {
    ja: "字幕を追加しました。再生位置で照合します。",
    en: "Caption added. Matching it at the playhead.",
  },
  waiting: {
    ja: "記号が現れる間に対応する字幕を押してください。",
    en: "Press its matching caption while a symbol is visible.",
  },
  complete: {
    ja: "3つの字幕が映像の時刻に重なりました。",
    en: "All three captions overlapped their video moments.",
  },
  reset: { ja: "字幕を作り直す", en: "Rebuild captions" },
  unsupported: {
    ja: "このブラウザはruntime TextTrackを提供していません。",
    en: "This browser cannot create runtime TextTracks.",
  },
  B01: { ja: "重なった字幕の箱", en: "Overlapped caption box" },
});
