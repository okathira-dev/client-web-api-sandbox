# Web API を使った遊び場

## start dev

```bash
npm run dev
```

## `package.json` の `overrides`（`fast-xml-parser`）

[`react-xml-viewer`](https://www.npmjs.com/package/react-xml-viewer) は自身の依存として **古い `fast-xml-parser`**（例: 5.4.x）を指定している一方、本リポジトリでは [`kojo-xml-viewer`](./src/kojo-xml-viewer) の自前パース用にルートで **`fast-xml-parser@^5.5.9`** を直接依存している。

[`overrides`](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#overrides) で `react-xml-viewer` 配下に入る `fast-xml-parser` の解決を **5.5.9 に固定**し、ツリー内の二重バージョンと `npm audit` 上の扱いをルートの直接依存と揃えている。`overrides` を外す・バージョンを変える場合は `package-lock.json` と監査結果を確認すること。

## プロジェクトフォルダ

### [./src/shared](./src/shared)

共有コンポーネント

### [./src/index.html](./src/index.html)

以下のページの目次となるページ

### [./src/button-accordion-with-keyboard](./src/button-accordion-with-keyboard)

クロマティックボタンアコーディオンを演奏できるウェブアプリ

### [./src/webcodecs-data-moshing](./src/webcodecs-data-moshing)

データモッシング PoC

### [./src/webcodecs-data-moshing-react](./src/webcodecs-data-moshing-react)

**WIP** データモッシング React App

### [./src/lcg-predictor](./src/lcg-predictor)

線形合同法乱数予測ツール

### [./src/computation-of-tears](./src/computation-of-tears)

**WIP** [Tears of Overflowed Bits (by eau. / La Mer ArtWorks)](https://www.youtube.com/watch?v=LRXLwrTHqmY)の再現

### [./src/pdf-compressor-wasm](./src/pdf-compressor-wasm)

完全クライアントサイドでPDFを圧縮するWebアプリケーション（Ghostscript WASM使用）

### [./src/kojo-xml-viewer](./src/kojo-xml-viewer)

日本の控除証明書データのXMLファイルを閲覧する読み取り専用のウェブアプリケーション

## 開発サポートファイル

### [./Scratchpad.md](./Scratchpad.md)

タスクの計画と進捗状況を追跡するためのスクラッチパッド

### Serena memories（.serena/memories/*.md）

プロジェクト内で学んだ教訓や再利用可能な知識は Serena のメモリとして管理します。

## ルールファイル

.cursor/rulesディレクトリには以下のルールファイルがあります。ここではすべてのプロジェクトに関するもののみを記載しています。

- **global.mdc**: リポジトリ全体に適用されるルール（Scratchpadの使用方法など）
- **repository.mdc**: リポジトリ構造とプロジェクト概要
- **coding-rules.mdc**: コーディングルールとディレクトリ構造
- **eslint.mdc**: ESLint設定に関するルール
