// リードとそのラベルの定義
export const REED_LABEL_MAP = {
  soprano: "S",
  alto: "A",
  tenor: "T",
  bass: "B",
} as const;

export type ReedName = keyof typeof REED_LABEL_MAP;
export type ReedLabel = (typeof REED_LABEL_MAP)[ReedName];
