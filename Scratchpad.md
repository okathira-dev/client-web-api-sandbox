# Scratchpad

このファイルは短期の作業状態だけを記録する。仕様・解法・確認結果の正本は `src/busybox/docs/` と実装コードに置く。

## 現在のタスク

### 固定media asset化と最新版PoC整理

- [x] localeは全面lazy化せず、全ステージ名・箱名を初期表示できるeager metadata registryを維持する判断を確定
- [x] S-810の120フレーム可変寸法VP8 segmentを事前生成し、`resolution-sweep.pack` とmanifestをGit管理
- [x] S-810実行時MediaBunnyエンコードを削除し、固定packをfetchしてMSEへ追加する経路へ置換
- [x] S-810固定assetの意味検証testを追加
- [x] POCページから却下済みS-270/POC-005、S-680/POC-017、S-350旧POC-006、S-430旧POC-007を削除
- [x] `poc-latest.md`へ現行PoCの最新版索引と旧PoCの削除境界を整理
- [x] 現行引継ぎ・ステージ状況・検証記録のS-810記載を固定asset経路へ更新
- [x] nvs defaultのNode 24.14.0で`npm run check`（Biomeを含む）と`npm run build`を実行
- [x] `npm run test:ci`を全件再実行（47 suites / 288 tests）
- [ ] Windows ChromeでS-810のpack読み込み、4寸法、再試行、離脱cleanupを確認
- [ ] PoCページで最新版項目だけが表示され、削除済み候補が見えないことを確認
- [x] 差分・絶対パス・生成途中ファイル・asset manifestを監査（絶対パス混入なし、manifest/packの意味検証済み）

## 正本への参照

- 最新PoC索引: `src/busybox/docs/poc-latest.md`
- 現状・残問題・確認順: `src/busybox/docs/current-status-and-handoff.md`
- 現行解法: 各`S-xxx.tsx`のdefault component直前にある日本語JSDoc
- 実装状態: `src/busybox/docs/stage-implementation-status.md`
- 人手確認: `src/busybox/docs/human-test-matrix.md`
- 自動検証: `src/busybox/docs/verification-record.md`
