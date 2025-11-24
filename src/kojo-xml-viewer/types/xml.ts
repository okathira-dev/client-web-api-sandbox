// XMLノードの型定義
export interface XmlNode {
  name: string;
  attributes?: Record<string, string>;
  children?: XmlNode[];
  text?: string;
}

// XML宣言の情報
export interface XmlDeclaration {
  version?: string;
  encoding?: string;
}

// スタイルシート宣言の情報
export interface StylesheetDeclaration {
  type?: string;
  href?: string;
}

// 様式ID要素の属性（仕様書に基づく）
export interface TegElementAttributes {
  /** バージョン（VR）: XML構造設計書の様式のメジャーバージョン、マイナーバージョン。初期値は「1.0」 */
  VR?: string;
  /** ID: 帳票個別部分を一意に特定するためのID */
  id?: string;
  /** ページ（page）: 次葉または手続内複数帳票に対応。様式ID単位に「1」から付番 */
  page?: string;
  /** 作成日（sakuseiDay）: 作成日を「CCYY-MM-DD」の形式で持つ */
  sakuseiDay?: string;
  /** 作成者（sakuseiNM）: 作成者の名前 */
  sakuseiNM?: string;
  /** ソフト名（softNM）: 作成ソフト名 */
  softNM?: string;
}

// XML署名の情報
export interface XmlSignature {
  /** 署名が存在するか */
  exists: boolean;
  /** 署名要素のノード */
  signatureNode?: XmlNode;
  /** 参照URI（ReferenceタグのURI属性値） */
  referenceUri?: string;
}

// XMLパース結果の型定義
export interface ParsedXml {
  root: XmlNode;
  isValid: boolean;
  error?: string;
  /** XML宣言の情報 */
  xmlDeclaration?: XmlDeclaration;
  /** スタイルシート宣言の情報 */
  stylesheetDeclaration?: StylesheetDeclaration;
  /** ルート要素（様式ID要素）の属性 */
  rootAttributes?: TegElementAttributes;
  /** XML署名の情報 */
  signature?: XmlSignature;
}
