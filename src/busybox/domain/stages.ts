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
  category: StageCategory;
}

export const stageCatalogue = [
  {
    id: "S-000",
    name: { ja: "最初の箱", en: "The first box" },
    boxCount: 1,
    category: "page",
  },
  {
    id: "S-010",
    name: { ja: "三つの手", en: "Three hands" },
    boxCount: 3,
    category: "device",
  },
  {
    id: "S-020",
    name: { ja: "枠に合わせる", en: "Fit the frame" },
    boxCount: 1,
    category: "page",
  },
  {
    id: "S-030",
    name: { ja: "選ばれた範囲", en: "The selected range" },
    boxCount: 1,
    category: "page",
  },
  {
    id: "S-040",
    name: { ja: "見ない時間", en: "Time unseen" },
    boxCount: 1,
    category: "transition",
  },
  {
    id: "S-050",
    name: { ja: "二つの窓", en: "Two windows" },
    boxCount: 1,
    category: "transition",
  },
  {
    id: "S-060",
    name: { ja: "帰ってくる箱", en: "The returning box" },
    boxCount: 1,
    category: "storage",
  },
  {
    id: "S-070",
    name: { ja: "通信のない返事", en: "An offline reply" },
    boxCount: 1,
    category: "storage",
  },
  {
    id: "S-080",
    name: { ja: "別の入口", en: "Another entrance" },
    boxCount: 1,
    category: "edge",
  },
  {
    id: "S-090",
    name: { ja: "外からの呼び声", en: "A call from outside" },
    boxCount: 1,
    category: "transition",
  },
  {
    id: "S-100",
    name: { ja: "傾けて止める", en: "Tilt and hold" },
    boxCount: 1,
    category: "device",
  },
  {
    id: "S-110",
    name: { ja: "光だけを見る", en: "See only light" },
    boxCount: 1,
    category: "device",
  },
  {
    id: "S-120",
    name: { ja: "音のかたち", en: "The shape of sound" },
    boxCount: 1,
    category: "device",
  },
  {
    id: "S-130",
    name: { ja: "箱の外の鍵", en: "A key outside the box" },
    boxCount: 2,
    category: "storage",
  },
  {
    id: "S-140",
    name: { ja: "もう一つの端末", en: "Another device" },
    boxCount: 2,
    category: "edge",
  },
] as const satisfies readonly StageSummary[];

export const totalBoxCount = stageCatalogue.reduce(
  (total, stage) => total + stage.boxCount,
  0,
);
