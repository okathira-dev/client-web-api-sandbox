# Suggested commands

## セットアップ
- Node を 22.12.0 以上に更新
- 依存関係インストール: `npm i`（`prepare` で husky セットアップ）

## 開発/ビルド
- 開発サーバ: `npm run dev`（`--host` 渡し済み）
- ビルド: `npm run build`
- プレビュー: `npm run preview`

## 品質チェック
- まとめてチェック: `npm run check`（markuplint, eslint, prettier --check）
- 自動修正つき: `npm run check:fix`
- Lint 単体: `npm run lint` / `npm run lint:fix`
- フォーマット単体: `npm run format` / `npm run format:fix`
- マークアップ単体: `npm run markup` / `npm run markup:fix`

## テスト
- 実行: `npm run test`
- 監視: `npm run test:watch`

## PowerShell（Windows）ユーティリティ
- ディレクトリ一覧: `ls`（`Get-ChildItem`）
- 中身表示: `cat <path>`（`Get-Content`）
- 文字検索: `Select-String -Path <glob> -Pattern <regex>`
- 移動: `cd <path>`

## Git（例）
- 状態確認: `git status`
- 追加: `git add -p`
- コミット: `git commit -m "[Cursor] <message>"`
- ブランチ作成: `git switch -c <branch>`
- プッシュ: `git push -u origin <branch>`