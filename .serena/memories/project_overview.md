# プロジェクト概要

このリポジトリは、さまざまな Web API を試すマルチページのサンドボックスです。Vite のマルチエントリで `src/index.html` から各プロジェクトに遷移できます。

- 主要目的: Web API・オーディオ・WebCodecs・数理系などの PoC/小アプリの集合
- 実行方法: `npm run dev` で開発サーバ、`npm run build` でビルド、`npm run preview` でビルド成果物をローカル確認
- 必要環境: Node >= 22.12.0、Windows（PowerShell 7）

## サブプロジェクト一覧（抜粋）

- `src/button-accordion-with-keyboard`: クロマティックボタンアコーディオン演奏アプリ（React + jotai + Tone.js）
- `src/webcodecs-data-moshing`: WebCodecs を用いたデータモッシング PoC（Vanilla）
- `src/webcodecs-data-moshing-react`: 同 React 実装（WIP）
- `src/lcg-predictor`: 線形合同法乱数予測ツール（テストあり）
- `src/computation-of-tears`: Three.js を用いたジェネラティブ表現（Orthographic）
- `src/pdf-compressor-wasm`: Ghostscript WASM による PDF 圧縮の設計・技術調査
- `src/shared`: 共有 UI/HTML コンポーネント

## エントリポイント

Vite の `rollupOptions.input` で複数 HTML を指定。

- `src/index.html`（リンク集）
- `src/*/index.html` 各プロジェクトの入口

## リポジトリドキュメント

- `README.md`: 目次・各プロジェクト説明
- `Scratchpad.md`: タスク・進捗の管理
- `Lessons.md`: 再利用可能な知見・教訓の蓄積
- `.cursor/rules/*.mdc`: ルール（repository/coding-rules/eslint 等）
