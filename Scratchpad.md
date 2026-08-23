# Scratchpad

このファイルは短期の作業状態だけを記録する。仕様・解法・確認結果の正本は `src/busybox/docs/` と実装コードに置く。

## 現在のタスク

### BusyboxのMUIアイコン運用

- [x] `@mui/icons-material`のbarrel importを個別パスimportへ置換する
- [x] MUIの`fontSize="inherit"`で、箱ヒントのアイコン寸法を親要素の`3rem`へ統一する
- [x] アイコンを装飾として隠し、既存の問題名テキストを代替ラベルとして残す
- [x] 型検査、Biome、Markuplint、stage registry test、production build、実ブラウザ表示を確認する

## 結果

- 箱ヒントのMUI Outlinedアイコンは個別パスimportを使い、`48px`（`3rem`）で表示される。
- スクリーンリーダーにはSVGを隠し、対応する問題名のテキストを提供する。
