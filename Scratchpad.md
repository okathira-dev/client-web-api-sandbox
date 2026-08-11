# Scratchpad

このファイルは短期の作業状態だけを記録する。仕様・解法・確認結果の正本は `src/busybox/docs/` と実装コードに置く。

## 現在のタスク

### 現行実装のコミット前整理

- [x] S-030-B02を削除し、Selection APIだけのB01へ整理
- [x] S-060-B02をオフラインかつService Worker制御下だけで成立するよう修正
- [x] S-150をキーボード操作ステージへ変更（pointer-inert button、typeahead select、details）
- [x] S-220の分岐ガイドを追加
- [x] S-510のB01/B02のドラッグ経路を分離・検証
- [x] S-580の認識言語をen-USへ固定
- [x] S-640を8問・共通回答欄に整理し、B05-B08の文字化けを差別化
- [x] S-660をステージ入場時の自動Compute Pressure観測へ変更
- [x] S-710を小文字flag、横並び変換UI、低ビットレート、jsQR＋四辺形差替えへ更新
- [x] S-810をMSEによるフレーム単位の可変寸法動画生成へ変更（Windows Chromeで4寸法の開箱を確認）
- [x] Aboutから同梱ライセンス本文へ導線を追加し、全ページのshell幅を拡張
- [x] S-710 decode失敗fixtureとS-720 WebM 9本を小文字flagの固定assetへ再生成（ローカルFFmpegを環境変数で注入）
- [ ] 旧仕様を参照する履歴ドキュメントを棚卸しし、現行結論への導線を整理
- [ ] stage-localizationへの文言切り出し
- [ ] 全stageの日本語・MECE JSDoc整備
- [x] `tsc` / Biome / Markuplint / Jest / build の最終実行
- [x] Windows ChromeでS-640/S-710/S-720/S-810の主要経路を確認
- [ ] 変更内容と残課題を確認後にコミット

## 正本への参照

- 現状・残問題・確認順: `src/busybox/docs/current-status-and-handoff.md`
- 現行解法: `src/busybox/docs/stage-walkthroughs.md`
- 実装状態: `src/busybox/docs/stage-implementation-status.md`
- 人手確認: `src/busybox/docs/human-test-matrix.md`
- 自動検証: `src/busybox/docs/verification-record.md`
