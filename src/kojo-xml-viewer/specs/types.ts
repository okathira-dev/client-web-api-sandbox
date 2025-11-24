/**
 * 仕様書の型定義
 */

/**
 * XML構造設計書の型定義
 */
export interface XmlStructureItem {
  /** 項番 */
  index: number;
  /** レベル */
  level: number;
  /** 要素内容（レベル3-12） */
  elementContent: string[];
  /** 共通ボキャブラリまたはデータ型 */
  vocabularyOrDataType?: string;
  /** 最小出現回数 */
  minOccurrence?: number;
  /** 最大出現回数 */
  maxOccurrence?: number;
  /** ID属性 */
  idAttribute?: string;
  /** IDREF属性 */
  idrefAttribute?: string;
  /** その他の属性名 */
  otherAttributes?: string;
  /** タグ名（要素コード） */
  tagName: string;
  /** 順位 */
  order?: number;
  /** 備考 */
  notes?: string;
}

/**
 * XML構造設計書のメタデータ
 */
export interface XmlStructureMetadata {
  /** 帳票名称 */
  formName: string;
  /** 様式ID（TEGコード） */
  tegCode: string;
  /** 汎用化 */
  generalization?: string;
  /** 出現回数 */
  occurrence?: string;
  /** 属性 */
  attributes?: string;
  /** 名前空間 */
  namespace?: string;
  /** バージョン */
  version?: string;
}

/**
 * 帳票フィールド仕様書の型定義
 */
export interface FormFieldItem {
  /** 項番 */
  index: number;
  /** 入力型 */
  inputType: string;
  /** 帳票項番 */
  formIndex?: number;
  /** 項目（グループ）名 */
  groupName?: string;
  /** 項目名 */
  fieldName: string;
  /** 繰返し回数 */
  repeatCount?: number;
  /** 書式 */
  format?: string;
  /** 入力チェック */
  inputCheck?: string;
  /** 計算 */
  calculation?: string;
  /** 値の範囲 */
  valueRange?: string;
  /** 計算No */
  calculationNo?: string;
  /** 計算／備考 */
  calculationOrNotes?: string;
  /** XMLタグ（要素コード） */
  xmlTag: string;
  /** 順位 */
  order?: number;
  /** ID属性 */
  idAttribute?: string;
  /** IDREF属性 */
  idrefAttribute?: string;
}

/**
 * 帳票フィールド仕様書のメタデータ
 */
export interface FormFieldMetadata {
  /** 帳票名称 */
  formName: string;
  /** 汎用化 */
  generalization?: string;
  /** 様式ID（TEGコード） */
  tegCode: string;
  /** バージョン */
  version?: string;
}

/**
 * TEGコードごとの仕様書データ
 */
export interface TegSpecification {
  /** TEGコード */
  tegCode: string;
  /** XML構造設計書のメタデータ */
  xmlStructureMetadata: XmlStructureMetadata;
  /** XML構造設計書の項目 */
  xmlStructureItems: XmlStructureItem[];
  /** 帳票フィールド仕様書のメタデータ */
  formFieldMetadata: FormFieldMetadata;
  /** 帳票フィールド仕様書の項目 */
  formFieldItems: FormFieldItem[];
}

/**
 * 要素マッピング（拡張版）
 */
export interface ElementMapping {
  /** TEGコード */
  teg: string;
  /** 要素コード */
  elementCode: string;
  /** 項目名（日本語） */
  label: string;
  /** カテゴリ */
  category?: string;
  /** 入力型 */
  inputType?: string;
  /** 書式 */
  format?: string;
  /** 値の範囲 */
  valueRange?: string;
  /** レベル */
  level?: number;
  /** 親要素コード */
  parentElementCode?: string;
  /** 共通ボキャブラリまたはデータ型 */
  vocabularyOrDataType?: string;
  /** 繰返し回数 */
  repeatCount?: number;
}
