# エンコーダー実用可否検査 (Encoder Capability Inspector)

ブラウザー・OS・GPU・ドライバー・エンコーダー実装の組み合わせごとに異なる、映像・音声エンコード設定の**実用可否**を利用者自身が確認する WebCodecs ツール。

`VideoEncoder.isConfigSupported()` の受理だけではなく、候補ごとに実エンコード、デコード、多重化、出力サイズ、要求フレームレートに対する処理時間まで検査する。結果は「この環境で一度、実出力まで到達した」ことを示すものであり、すべての録画条件での恒久的な成功を保証するものではない。

## 検査対象

| 種別 | 内容 | 候補数 |
| --- | --- | --- |
| 映像 | H.264 / H.265 / VP9 / AV1 / VP8 を Profile・Level・ビット深度まで展開した codec string × ハードウェア方針 3 種 | 462 |
| 音声 | AAC / Opus × 1ch・2ch × 各ビットレート（48 kHz） | 22 |
| | **合計** | **484** |

映像では同じ codec string でも `prefer-hardware` / `no-preference` / `prefer-software` を別候補として検査する。Level に応じた解像度・FPS・ビットレートは、その Level の上限に近い検査負荷であり、実録画の推奨値ではない。

## ドキュメント

- [検査の使い方と入力](docs/inspection.md)
- [設計とデータの扱い](docs/design.md)
- [実装上の判断・注意点](docs/implementation-notes.md)
- [テストと依存ライブラリ](docs/testing.md)
- [元仕様からの対象範囲](docs/scope.md)

アプリ内の「参考文献」には codec string と検査方法を確認する外部資料をまとめている。実装上の一覧は [features/References](features/References) が正本である。
