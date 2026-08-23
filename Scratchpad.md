# Scratchpad

このファイルは短期の作業状態だけを記録する。仕様・解法・確認結果の正本は `src/busybox/docs/` と実装コードに置く。

## 現在のタスク

### ステージ単位のブラッシュアップ・レビュー・動作確認

- [ ] 各ステージを一つずつ、体験意図・各箱の解法と手掛かり・UX・negative caseの順にレビューする
- [ ] レビューで確定した修正を実装し、そのステージに対応する自動検証と実機確認を行う
- [ ] 実機確認結果を`src/busybox/docs/human-test-matrix.md`と`verification-record.md`へ記録する

## 引継ぎ

- 製品化待ち・追加PoC実装待ちは0件。次の作業は新規実装ではなく、既存89ステージ・204箱の一件ずつの品質確認である。
- Drive用の環境変数は`VITE_BUSYBOX_DRIVE_GOOGLE_CLIENT_ID`、FedCM用は`VITE_BUSYBOX_FEDCM_GOOGLE_CLIENT_ID`。公開CIはRepository Secretを使う。
- Google Drive同期は端末別replicaを全件mergeし、自端末replicaだけをETag条件付き更新する。破損・未来版・競合時はローカル続行、再試行、該当replicaの保存／削除を提示する。
- S-430-B02は製品stageへ追加済みで、Audio Session対応環境での実機確認が残る。
- 非人手検証はNode 24で通過済み。全stageは一つの日本語JSDocとstage-local localeを持つ。未使用の共通`hint`キーは削除済みで、ヒントUIは問題のブラッシュアップ後に別途設計する。
