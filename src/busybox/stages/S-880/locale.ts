import { defineStageLocale } from "../locale";

export const locale = defineStageLocale({
  stageName: { ja: "圧縮された荷物", en: "Compressed Parcels" },
  intro: {
    ja: "3つの荷物はそれぞれ異なる封印形式です。形式を選んで、実際にストリーム展開してください。",
    en: "The three parcels each use a different seal. Choose a format and actually stream-decompress it.",
  },
  chooseFormat: { ja: "封印形式", en: "Seal format" },
  open: { ja: "荷物を開く", en: "Open parcel" },
  waiting: { ja: "ストリームを展開中…", en: "Decompressing stream…" },
  opened: { ja: "荷物の中身を照合しました。", en: "Parcel contents matched." },
  failed: {
    ja: "この形式では開けません。別の封印を選べます。",
    en: "That format could not open it. Choose another seal.",
  },
  unsupported: {
    ja: "このブラウザはDecompressionStreamを提供していません。",
    en: "This browser has no DecompressionStream.",
  },
  B01: { ja: "青い荷物", en: "Blue parcel" },
  B02: { ja: "紫の荷物", en: "Purple parcel" },
  B03: { ja: "赤い荷物", en: "Red parcel" },
});
