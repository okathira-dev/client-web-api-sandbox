# エンコーダー実用可否検査 (Encoder Capability Inspector)

ブラウザー・OS・GPU・ドライバー・エンコーダー実装の組み合わせごとに異なる、映像・音声エンコード設定の**実用可否**を利用者自身が確認する WebCodecs ツール。

`VideoEncoder.isConfigSupported()` の受理だけではなく、候補ごとに実エンコード、デコード、多重化、出力サイズ、要求フレームレートに対する処理時間まで検査する。結果は「この環境で一度、実出力まで到達した」ことを示すものであり、すべての録画条件での恒久的な成功を保証するものではない。

## 検査対象

| 種別 | 内容 | 候補数 |
| --- | --- | --- |
| 映像 | 154 codec string × `constant` / `variable` / `quantizer` × ハードウェア方針 3 種 | 1,386 |
| 音声 | AAC 4 Profile / Opus × 1ch・2ch（48 kHz）× `constant` / `variable` | 20 |
| | **合計** | **1,406** |

映像では同じ codec string でも bitrate mode と `prefer-hardware` / `no-preference` / `prefer-software` を別候補として検査する。`constant` / `variable` は公式の配信ガイドにある代表的な初期目標を使い、`quantizer` は各 codec 登録仕様の範囲内に置いた比較用 QP を使う。AV1 と VP8 は一律の公式ビットレート表がないため、比較起点であることを明示する。音声はビットレート品質ごとには候補を増やさず、代表ビットレートで `constant` / `variable` を実検査する。各結果の検査値とは別に、codec string 横の情報ボタンと全体ガイドで、仕様・公式実装のサポート値および情報ソース付きの推奨値を確認できる。AAC は Windows Chromium の固定離散値と、macOS Chromium / macOS Safari の AudioToolbox 設定依存を分けて表示する。映像の量子化パラメーターも同じ画面で、サポート範囲・推奨目安・値が大きいほど高品質か低品質か・検査比較値を確認できる。全体ガイドは表示範囲だけをDOMへ置く仮想スクロールに対応し、ファミリー・codec string・Profile / Level で絞り込み、各列を昇順・降順・解除の順に並べ替えられる。

## ドキュメント

- [検査の使い方と入力](docs/inspection.md)
- [設計とデータの扱い](docs/design.md)
- [実装上の判断・注意点](docs/implementation-notes.md)
- [ビットレートと Profile / Level](docs/bitrate-and-profiles.md)
- [テストと依存ライブラリ](docs/testing.md)
- [元仕様からの対象範囲](docs/scope.md)

アプリ内の「参考文献」には codec string と検査方法を確認する外部資料をまとめている。実装上の一覧は [features/References](features/References) が正本である。
