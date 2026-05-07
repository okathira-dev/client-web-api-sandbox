# Scratchpad

このファイルは、タスクの計画と進捗状況を追跡するためのスクラッチパッドとして使用されます。
（`.cursor/rules/global.mdc`のルールに従って管理されています。長期的な教訓・方針はserenaメモリに保存します）

## 現在のタスク

### Vite 8 移行時の warn/error 対応（進行中）

- [x] `@vitejs/plugin-react-swc` -> `@vitejs/plugin-react` へ移行
- [x] `build.rollupOptions` -> `build.rolldownOptions` へ移行
- [x] `kojo-xml-viewer` パーサーの `node:fs` / `node:url` 依存を除去
- [x] Jest で `file:` URL を扱う `fetch` セットアップを追加
- [x] `webcodecs-data-moshing` の Start 多重実行で起きる `DataCloneError` 対策
- [ ] `@okathira/ghostpdl-wasm` 起因の `module externalized` 警告の upstream 対応方針整理

## 進捗状況

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
