# Scratchpad

このファイルは、タスクの計画と進捗状況を追跡するためのスクラッチパッドとして使用されます。
（`.cursor/rules/global.mdc`のルールに従って管理されています。長期的な教訓・方針はserenaメモリに保存します）

## 現在のタスク

### Math.random 推測アプリ — 仕様ドキュメント（更新済）

- [x] 推論 / デモの 2 モード、系列種別は単一選択
- [x] 絞り込み状況パネル（観測の追加・編集・削除でリアルタイム、理論近似あり）
- [x] 利用アルゴリズムはモデル一覧から選択（V8 は Node/Chromium が同一なら統合）
- [x] デモで `Math.random()` 生成 + 推論アルゴリズム別指定
- [x] 完全特定は内部状態候補 1 通りと定義
- [x] Z3 / SharedArrayBuffer / GitHub Pages 制約を実装メモへ整理
- [x] 初版は厳密観測値のみ（10進入力は JS Number の round-trip 前提）
- [x] モデルは参照実装に基づく exact モデルとして扱う
- [x] TDD で core / solver adapter から実装する方針を実装メモへ整理

次のステップ（未着手）: UI・アルゴリズム実装、ルート README 追記、Vite エントリ

## 進捗状況

- 新規: `src/math-random-predictor/README.md`, `SPEC.md`, `IMPLEMENTATION_NOTES.md`

## メモと反省

- 製品仕様は開発詳細より UX・入出力・信頼度表示を優先して記述した
- 実ブラウザ検証は「生成（実装）」と「想定モデル（推測）」の二層を SPEC で明示
