// リードの種類定義
export type ReedName = "soprano" | "alto" | "tenor" | "bass";

// リードのラベル定義
export type ReedLabel = "S" | "A" | "T" | "B";

// リードの有効/無効状態
export type ReedStates = Record<ReedName, boolean>;

// 音の鳴り方の種類
export type StradellaSoundType = "chord" | "bassNote";

// ベース音のタイプ
export type StradellaType = "counter" | "fundamental" | "major" | "minor";

// ストラデラベースのリードの有効/無効状態
export type StradellaReedStates = {
  [key in StradellaSoundType]: ReedStates;
};

// レジスタースイッチのプリセット名
export type StradellaRegisterName =
  | "soprano"
  | "alto"
  | "tenor"
  | "softTenor"
  | "master"
  | "softBass"
  | "bass";

// リードのピッチ設定
export type ReedPitches = Record<ReedName, number>;
