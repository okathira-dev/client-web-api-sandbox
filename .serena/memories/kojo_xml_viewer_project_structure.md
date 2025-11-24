# kojo-xml-viewer プロジェクト構造と実装

## プロジェクト概要

控除証明書XML閲覧ツールは、日本の控除証明書データのXMLファイルを閲覧する読み取り専用のウェブアプリケーションです。

### 技術スタック

- React 18.2.0
- TypeScript 5.7.3
- MUI 6.4.5
- fast-xml-parser（XMLパース）
- @xmldom/xmldom + xpath（XSDパース）
- Vite（ビルドツール）

### 主要機能

1. XMLファイルのアップロード（ドラッグ&ドロップ対応）
2. XML構造のツリービュー表示（XML閲覧タブ）
3. XSDベースの簡易帳票表示（XML簡易帳票タブ）
   - XSDスキーマから自動的に要素マッピングを生成
   - 日本語項目名での表示
   - カテゴリ別のグループ化
   - 階層構造の保持
4. 要素の展開/折りたたみ
5. 属性値の表示
6. テキストノードの表示

### 対応TEGコード

- TEG800: 生命保険料控除証明書（動作確認済み）
- TEG840: 社会保険料控除証明書（動作確認済み）
- その他のTEGコード（XSDファイルが存在する場合）

### 免責事項

**重要**: 本ツールは以下の点についてご注意ください。

1. **署名の検証**: 本ツールはXMLファイルのデジタル署名（XML Signature）の検証を行いません
2. **簡易帳票のフォーマット**: 「XML簡易帳票」タブで表示される帳票フォーマットは、本ツール独自のものです
3. **内容の保証**: 本ツールはXMLファイルの内容について一切の保証をいたしません
4. **ソースコードの公開**: 本ツールのソースコードは公開されており、使用は自己責任です

## プロジェクト構造

```
kojo-xml-viewer/
├── App.tsx                    # メインアプリケーションコンポーネント
├── main.tsx                   # エントリーポイント
├── index.html                 # HTMLテンプレート
├── README.md                  # プロジェクト説明
├── features/
│   └── XmlViewer/
│       ├── XmlViewer.tsx     # XML閲覧コンポーネント
│       └── components/
│           ├── FileUploader.tsx           # ファイルアップロード
│           ├── FormRenderer.tsx          # 帳票形式レンダラー
│           ├── CertificateForm.tsx        # 控除証明書フォーム（未使用？）
│           ├── formDataBuilder.ts         # フォームデータ構築ロジック
│           ├── formDataBuilder.test.ts    # フォームデータビルダーのテスト
│           └── extractElementValues.test.ts # 要素値抽出のテスト
├── utils/
│   ├── xmlParser.ts          # XMLパーサー（fast-xml-parser使用）
│   └── xmlParser.test.ts     # XMLパーサーのテスト
├── types/
│   └── xml.ts                # XML関連の型定義
├── specs/
│   ├── types.ts              # 仕様書の型定義
│   ├── loadSpecs.ts          # 仕様書XSDの読み込み
│   ├── getAvailableTegCodes.ts # 利用可能なTEGコード一覧
│   └── parsers/
│       └── xsdParser.ts      # XSDパーサー（@xmldom/xmldom + xpath使用）
├── mappings/
│   └── elementMapping.ts     # 要素マッピング生成ロジック（XSDから生成）
├── consts/
│   └── elementMapping.ts     # 要素マッピング定数（未使用？）
├── sample/
│   └── 生命保険料控除証明書_202511月.xml  # サンプルXMLファイル
└── kojoall/                  # 仕様書ファイル群
    ├── 01電子的控除証明書等/              # 仕様書ドキュメント（参考用）
    │   └── 源泉徴収票等オンライン化に関する仕様書.docx
    └── 04XMLスキーマ/                    # XSDファイル（実装に使用）
        ├── general/                      # 共通ボキャブラリ
        │   ├── General.xsd
        │   ├── zeimusho.xsd
        │   ├── zeimoku.xsd
        │   ├── ITreference.xsd
        │   └── XMLDSIG050.xsd
        └── kyotsu/                       # 各TEGコードのスキーマ
            ├── TEG104-001.xsd
            ├── TEG105-001.xsd
            ├── TEG106-001.xsd
            ├── TEG107-001.xsd
            ├── TEG108-001.xsd
            ├── TEG800-001.xsd
            ├── TEG810-001.xsd
            ├── TEG820-001.xsd
            ├── TEG821-001.xsd
            ├── TEG822-001.xsd
            ├── TEG830-001.xsd
            ├── TEG840-001.xsd
            └── TEG850-001.xsd
```

## 主要コンポーネントと機能

### XmlViewer

- XMLファイルのアップロードとパース
- 2つのタブ表示：
  1. XML閲覧タブ：react-xml-viewerを使用したXML構造表示
  2. XML簡易帳票タブ：XSDベースの帳票形式表示

### FormRenderer

- XSDファイルから要素マッピングを生成
- XMLノードをフォームデータに変換
- ツリービュー形式で帳票を表示

### formDataBuilder

- `extractElementValues`: XMLノードから要素値を抽出
- `combineDateValues`: 日付要素（gen:yyyy, gen:mm, gen:dd）を結合
- `buildFormData`: XMLノードをFormDataItem配列に変換
- `buildFormTree`: FormDataItem配列をツリー構造に変換

### xmlParser

- fast-xml-parserを使用してXML文字列をパース
- XML宣言、スタイルシート宣言、ルート要素属性、XML署名を抽出
- XmlNode構造に変換

### xsdParser（新規実装）

- @xmldom/xmldom + xpathを使用してXSDファイルをパース
- 要素名、日本語名、型、出現回数、親子関係を抽出
- 階層構造を再帰的に処理

## 仕様書の読み込み

仕様書はXSDファイルとして`kojoall/04XMLスキーマ/`ディレクトリに配置されています：

- 共通ボキャブラリ（`general/General.xsd`）
- 各TEGコードのスキーマ（`kyotsu/TEG*.xsd`）

対応TEGコード：

- TEG104, TEG105, TEG106, TEG107, TEG108
- TEG800, TEG810, TEG820, TEG821, TEG822, TEG830, TEG840, TEG850

## テストデータ

### サンプルファイル

- `sample/生命保険料控除証明書_202511月.xml`：テスト用のサンプルXMLファイル
- すべてのテストはこのサンプルファイルを使用して実装されています

## XML構造の特徴

### 名前空間

- デフォルト名前空間：`http://xml.e-tax.nta.go.jp/XSD/kyotsu`
- 一般名前空間：`http://xml.e-tax.nta.go.jp/XSD/general`（`gen:`プレフィックス）
- XML署名名前空間：`http://www.w3.org/2000/09/xmldsig#`（`dsig:`プレフィックス）

### 日付要素

- `gen:yyyy`（年）、`gen:mm`（月）、`gen:dd`（日）として分割して格納
- `combineDateValues`関数で結合して表示

### XML署名

- Enveloped署名形式
- ルート要素のid属性を参照URIとして使用
