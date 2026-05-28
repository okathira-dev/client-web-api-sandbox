# Scratchpad

このファイルは、タスクの計画と進捗状況を追跡するためのスクラッチパッドとして使用されます。
（`.cursor/rules/global.mdc`のルールに従って管理されています。長期的な教訓・方針はserenaメモリに保存します）

## 現在のタスク

### Math.random 推測アプリ — アルゴリズム調査・実装計画ドキュメント

- [x] 既存 README / SPEC / IMPLEMENTATION_NOTES を再確認
- [x] `ALGORITHM_SURVEY.md` に Node.js / Chrome / Edge / Firefox / Safari の `Math.random()` 実装史を整理
- [x] `IMPLEMENTATION_PLAN.md` に後続実装ロードマップ、TDD 方針、Z3 方針、exact モデル方針を整理
- [x] 既存ドキュメントとのリンク・表現の整合性を確認

今回の範囲: Markdown ドキュメント制作のみ。アプリ実装、依存追加、Vite 登録、solver 実装、UI 実装は行わない。

## 進捗状況

- 新規: `src/math-random-predictor/ALGORITHM_SURVEY.md`, `IMPLEMENTATION_PLAN.md`
- 更新: `README.md`, `IMPLEMENTATION_NOTES.md` に新規ドキュメントへの導線を追加
- 検証: `npm run check` 成功、ReadLints で対象ファイルのエラーなし

## メモと反省

- V8 は時期・経路によって出力変換や cache/LIFO の扱いが変わるため、差分は別アルゴリズム ID として扱う
- 調査で確証が弱いバージョン範囲は「未確認」と明記し、推測で exact モデルを固定しない
