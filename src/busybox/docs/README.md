# Busybox ドキュメント入口

このディレクトリでは、現行コードの確認に使う資料と、設計・調査の履歴を分けて管理する。
現在の箱ID、解法、実装状態を履歴資料から再構成してはいけない。現行コードと次の3資料を正本とする。

## 現行確認に使う資料

- [現行ステージ解法仕様](./stage-walkthroughs.md): プレイヤーが何を見て、何を操作し、どの箱が開くか。
- [ステージ実装状況](./stage-implementation-status.md): stage・boxの現行ID、API、状態、人手確認ID。
- [現状・残問題・人手確認への引継ぎ](./current-status-and-handoff.md): 最新の実装状態、未解決事項、次の確認順。
- [検証記録](./verification-record.md): 自動検証と人手確認の証跡。
- [人手確認台帳](./human-test-matrix.md): 実ブラウザ・実機で確認する手順。
- [決定ログ](./decision-log.md): 採用・統合・却下を確定した判断の履歴。

## 履歴として保存する資料

次の資料は、調査・PoC・実装前計画を再現するための履歴である。現行の箱番号、件数、成功条件、API採否の判断には使わない。

- `current-environment-implementation-plan.md`
- `implementation-poc-master-plan.md`
- `stage-rollout-plan.md`
- `gimmick-backlog.md`
- `gimmick-coverage-plan.md`
- `poc-results.md`
- `deep-research-idea-disposition-ledger.md`
- `api-research-and-adoption.md`
- `blackbox-mechanism-ledger.md`
- `architecture-decisions.md`

履歴資料に現行情報へのリンクが残っていても、リンク先の現行資料を優先する。古い文面を削除せず、後から判断の経緯を追えるようにするためである。

## 実装側の正本

プレイヤー向けの表示文言は各 stage の隣にある `locale.ts`（または stage に隣接する locale module）へ置く。
プレイヤーの解法と実装意図は、各 `S-xxx.tsx` の日本語JSDocに、API・成功条件・negative case・権限・保存／送信・cleanup・人手確認IDを分けて記録する。
表示文言とJSDocを同じ文章の重複コピーとして扱わない。
