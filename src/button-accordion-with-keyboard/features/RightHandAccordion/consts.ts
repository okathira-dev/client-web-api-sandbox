// リードとそのラベルの定義
export const REED_LABEL_MAP = {
  LOW: "L1",
  MID_1: "M1",
  MID_2: "M2",
  MID_3: "M3",
  HIGH: "H1",
} as const;

export type ReedName = keyof typeof REED_LABEL_MAP;
export type ReedLabel = (typeof REED_LABEL_MAP)[ReedName];
