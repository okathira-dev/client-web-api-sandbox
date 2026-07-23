# Scratchpad

このファイルは、タスクの計画と進捗状況を追跡するためのスクラッチパッドとして使用されます。
（使用条件は`.cursor/rules/global.mdc`、完了条件は`.cursor/rules/verification.mdc`に従います）

## 現在のタスク

### AIエージェント設定の最適化

- [x] Serena memoriesと現在の正本との差異を確認
- [x] 古いツール・バージョン・検証手順を正本参照へ整理
- [x] Cursor/Codex共通の検証・完了条件ルールを追加
- [x] ScratchpadとSerena memoryの利用範囲を限定
- [x] 参照切れ、矛盾、形式、Git差分を最終検証

## 進捗状況

- 依存関係とコマンドは`package.json`、品質設定は`biome.json`を正本とする。
- memoriesには長期間変わりにくい知識と正本への参照だけを残す。
- 変更しない検証を先に行い、自動修正は依頼範囲内だけで使う。
- 7個のCursor ruleのfrontmatter、ローカル参照、npm script参照、廃止済み設定の不在、Git差分検査を確認した。

## リポジトリ構造分析結果

- 共通方針は`.cursor/rules/`を正本とし、`AGENTS.md`はCodex向け索引だけを持つ。
- `verification.mdc`をCursorの自動適用対象かつCodexの明示索引として共有する。

## メモと反省

- バージョンやコマンドをmemoryへ複製すると正本とのドリフトが起きるため、参照へ置き換える。
