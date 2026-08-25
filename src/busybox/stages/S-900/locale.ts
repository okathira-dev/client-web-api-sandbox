import { defineStageLocale } from "../locale";

export const locale = defineStageLocale({
  stageName: { ja: "映像の継ぎ目", en: "Video Splices" },
  intro: {
    ja: "順番の刻まれた4本の短いリールを、映写機の4つの空き枠へ番号どおりに入れます。完成した映像を最後まで再生してください。",
    en: "Place the four short, numbered reels into the projector's empty slots in their printed order. Play the completed video to the end.",
  },
  reel: { ja: "リール", en: "Reel" },
  sequence: { ja: "順", en: "order" },
  slot: { ja: "空き枠", en: "Empty slot" },
  assemble: { ja: "映写機へ送る", en: "Send to projector" },
  reset: { ja: "並びを消す", en: "Clear order" },
  waiting: { ja: "映像を継ぎ合わせ中…", en: "Splicing video…" },
  ready: {
    ja: "完成映像を最後まで再生してください。",
    en: "Play the completed video to the end.",
  },
  wrongOrder: {
    ja: "リールに刻まれた順番と違います。並びを作り直せます。",
    en: "This differs from the sequence printed on the reels. You can rebuild it.",
  },
  failed: {
    ja: "映像を継ぎ合わせられませんでした。",
    en: "Could not splice the video.",
  },
  unsupported: {
    ja: "このブラウザはVP8 MediaSourceを提供していません。",
    en: "This browser has no VP8 MediaSource support.",
  },
  B01: { ja: "つながった箱", en: "Spliced box" },
});
