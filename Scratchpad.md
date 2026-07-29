# Scratchpad

このファイルは、タスクの計画と進捗状況を追跡するためのスクラッチパッドとして使用されます。
（使用条件は`.cursor/rules/global.mdc`、完了条件は`.cursor/rules/verification.mdc`に従います）

## 現在のタスク

### encoder-capability-inspector の新規追加

- [x] 現行Serenaのスキーマへ`.serena/project.yml`を更新（`languages:` → `language_servers:`）
- [x] 依存追加（mediabunny / @tanstack/react-virtual）とViteエントリ追加
- [x] `consts` / `domain` / `utils` と単体テスト（59件）
- [x] 検査ワーカー（エンコード・デコード・多重化）
- [x] UI（実行制御・進行表示・仮想化テーブル・Sustained test）
- [x] ドキュメント更新と検証

## 進捗状況

- 全484候補（映像462 + 音声22）の包括検査がブラウザーで完走することを確認した。
- キャンセル → 再開 → Reset、絞り込み、Sustained test（合成入力）、リロード後の復元を確認した。
- ライブ入力（`getDisplayMedia`）のSustained testは画面共有の許可が要るため未検証。

## メモと反省

- Serenaは起動のたびに`.serena/project.yml`を再保存するため、旧スキーマのままだと
  未コミット差分が出続ける。設定キーのリネームに追従してコミットしておく。
- 484候補ぶんのレポートを候補ごとに永続化するとシリアライズで詰まる。
  実行中はメモリに置き、終端状態でだけ保存する。
- 進行中のステージ更新で結果配列の参照を差し替えないことが、一覧の再描画を防ぐ鍵になる。
