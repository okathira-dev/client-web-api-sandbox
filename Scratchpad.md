# Scratchpad

このファイルは、タスクの計画と進捗状況を追跡するためのスクラッチパッドとして使用されます。
（`.cursor/rules/global.mdc`のルールに従って管理されています。長期的な教訓・方針はserenaメモリに保存します）

## 現在のタスク

### Busybox: Web API Explorer（計画フェーズ）

- [x] リポジトリ状態と並行worktreeを確認
- [x] 専用ブランチ `codex/busybox-web-api-game` を作成
- [x] 専用worktree `worktrees.local/busybox-web-api-game` を作成
- [x] プロダクト仕様とアーキテクチャ判断を文書化
- [x] API調査・採用方針を文書化
- [x] ギミックメモ台帳と人手確認台帳を作成
- [x] 権限・プライバシー方針と決定ログを作成
- [x] 文書間の整合性を確認
- [x] ステージ／問題箱モデルと初期ステージ候補を明文化
- [x] 添付企画書とDeep Researchメモを非規範資料として保存・照合
- [x] 過去のBusyboxブランチを整理し、現行ブランチへ一本化
- [x] 計画フェーズの成果をコミット対象として整理

このworktreeでは、既存のBusybox並行ブランチを変更しない。計画フェーズ完了後は、`src/busybox/docs/implementation-plan.md` のフェーズ順に実装する。

### Vite 8 移行時の warn/error 対応（進行中）

- [x] `@vitejs/plugin-react-swc` -> `@vitejs/plugin-react` へ移行
- [x] `build.rollupOptions` -> `build.rolldownOptions` へ移行
- [x] `kojo-xml-viewer` パーサーの `node:fs` / `node:url` 依存を除去
- [x] Jest で `file:` URL を扱う `fetch` セットアップを追加
- [x] `webcodecs-data-moshing` の Start 多重実行で起きる `DataCloneError` 対策
- [ ] `@okathira/ghostpdl-wasm` 起因の `module externalized` 警告の upstream 対応方針整理

## 進捗状況

- Busyboxは計画専用ブランチ上で、実装前の仕様・調査手順・QA台帳を作成中。
- Busybox本体コードはまだ追加していない。箱を中核にするモデルは確定し、最終アートと初期候補の採否はAPI再調査と試作後に決める。
- `npm run build` / `npm run test` は通過。
- Vite 8 関連で解消できたもの:
  - `vite:react-swc` の `esbuild` 非推奨警告
  - `node:fs` / `node:url` externalize 警告
  - `webcodecs-data-moshing` の `OffscreenCanvas detached` エラー（多重 start）
- 依存ライブラリ由来で残るもの:
  - `@okathira/ghostpdl-wasm/dist/gs.js` 由来の `module externalized` 警告
    - 現行最新 `1.1.0` でも再現
    - ブラウザ動作は `preview` で `http://localhost:4173/pdf-compressor-wasm/` の 200 応答を確認

## リポジトリ構造分析結果

- `src/kojo-xml-viewer`配下に仕様書・マッピング・UIが集約
- XML解析まわりは`utils`/`features/XmlViewer/components`内にコロケーション
- ルールファイル：`coding-rules.mdc`, `eslint.mdc`, `repository.mdc`

## メモと反省

- 過去のBusybox実装・計画ブランチは整理し、`codex/busybox-web-api-game` を唯一の作業線にした。
- 最初のworktreeは別ドライブに作成したため移動できなかった。未変更を確認して解除し、`.gitignore`対象の`worktrees.local`へ同じブランチを再配置した。
