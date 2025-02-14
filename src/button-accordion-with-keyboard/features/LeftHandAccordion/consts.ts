// リードとそのラベルの定義
export const REED_LABEL_MAP = {
  soprano: "Soprano",
  alto: "Alto",
  tenor: "Tenor",
  bass: "Bass",
} as const;

export type ReedName = keyof typeof REED_LABEL_MAP;
export type ReedLabel = (typeof REED_LABEL_MAP)[ReedName];
