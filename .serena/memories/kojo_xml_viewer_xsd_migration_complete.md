# kojo-xml-viewer: XSDベース実装への移行完了

## 概要

XML簡易帳票機能をCSVベースからXSDベースの実装に完全移行しました。CSVベースの実装はすべて削除され、XSDファイルから直接要素マッピングを生成する方式になりました。

## 実装完了日

2025年11月24日

## 動作確認済みTEGコード

- **TEG800**: 生命保険料控除証明書
  - サンプルファイル: `TEG800_生命保険料控除証明書_202511月.xml`
- **TEG840**: 社会保険料控除証明書
  - [マイナポータル連携API](https://www.nta.go.jp/taxes/tetsuzuki/mynumberinfo/mnp_question/kaikei_question/api/about.htm)のサンプルデータで動作確認済み

## 削除されたファイル

以下のCSVパーサーファイルは削除されました：

- `specs/parsers/csvParser.ts`
- `specs/parsers/vocabularyParser.ts`
- `specs/parsers/xmlStructureParser.ts`
- `specs/parsers/formFieldsParser.ts`

## 削除された型定義

- `VocabularyItem`インターフェース（`specs/types.ts`から削除）

## 削除された関数

`specs/loadSpecs.ts`から以下の関数を削除：

- `loadCsvFile`
- `loadVocabulary`
- `loadXmlStructure`（CSVベース）
- `loadFormFields`（CSVベース）
- `loadTegSpecification`（CSVベース）

## 新規追加されたファイル

- `specs/parsers/xsdParser.ts`: XSDパーサーの実装
- `specs/parsers/xsdParser.test.ts`: XSDパーサーのテスト
- `mappings/elementMappingFromXsd.ts`: XSDベースの要素マッピング生成
- `mappings/elementMappingFromXsd.test.ts`: 要素マッピング生成のテスト

## 更新されたファイル

- `specs/loadSpecs.ts`: XSDベースの`loadTegSpecificationFromXsd`関数を追加
- `features/XmlViewer/components/FormRenderer.tsx`: XSDベースの読み込みに変更
- `README.md`: 機能説明と免責事項を追加

## 免責事項

本ツールは以下の点について注意が必要です：

1. **署名の検証**: XMLファイルのデジタル署名（XML Signature）の検証を行いません
2. **簡易帳票のフォーマット**: 表示される帳票フォーマットは本ツール独自のものです
3. **内容の保証**: XMLファイルの内容について一切の保証をいたしません
4. **ソースコードの公開**: ソースコードは公開されており、使用は自己責任です

## 技術スタック

- `@xmldom/xmldom`: XSDファイルのパース
- `xpath`: XPathクエリでXSD要素を取得
- `fast-xml-parser`: XMLファイルのパース（XML閲覧タブ用）

## 参考資料

- [電子的控除証明書等に係る仕様書一覧](https://www.e-tax.nta.go.jp/shiyo/shiyo-kojo3.htm)
- [控除申告書データに係る仕様書](https://www.nta.go.jp/users/gensen/oshirase/0019004-159.htm)
- [マイナポータル連携APIについて](https://www.nta.go.jp/taxes/tetsuzuki/mynumberinfo/mnp_question/kaikei_question/api/about.htm)
