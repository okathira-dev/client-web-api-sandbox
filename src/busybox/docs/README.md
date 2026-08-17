# Busybox ドキュメント入口

このディレクトリでは、現行コードの確認に使う資料と、設計・調査の履歴を分けて管理する。
現在の箱ID、解法、実装状態を履歴資料から再構成してはいけない。現行コードと次の3資料を正本とする。

## 現行確認に使う資料

- 現行ステージ解法仕様: 各 `stages/S-xxx.tsx` の直前にある日本語JSDoc。プレイヤーが何を見て、何を操作し、どの箱が開くかをここに集約する。
- [ステージ実装状況](./stage-implementation-status.md): stage・boxの現行ID、API、状態、人手確認ID。
- [現状・残問題・人手確認への引継ぎ](./current-status-and-handoff.md): 最新の実装状態、未解決事項、次の確認順。
- [検証記録](./verification-record.md): 自動検証と人手確認の証跡。
- [人手確認台帳](./human-test-matrix.md): 実ブラウザ・実機で確認する手順。
- [決定ログ](./decision-log.md): 採用・統合・却下を確定した判断の履歴。
- [アーキテクチャ判断](./architecture-decisions.md): 現行実装が守る境界と規約。
- [最新PoC索引](./poc-latest.md): 現行仕様に対応する最新版PoCの入口と、削除済み旧PoCの境界。
- [残存PoC実装計画](./remaining-poc-implementation-plan.md): 現行仕様で未実装だったPoCの実装状況、外部条件、次の確認順。

## 履歴として保存する資料

次の資料は、調査・PoC・実装前計画を再現するための履歴である。現行の箱番号、件数、成功条件、API採否の判断には使わない。

履歴資料の整理方針は [`history/README.md`](./history/README.md) を参照する。既存の相互リンクを壊さないため、移行途中の旧ファイルは当面この階層に残し、現行資料から参照しない。

- `current-environment-implementation-plan.md`
- `implementation-poc-master-plan.md`
- `stage-rollout-plan.md`
- `gimmick-backlog.md`
- `gimmick-coverage-plan.md`
- `poc-results.md`（旧時系列結果。最新版の入口は`poc-latest.md`）
- `deep-research-idea-disposition-ledger.md`
- `api-research-and-adoption.md`
- `blackbox-mechanism-ledger.md`

履歴資料に現行情報へのリンクが残っていても、リンク先の現行資料を優先する。古い文面を削除せず、後から判断の経緯を追えるようにするためである。

## 実装側の正本

プレイヤー向けの表示文言は各 stage の隣にある `S-xxx.locale.ts` へsemantic keyで置く。ステージ名は `stageName`、箱名は `B01` のような問題ID末尾キーとし、`stages/metadataLocale.ts` が `StageSpec` / `ProblemSpec` のIDから解決する。共通UIは `ui/locale.ts`、状態語は `ui/statusLocale.ts`、S-710の独立ツールは `tools/s710/locale.ts` を正本とする。
プレイヤーの解法と実装意図は、各 `S-xxx.tsx` の日本語JSDocに、API・成功条件・negative case・権限・保存／送信・cleanup・人手確認IDを分けて記録する。
表示文言とJSDocを同じ文章の重複コピーとして扱わない。
