# Scratchpad

このファイルは、タスクの計画と進捗状況を追跡するためのスクラッチパッドとして使用されます。
（`.cursor/rules/global.mdc`のルールに従って管理されています。長期的な教訓・方針はserenaメモリに保存します）

## 現在のタスク

pdf-compressor-wasm プロジェクトのドキュメント整備とUIの最終仕上げ

- [X] 他プロジェクトのREADMEフォーマット確認
- [X] SocialIconsコンポーネントの確認
- [X] pdf-compressor-wasmのREADME更新
- [X] App.tsxにSocialIconsコンポーネント追加
- [X] Scratchpad更新

## 進捗状況

### PDF Compressor WASM プロジェクト

- [X] リポジトリ構造の確認
- [X] 各ルールファイルの内容確認
- [X] ルール間の整合性分析
- [X] Scratchpad情報の更新
- [X] global.mdcとScratchpad.mdの関係明確化
- [X] global.mdcファイルの日本語化
- [X] global.mdcのコマンド例の文字列を原文に修正
- [X] README.mdの更新（開発サポートファイルとルールファイルの情報追加）
- [X] repository.mdcの更新（ルールとサポートファイルの情報追加）
- [X] ps-wasm/ブログ事例の一次調査メモ作成
- [X] `src/pdf-compressor-wasm/` 追加（MVP UI・Workerスタブ・リンク追記）
- [X] Serenaメモリに要件・設計を保存（PDF Compressor – Requirements & Design）
- [X] Ghostscript WASMビルドスクリプト作成と実装
- [X] Worker実装（gsWorker.ts / gsRunner.ts）
- [X] 完全な機能実装（GUI、詳細設定、カスタムコマンドモード）
- [X] README.mdの充実（使い方、技術スタック、トラブルシューティング等）
- [X] SocialIconsコンポーネントの追加
- [X] プロジェクト完成とドキュメント整備

## リポジトリ構造分析結果

- リポジトリは様々なWeb APIを使ったサンドボックスプロジェクトの集合体
- 主要プロジェクト：クロマティックボタンアコーディオン、データモッシング、線形合同法乱数予測ツールなど
- ルールファイル構成：
  - `global.mdc`: リポジトリ全体に適用されるツール・レッスン・スクラッチパッド使用法
  - `repository.mdc`: リポジトリ概要とプロジェクト一覧
  - `coding-rules.mdc`: 基本的なコーディングルールとディレクトリ構造
  - `eslint.mdc`: ESLint設定に関するルール
  - プロジェクト固有のルール（`button-accordion-with-keyboard.mdc`と`stradella-bass-system.mdc`）

## メモと反省

- リポジトリ内の個別プロジェクトは独立しているが、共通のコーディングルールで統一されている
- ルールファイルは適切に整理・構造化されている
- ルールの分割と再構成により、責任範囲がより明確になった
- 日本語化によりグローバルルールの一貫性が向上した
- コマンド例やプロンプトなどの技術的な文字列は原文のままにすることで正確性を確保
- ドキュメントとルールファイルの相互参照により、プロジェクト全体の把握がしやすくなった
