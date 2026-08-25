# Busybox ドキュメント入口

このディレクトリでは、現行コードの確認に使う資料と、設計・調査の履歴を分けて管理する。
現在の箱ID、解法、実装状態を履歴資料から再構成してはいけない。現行コードと次の資料を正本とする。

## 現行確認に使う資料

- 現行ステージ解法仕様: 各 `stages/S-xxx/stage.tsx` の直前にある日本語JSDoc。プレイヤーが何を見て、何を操作し、どの箱が開くかをここに集約する。
- [ステージ実装状況](./stage-implementation-status.md): stage・boxの現行ID、API、状態、人手確認ID。
- [現状・残問題・人手確認への引継ぎ](./current-status-and-handoff.md): 最新の実装状態、未解決事項、次の確認順。
- [検証記録](./verification-record.md): 自動検証と人手確認の証跡。
- [人手確認台帳](./human-test-matrix.md): 実ブラウザ・実機で確認する手順。
- [全ステージレビュー・チェックリスト](./stage-review-checklist.md): 89ステージ・204箱を画面で順に確認し、指摘と完了状態を記録する作業台帳。
- [次のPoC・ステージ化キュー](./next-poc-and-stage-work.md): 製品化待ち件数と、外部条件による人手確認だけを残した現行キュー。
- [Google FedCM設定](./google-fedcm-setup.md): S-770の公開client ID、GitHub Repository Secret、成功境界。
- [Google Drive設定と運用](./google-drive-setup.md): OAuth設定、端末別replica同期、復旧選択、削除、公開ゲート。
- [決定ログ](./decision-log.md): 採用・統合・却下を確定した判断の履歴。
- [アーキテクチャ判断](./architecture-decisions.md): 現行実装が守る境界と規約。

## 履歴として保存する資料

次の資料は、調査・PoC・実装前計画を再現するための履歴である。現行の箱番号、件数、成功条件、API採否の判断には使わない。

履歴資料の整理方針は [`history/README.md`](./history/README.md) を参照する。既存の相互リンクを壊さないため、移行途中の旧ファイルは当面この階層に残し、現行資料から参照しない。

- `current-environment-implementation-plan.md`
- `stage-rollout-plan.md`
- `gimmick-backlog.md`
- `gimmick-coverage-plan.md`
- `poc-results.md`（PoCの時系列証拠。現在の作業順は`next-poc-and-stage-work.md`）
- `deep-research-idea-disposition-ledger.md`
- `api-research-and-adoption.md`
- `blackbox-mechanism-ledger.md`

履歴資料に現行情報へのリンクが残っていても、リンク先の現行資料を優先する。完了済みのPoC Wave計画、旧PoC索引、S-690〜S-920の一時実装計画は、コード横JSDoc・現行台帳・検証記録へ一意な情報を移したため削除した。

## 実装側の正本

プレイヤー向けの表示文言は各stageフォルダの `locale.ts` へsemantic keyで置く。ステージ名は `stageName`、箱名はローカルID `B01` のようなkeyとし、`manifest.ts` と遅延stage moduleが直接利用する。共通UIは `ui/locale.ts`、状態語は `ui/statusLocale.ts`、S-710の独立ツールは `tools/s710/locale.ts` を正本とする。
プレイヤーの解法と実装意図は、各 `S-xxx/stage.tsx` の一つの日本語JSDocに、API・成功条件・権限・保存／送信・cleanup・人手確認IDを分けて記録する。`manifest.ts` は箱の数とローカルIDだけを公開し、箱のアイコン・色・意味・配置・解法はstage moduleが所有する。
表示文言とJSDocを同じ文章の重複コピーとして扱わない。
