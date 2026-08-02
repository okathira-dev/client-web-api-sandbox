# Scratchpad

このファイルは、タスクの計画と進捗状況を追跡するためのスクラッチパッドとして使用されます。
（使用条件は`.cursor/rules/global.mdc`、完了条件は`.cursor/rules/verification.mdc`に従います）

## 現在のタスク

### encoder-capability-inspector のレビュー指摘対応 — 完了

用語は「一括実用検査 (Full capability inspection)」「実用継続検査 (Sustained load test)」に統一。
`REPORT_VERSION` は 3（合成パターンと計測の意味が変わったため、過去のレポートは無効）。

- [x] 合成パターンを2系統に分離し、APNG/PNG/WAV で書き出して git 管理 `ef6a5ff`
- [x] アプリ内プレビュー（既定は折りたたみ。畳んでいるあいだは中身を外す）`ef6a5ff` `70e814f`
- [x] 中断して再開したときの経過時間と残り見込みの修正 `82c7c32`
- [x] キャプチャ入力での音声候補の検査（モノラルに落ちる問題への対処を含む）`82c7c32`
- [x] 結果一覧の表示（詳細の2行化・映像音声の判別・ソートアイコン・no-preference推定・experimental）`43e65df` `85b4ac4`
- [x] 検査の呼び名の統一・中断文言・実用継続検査の時間上限撤廃とメモリ見積り `70e814f`
- [x] ファミリー要約への音声追加・experimental の分母切り替え・JSON書き出し・参考文献 `84e3474`

## 進捗状況

- 検証: `npm run test:ci` 487件通過 / `npm run check` / `npm run build` すべて通過。
- 実機（Windows + Chromium + NVIDIA）で全484候補を完走し、表示・集計・書き出しを確認した。
- 未検証: ライブキャプチャの実行経路（画面共有の許可が要る）。音声2ch @ 48kHz で取得できることは利用者が確認済み。
- 未検証: 合成パターンのアニメーション再生は利用者が確認済み。

## メモと反省

- 一括検査の合成映像は index 0 を1回描くだけで2フレーム目が完全な複製になるが、それでよい。
  一括検査は全484設定を短時間で1周するものなので、入力生成は軽いままにする。
  動きと圧縮耐性が要るのは実用継続検査のほう。合成パターンは2系統に分ける。
- Node 24 に WebCodecs は無く、mediabunny のエンコードもWebCodecs前提。
  サンプル出力は `node:zlib` だけで書ける APNG/PNG/WAV に寄せ、ffmpegにも追加依存にも頼らない。
  `--check` は生データのハッシュだけを見る。Canvas 側と Node 側の描画がバイト単位で一致することは確認済み。
- MUI の `Box component="canvas"` は width/height をスタイルとして解釈するため、描画バッファの
  大きさを決める HTML 属性が渡らない。素の canvas を `styled` で包む。
- MUI の `TableSortLabel` は `flex-direction: inherit` を持つ。縦積みの親に置くと
  ラベルとアイコンが縦に並ぶので、横並びを明示する。
- MUI の `Accordion` は畳んでも子を DOM に残す。重い子を持つなら
  `slotProps={{ transition: { unmountOnExit: true } }}` を付ける。
- 補足文付きの入力とボタンを `Stack direction="row"` に並べると、既定の stretch で
  ボタンが入力の高さまで伸びる。ボタン列は `alignItems="flex-start"` で上端に揃える。
  無効なボタンへツールチップを付ける包みの `span` も、伸びないよう flex にしておく。
- `URL.createObjectURL` は `a.click()` の直後に同期で解放しない。次のタスクまで待つ。
