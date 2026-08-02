# Scratchpad

このファイルは複数プロジェクト共用の進捗メモであり、プロジェクト固有の長期知識の正本ではない。

## 現在のタスク

### encoder-capability-inspector のビットレートガイド統合

- [x] AAC をプロファイル × チャンネルの候補へ拡張し、実出力プロファイルを照合する
- [x] AAC / Opus に十分な入力サンプル数を与え、音声をビットレートごとに重複検査しない
- [x] 検査ビットレートと、仕様・公式実装・推奨ガイドの値を共通カタログへ分離する
- [x] codec string の情報ダイアログと全体一覧を同じカタログから表示する
- [x] AAC 専用のインライン既知表示を削除し、文書・テスト・ブラウザー確認を更新する
- [x] AAC の実装由来ビットレートを Windows Chromium・macOS Chromium・macOS Safari の差分として表示する
- [x] 映像の量子化パラメーターに仕様範囲、品質方向、推奨値・比較値・出典を追加する
- [x] ビットレートガイドを仮想スクロール化し、ファミリー・codec string・Profile / Levelの絞り込みと列ソートを追加する

## 結果

- AAC は 4 Profile × 1ch/2ch を 128 kbps で実検査し、実出力の Audio Object Type も照合する。
- ビットレートガイドは H.264 / H.265 / VP9 / AV1 / VP8 / AAC / Opus を同じ形式で扱い、値の性質（仕様・公式実装・推奨・比較用）と出典 URL を表示する。
- 検査値はガイドの値と混同しないよう、各詳細表示で別項目として残す。AAC の Windows Chromium 離散値と Opus の RFC 範囲・用途別目安も同じガイドに含める。
- 互換性検査の音声入力は AAC を 1024 samples × 6、Opus を 960 samples × 4 に増やした。
- AAC の Windows Chromium は 96/128/160/192 kbps の離散値、macOS Chromium と macOS Safari は AudioToolbox の設定依存値として扱う。
- AVC/HEVC は QP 0–51、VP9/AV1 は QP 0–63、VP8 は codec-specific quantizer なしとしてガイドと情報ダイアログに出典付きで表示する。AV1 の検査比較値は仕様範囲内の QP 32 に修正した。
- ビットレートガイドは表示中の行だけを描画し、フィルター変更・ソート変更時に先頭へ戻す。操作順は昇順 → 降順 → 解除とする。
