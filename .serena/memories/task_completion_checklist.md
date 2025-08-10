# Task completion checklist

1. ルール遵守（AIエージェント必須）
   - `coding-rules.mdc` と `eslint.mdc` に沿って構造・命名・import を整理
   - jotai の import は atom ファイルのみに限定
   - コミットメッセージは `type(scope)!: [Label] description` 形式（例: `feat(ui): [Cursor] ...`）
2. 品質確認
   - `npm run check:fix`
   - `npm run test`
3. 動作確認
   - `npm run build` → `npm run preview` で対象ページを実機確認
4. ドキュメント
   - 該当プロジェクトの `README.md` 更新
   - `Scratchpad.md` のタスク/進捗を更新
5. Git/PR
   - 必要に応じて `[Cursor]` 等のラベルを説明文の先頭に付与
   - 適切なブランチ運用（`git switch -c <topic>` → PR）
6. Serena/その他
   - `.serena/cache/*.pkl` は Git 管理しない（`.serena/project.yml` は管理）
   - 新規ページ追加時は `vite.config.ts` の `rollupOptions.input` を更新