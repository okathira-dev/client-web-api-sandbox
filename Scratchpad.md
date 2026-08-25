# Scratchpad

このファイルは短期の作業状態だけを記録する。仕様・解法・確認結果の正本は `src/busybox/docs/` と実装コードに置く。

## 現在のタスク

### Busyboxステージ契約の完全移行

- [x] 一覧を3種類のプレイ条件の色・アイコンへ統一する
- [x] 完全修飾Box IDと旧helperを削除する
- [x] 個別ステージの実装・locale・テストを各フォルダへ集約する
- [x] 生成索引をbuild/CIへ接続し、固定件数テストを撤廃する
- [x] S-890 cleanupと進捗の既知ID集計を修正する
- [x] 文書を新契約へ更新し、検証を完了する

## 結果

- 一覧は Baseline直接・Baseline要権限・Limited の3分類を色で示す。進捗表示は分類と独立させた。
- `manifest.ts` が公開するのはステージ情報とローカル箱IDだけ。個別stage folderが箱の表示と解法を所有し、開いた時だけ読み込む。
- `npm run dev` / `build` はindexを生成し、`check` / `test` / `test:ci` は生成漏れを検出する。
- 型検査、Jest（57 suites / 311 tests）、Biome、Markuplint、Vite production build、生成index検査、`git diff --check`を通過した。
