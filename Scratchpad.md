# Scratchpad

このファイルは短期の作業状態だけを記録する。仕様・解法・確認結果の正本は `src/busybox/docs/` と実装コードに置く。

## 現在のタスク

### 人手確認前の品質整理

- [x] Google Driveを端末別replica同期へ変更し、復旧選択UIと自動testを追加する
- [x] S-430-B02 Audio Session interruptionを製品stageへ追加する
- [x] S-350-B07 / POC-034と不採用PoCを削除し、Baseline後アイデアだけを残す
- [ ] 全stageのJSDocとlocaleから汎用・重複文をなくし、検査を強化する（個別解法の旧英語JSDocと汎用日本語JSDocが63stageに残る）
- [x] 現行資料、環境変数例、PoC導線、Git indexを整理する（最終commit前にindexを再確認する）
- [x] Node 24で全自動検証と静的監査を実行する

## 現時点の確認

- Drive用の環境変数は`VITE_BUSYBOX_DRIVE_GOOGLE_CLIENT_ID`、FedCM用は`VITE_BUSYBOX_FEDCM_GOOGLE_CLIENT_ID`へ明確に分離する。Viteのapp rootは`src/`だが、`envDir`をproject rootへ固定した。
- Google Drive同期は端末別replicaを全件mergeして、自端末replicaだけをETag条件付き更新する。破損・未来版・競合にはローカル続行、再試行、該当replicaの保存／削除を提示する。
- S-430-B02は製品stageへ追加済み。Audio Session対応環境での実機確認が残る。
