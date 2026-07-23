# Suggested commands

このメモリは用途別の入口だけを示します。Node・依存関係・各CLIのバージョンと
スクリプト定義は`package.json`と`package-lock.json`を正本としてください。

## セットアップ

- Node要件の確認: `package.json`の`engines`
- lockfileどおりの依存関係インストール: `npm ci`

## 開発/ビルド

- 開発サーバ: `npm run dev`（`--host` 渡し済み）
- ビルド: `npm run build`
- プレビュー: `npm run preview`

## 品質チェック

- まとめてチェック: `npm run check`（MarkuplintとBiome）
- Lint 単体: `npm run lint` / `npm run lint:fix`
- フォーマット単体: `npm run format` / `npm run format:fix`
- マークアップ単体: `npm run markup` / `npm run markup:fix`
- 自動修正はユーザーが修正を求めている場合だけ使い、先に変更しない検証を行う
- 選択基準と完了条件: `.cursor/rules/verification.mdc`

## テスト

- 非対話の一括実行: `npm run test:ci`
- 単発実行: `npm run test`
- 監視: `npm run test:watch`
