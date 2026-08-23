# Scratchpad

このファイルは短期の作業状態だけを記録する。仕様・解法・確認結果の正本は `src/busybox/docs/` と実装コードに置く。

## 現在のタスク

### S-710 / S-720 / S-810 のレビュー反映

- [x] S-710の固定decode失敗動画を小文字のflagで再生成し、QRを検出したframeだけをそのframe内の位置で置換する
- [x] ClipPress iframeを内部scrollなしでコンテンツ高へ追従させる
- [x] 固定flag入力はギミック成立状態に依存させず、正しいflagだけで該当箱を開く
- [x] S-810を3840pxまでの指定順sweep、自動読込、停止中判定、箱直下の比率表示へ更新する
- [x] fixture再生成、関連テスト、品質チェック、実ブラウザ確認を行い、正本資料を同期する

## 引継ぎ

- 製品化待ち・追加PoC実装待ちは0件。次の作業は新規実装ではなく、既存89ステージ・204箱の一件ずつの品質確認である。
- Drive用の環境変数は`VITE_BUSYBOX_DRIVE_GOOGLE_CLIENT_ID`、FedCM用は`VITE_BUSYBOX_FEDCM_GOOGLE_CLIENT_ID`。公開CIはRepository Secretを使う。
- Google Drive同期は端末別replicaを全件mergeし、自端末replicaだけをETag条件付き更新する。破損・未来版・競合時はローカル続行、再試行、該当replicaの保存／削除を提示する。
- S-430-B02は製品stageへ追加済みで、Audio Session対応環境での実機確認が残る。
- 非人手検証はNode 24で通過済み。全stageは一つの日本語JSDocとstage-local localeを持つ。未使用の共通`hint`キーは削除済みで、ヒントUIは問題のブラッシュアップ後に別途設計する。
- 固定flagを入力して解く問題では、正答入力をギミックの事前達成状態で制限しない。ギミックはflag発見の体験として残し、正答flagの照合だけで該当箱を開く。
