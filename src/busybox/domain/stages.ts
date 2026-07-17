import type { Locale } from "../i18n";

export type StageCategory =
  | "page"
  | "transition"
  | "storage"
  | "device"
  | "edge";

export interface StageSummary {
  id: `S-${number}`;
  name: Record<Locale, string>;
  boxCount: number;
  boxIds: readonly string[];
  category: StageCategory;
}

export const stageCatalogue = [
  {
    id: "S-000",
    name: { ja: "最初の箱", en: "The first box" },
    boxCount: 1,
    boxIds: ["S-000-B01"],
    category: "page",
  },
  {
    id: "S-010",
    name: { ja: "三つの手", en: "Three hands" },
    boxCount: 3,
    boxIds: ["S-010-B01", "S-010-B02", "S-010-B03"],
    category: "device",
  },
  {
    id: "S-020",
    name: { ja: "枠に合わせる", en: "Fit the frame" },
    boxCount: 1,
    boxIds: ["S-020-B01"],
    category: "page",
  },
  {
    id: "S-030",
    name: { ja: "選ばれた範囲", en: "The selected range" },
    boxCount: 1,
    boxIds: ["S-030-B01"],
    category: "page",
  },
  {
    id: "S-040",
    name: { ja: "見ない時間", en: "Time unseen" },
    boxCount: 1,
    boxIds: ["S-040-B01"],
    category: "transition",
  },
  {
    id: "S-050",
    name: { ja: "二つの窓", en: "Two windows" },
    boxCount: 1,
    boxIds: ["S-050-B01"],
    category: "transition",
  },
  {
    id: "S-060",
    name: { ja: "帰ってくる箱", en: "The returning box" },
    boxCount: 1,
    boxIds: ["S-060-B01"],
    category: "storage",
  },
  {
    id: "S-070",
    name: { ja: "通信のない返事", en: "An offline reply" },
    boxCount: 1,
    boxIds: ["S-070-B01"],
    category: "storage",
  },
  {
    id: "S-080",
    name: { ja: "別の入口", en: "Another entrance" },
    boxCount: 1,
    boxIds: ["S-080-B01"],
    category: "edge",
  },
  {
    id: "S-090",
    name: { ja: "外からの呼び声", en: "A call from outside" },
    boxCount: 1,
    boxIds: ["S-090-B01"],
    category: "transition",
  },
  {
    id: "S-100",
    name: { ja: "傾けて止める", en: "Tilt and hold" },
    boxCount: 1,
    boxIds: ["S-100-B01"],
    category: "device",
  },
  {
    id: "S-110",
    name: { ja: "光だけを見る", en: "See only light" },
    boxCount: 1,
    boxIds: ["S-110-B01"],
    category: "device",
  },
  {
    id: "S-120",
    name: { ja: "音のかたち", en: "The shape of sound" },
    boxCount: 1,
    boxIds: ["S-120-B01"],
    category: "device",
  },
  {
    id: "S-130",
    name: { ja: "箱の外の鍵", en: "A key outside the box" },
    boxCount: 2,
    boxIds: ["S-130-B01", "S-130-B02"],
    category: "storage",
  },
  {
    id: "S-140",
    name: { ja: "もう一つの端末", en: "Another device" },
    boxCount: 2,
    boxIds: ["S-140-B01", "S-140-B02"],
    category: "edge",
  },
  {
    id: "S-150",
    name: { ja: "文書の順番", en: "Document order" },
    boxCount: 1,
    boxIds: ["S-150-B01"],
    category: "page",
  },
  {
    id: "S-160",
    name: { ja: "速さの軌跡", en: "A trace of speed" },
    boxCount: 1,
    boxIds: ["S-160-B01"],
    category: "page",
  },
  {
    id: "S-170",
    name: { ja: "止まった時間", en: "Paused time" },
    boxCount: 1,
    boxIds: ["S-170-B01"],
    category: "page",
  },
  {
    id: "S-180",
    name: { ja: "見えない受け渡し", en: "An invisible handoff" },
    boxCount: 2,
    boxIds: ["S-180-B01", "S-180-B02"],
    category: "transition",
  },
  {
    id: "S-190",
    name: { ja: "画面の中の画面", en: "A screen within the screen" },
    boxCount: 1,
    boxIds: ["S-190-B01"],
    category: "device",
  },
  {
    id: "S-200",
    name: { ja: "同時に押す", en: "Press together" },
    boxCount: 1,
    boxIds: ["S-200-B01"],
    category: "device",
  },
  {
    id: "S-210",
    name: { ja: "外側の数字", en: "The number outside" },
    boxCount: 1,
    boxIds: ["S-210-B01"],
    category: "edge",
  },
  {
    id: "S-220",
    name: { ja: "戻る道", en: "The path back" },
    boxCount: 1,
    boxIds: ["S-220-B01"],
    category: "transition",
  },
  {
    id: "S-230",
    name: { ja: "浮かぶ窓", en: "The floating window" },
    boxCount: 1,
    boxIds: ["S-230-B01"],
    category: "edge",
  },
  {
    id: "S-240",
    name: { ja: "渡した印", en: "The shared mark" },
    boxCount: 1,
    boxIds: ["S-240-B01"],
    category: "transition",
  },
  {
    id: "S-250",
    name: { ja: "一つだけの鍵", en: "The one lock" },
    boxCount: 2,
    boxIds: ["S-250-B01", "S-250-B02"],
    category: "transition",
  },
  {
    id: "S-260",
    name: { ja: "画面の一滴", en: "A drop from the screen" },
    boxCount: 1,
    boxIds: ["S-260-B01"],
    category: "device",
  },
  {
    id: "S-270",
    name: { ja: "並列の捜索", en: "The parallel search" },
    boxCount: 1,
    boxIds: ["S-270-B01"],
    category: "edge",
  },
  {
    id: "S-280",
    name: { ja: "近くの電池", en: "A nearby battery" },
    boxCount: 1,
    boxIds: ["S-280-B01"],
    category: "device",
  },
  {
    id: "S-290",
    name: { ja: "生の入力", en: "Raw input" },
    boxCount: 1,
    boxIds: ["S-290-B01"],
    category: "device",
  },
  {
    id: "S-300",
    name: { ja: "線の向こう", en: "Across the wire" },
    boxCount: 1,
    boxIds: ["S-300-B01"],
    category: "device",
  },
  {
    id: "S-310",
    name: { ja: "もう一度の起動", en: "Launch once more" },
    boxCount: 1,
    boxIds: ["S-310-B01"],
    category: "edge",
  },
  {
    id: "S-320",
    name: { ja: "折れ目をまたぐ", en: "Across the fold" },
    boxCount: 1,
    boxIds: ["S-320-B01"],
    category: "device",
  },
  {
    id: "S-330",
    name: { ja: "消えない灯り", en: "The light that stays" },
    boxCount: 2,
    boxIds: ["S-330-B01", "S-330-B02"],
    category: "edge",
  },
  {
    id: "S-340",
    name: { ja: "形をつなぐ", en: "Connect the shapes" },
    boxCount: 1,
    boxIds: ["S-340-B01"],
    category: "page",
  },
] as const satisfies readonly StageSummary[];

export const totalBoxCount = stageCatalogue.reduce(
  (total, stage) => total + stage.boxCount,
  0,
);
