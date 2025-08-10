# コミットメッセージ方針（Conventional Commits + ラベルを説明前に付与）

- 目的: Conventional Commits の先頭構造は維持しつつ、説明文の先頭に `[Cursor]` などのラベルを挿入できるようにする
- 強制手段: commitlint により検証する。AIエージェントは必ず本方針を遵守すること

## ルール

- 形式: `type[optional scope]!: [Label] description`
  - `type`: `feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert`
  - `scope`: 任意（例: `ui`, `audio`, `lcg-predictor`）
  - `!`: 破壊的変更がある場合に付与
  - `[Label]`: 任意（例: `[Cursor]`, `[WIP]`）。説明文の先頭に置く
  - `description`: 簡潔な説明（日本語可）
- Body/Footers は任意。`BREAKING CHANGE:` で詳細説明可能
- PR タイトルも同様の形式を推奨

## 例

- `feat(ui): [Cursor] ボタンのアクセシビリティ改善`
- `fix(audio)!: [Cursor] レイテンシ計測の閾値を変更`
- `chore: [WIP] 依存関係の更新`
