# kojoall仕様書の完全なまとめ（XSDベース実装）

## 概要

kojo-xml-viewerプロジェクトで使用するkojoallフォルダには、源泉徴収票等オンライン化に関する仕様書が含まれています。これらの仕様書は、日本の控除証明書データのXMLファイルを表示するために使用されます。

**実装方針**: XSDファイルのみを使用して実装します。CSVファイルへの依存はありません。

## 仕様書の構成

### 1. 源泉徴収票等オンライン化に関する仕様書.docx

**目的**: XML構造の基本仕様を定義（参考資料）

**主な内容**:
- XML構造の基本的事項
- XML構造の構成要素（XML宣言、スタイルシート宣言、様式ID要素、XML署名）
- 様式ID要素の属性（VR, id, page, sakuseiDay, sakuseiNM, softNM）
- XML署名の仕様（Enveloped署名）
- 名前空間（kyotsuがデフォルト名前空間）
- スタイルシートのURL形式: `https://xml.e-tax.nta.go.jp/xsl/1.0/ファイル名`

**XML構造の基本形式**:
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<?xml-stylesheet type="text/xsl" href="URL" ?>
<様式ID VR="バージョン" id="ID" page="ページ" sakuseiDay="作成日" sakuseiNM="作成者" softNM="ソフト名">
  （内容部分のXMLデータ）+
  <dsig:Signature xmlns:dsig="http://www.w3.org/2000/09/xmldsig#">
  </dsig:Signature>
</様式ID>
```

**実際に存在するTEGコード（13個）**:
- TEG104, TEG105, TEG106, TEG107, TEG108（給与所得の源泉徴収票）
- TEG800（生命保険料控除証明書）
- TEG810（地震保険料控除証明書）
- TEG820, TEG821, TEG822（寄附金受領証明書）
- TEG830（寄附金控除に関する証明書）
- TEG840（国民年金保険料等控除証明書）
- TEG850（小規模企業共済等掛金控除証明書）

### 2. 04XMLスキーマ/（実装に使用）

**目的**: XML構造を正式に定義するXSDファイル

**構造**:
- `general/`: 共通ボキャブラリのXSDファイル
  - `General.xsd`: 共通ボキャブラリの定義（name, address, yymmdd, kingaku, kubunなど）
  - `zeimusho.xsd`, `zeimoku.xsd`, `ITreference.xsd`: 補助的な定義
  - `XMLDSIG050.xsd`: XML署名の定義
- `kyotsu/`: 各TEGコードのXSDファイル
  - `TEG104-001.xsd` ～ `TEG850-001.xsd`: 13個のTEGコードのスキーマ定義

**XSDファイルから取得可能な情報**:
- **要素名**: `xsd:element/@name`
- **日本語名**: `xsd:element/xsd:annotation/xsd:appinfo`
- **データ型**: `xsd:element/@type`
- **出現回数**: `xsd:element/@minOccurs`, `xsd:element/@maxOccurs`
- **親子関係**: `xsd:complexType/xsd:sequence/xsd:element`
- **値の範囲**: `xsd:restriction/xsd:enumeration/@value`（区分型の場合）
- **文字数制限**: `xsd:restriction/xsd:maxLength/@value`
- **パターン**: `xsd:restriction/xsd:pattern/@value`
- **必須/任意**: `xsd:element/@minOccurs`（0で任意、1以上で必須）

**メタデータ**:
- 帳票名称: `xsd:documentation`内の「様式名：」から取得
- バージョン: `xsd:documentation`内の「version：」から取得
- TEGコード: ファイル名から取得（例: `TEG800-001.xsd` → `TEG800`）

**主要な共通ボキャブラリ型**:
- `gen:name`: 名前（string）
- `gen:address`: 住所（string）
- `gen:yymmdd`: 日付（complexType）- 年号、年、月、日の子要素を持つ
- `gen:kingaku`: 金額（complexType, long型）
- `gen:kubun`: 区分（complexType）- 区分コードと区分名の子要素を持つ
- `gen:tel-number`: 電話番号（complexType）
- `gen:zipcode`: 郵便番号（complexType）
- `gen:yyyy`: 年（complexType）
- `gen:mm`: 月（simpleType, nonNegativeInteger）
- `gen:dd`: 日（simpleType, nonNegativeInteger）

## 実装上の注意事項

### XSDパーサーの実装

- **標準的なXMLパーサーを使用**: `@xmldom/xmldom` + `xpath`など
- **名前空間の処理**: `http://www.w3.org/2001/XMLSchema`名前空間を使用
- **階層構造の再帰的処理**: `xsd:complexType/xsd:sequence`を再帰的に処理
- **型参照の解決**: `@type`属性で参照される型を解決（`gen:`プレフィックスは`general/General.xsd`を参照）

### 要素マッピングの生成

XSDから要素マッピングを生成する際の処理:

1. **ルート要素の取得**: `xsd:schema/xsd:element[@name]`からルート要素を取得
2. **階層構造の構築**: `xsd:complexType/xsd:sequence/xsd:element`を再帰的に処理
3. **日本語名の取得**: `xsd:appinfo`から取得（引用符を除去）
4. **出現回数の取得**: `@minOccurs`（デフォルト: 1）、`@maxOccurs`（デフォルト: 1、または"unbounded"）
5. **型情報の取得**: `@type`属性から取得（`gen:`プレフィックスは共通ボキャブラリ）
6. **値の範囲の取得**: `xsd:enumeration`がある場合は列挙値を取得

### ファイルパス

- Viteの開発サーバーでは、srcフォルダがルートになる
- XSDファイルのパス: `/kojo-xml-viewer/kojoall/04XMLスキーマ/kyotsu/{TEGコード}-001.xsd`
- 共通ボキャブラリのパス: `/kojo-xml-viewer/kojoall/04XMLスキーマ/general/General.xsd`

### XML構造の特徴

- **名前空間**: 
  - デフォルト名前空間：`http://xml.e-tax.nta.go.jp/XSD/kyotsu`
  - 一般名前空間：`http://xml.e-tax.nta.go.jp/XSD/general`（`gen:`プレフィックス）
  - XML署名名前空間：`http://www.w3.org/2000/09/xmldsig#`（`dsig:`プレフィックス）

- **日付要素**: 
  - `gen:yyyy`（年）、`gen:mm`（月）、`gen:dd`（日）として分割して格納
  - `combineDateValues`関数で結合して表示

- **XML署名**: 
  - Enveloped署名形式
  - ルート要素のid属性を参照URIとして使用

### XSDから取得できない情報（代替案）

1. **書式情報**（ゼロサプレス、カンマ編集など）
   - 代替: 型情報から推測するか、デフォルト書式を使用
   - 影響: 表示の見た目に影響するが、機能には影響しない

2. **項目（グループ）名**（カテゴリ分類）
   - 代替: 親要素の日本語名を使用するか、階層構造から推測
   - 影響: カテゴリ分類の精度が若干下がる可能性があるが、表示には問題ない

## 参考資料

- [電子的控除証明書等に係る仕様書一覧](https://www.e-tax.nta.go.jp/shiyo/shiyo-kojo3.htm)
- [控除申告書データに係る仕様書](https://www.nta.go.jp/users/gensen/oshirase/0019004-159.htm)
