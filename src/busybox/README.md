# Busybox: Web API Explorer

> いつものブラウザが、パズルになる。

ブラウザそのものが鍵となる新感覚パズル。

_A new kind of puzzle game where the browser itself is the key._

## 現在の状態

Viteのマルチページ構成へ独立した入口を持つReactアプリとして実装中。
現在はアプリシェル、日英表示、ステージ台帳、基本ナビゲーション、IndexedDB進捗スキーマ、進捗の書き出し・初期化、共通ステージランタイム、入場ごとに再挑戦できる67ステージ、mind map型ステージ一覧、Busybox scope限定のPWA、任意のGoogle Driveバックアップを備える。

2026-08-11時点では、現環境で確認できた範囲の実装と自動検証を終え、実ブラウザ・実機での人手確認とUI品質確認を進める段階である。残問題、確認順、旧資料の扱いは[現状・残問題・人手確認への引継ぎ](./docs/current-status-and-handoff.md)を参照する。

進捗スキーマはversion 1。箱の解決記録は後退させず、同じスキーマの未知フィールドを保持する。将来versionや破損データは自動上書きせず、設定画面からの明示的な初期化を待つ。

## ステージ実装の境界

- 個別ステージはIDだけを使った `stages/S-xxx.tsx` に1ファイルずつ置く。
- `StageSpec` と `ProblemSpec` は静的・不変な台帳、`ProblemHandle` は今回の入場だけの状態と解決操作を表す。
- 日英のステージラベルは表示専用で、ファイル名、変数名、URL、保存ID、テスト名には使わない。
- 共通処理は複数ステージで同じ意味とライフサイクルを持つ場合だけ `stages/shared/` へ置く。
- 事前生成可能な動画・音声・画像は生成手順と形式・寸法・内容などの意味検証を添えてGit管理し、player入力やlive同期に依存する媒体だけを実行時生成する。Gitのコミットが固定assetの版管理を担い、ゲーム判定そのものではないSHA一覧は別管理しない。
- 同期・リアルタイム性が本質でない合言葉は固定し、copy可能なら長い`BUSYBOX{...}`、転記が必要なら最大2語にする。
- 各ステージのJSDocにギミック、使用API、成功条件、権限・プライバシー、cleanup、人手確認IDを記録する。

開発サーバー起動後、`/busybox/index.html` から開く。公開ビルドでも相対パスだけで読み込めるため、GitHub Pagesのリポジトリ配下パスに対応する。

## ドキュメント

| 文書 | 役割 |
| --- | --- |
| [現行ステージ解法仕様](./docs/stage-walkthroughs.md) | レビュー済みステージの現行体験、解法、negative caseを定義する |
| [現状メモ・人手確認への引継ぎ](./docs/current-status-and-handoff.md) | 一通りのコード化後に未確認の範囲、確認順、変更時の留意点を共有する |
| [企画・プロダクト仕様](./docs/product-spec.md) | 体験、対象、スコープ、日英コピーを定義する |
| [アーキテクチャ判断](./docs/architecture-decisions.md) | ローカル保存、Drive連携、配信、ステージ分離の方針を定義する |
| [実装計画](./docs/implementation-plan.md) | 初期実装の履歴。現在の作業順は現状メモを正とする |
| [ステージ展開計画](./docs/stage-rollout-plan.md) | 実装前の履歴スナップショット。現行の箱ID・解法の正本にしない |
| [実装PoCマスタープラン](./docs/implementation-poc-master-plan.md) | PoC計画の履歴。未実装案の現行計画ではない |
| [実装PoC実施記録](./docs/poc-results.md) | PoCの証跡。現行の実装状態はステージ実装状況と現状メモを正とする |
| [API調査・採用方針](./docs/api-research-and-adoption.md) | Web APIの母集団、採否、再調査方法を定義する |
| [Deep Research元案・暫定採否台帳](./docs/deep-research-idea-disposition-ledger.md) | 非規範の元案・対話履歴。最後の決定と現行実装を優先する |
| [Blackbox機構監査・対話決定台帳](./docs/blackbox-mechanism-ledger.md) | 参考機構のWeb向け再設計、29/29件の採否、残る技術PoCを記録する |
| [ギミックメモ台帳](./docs/gimmick-backlog.md) | JSDoc移行前の設計履歴。現行解法の正本にしない |
| [ギミック実装カバレッジ計画](./docs/gimmick-coverage-plan.md) | JSDoc移行前の対応履歴。現行解法の正本にしない |
| [初期ステージ計画](./docs/initial-stage-plan.md) | 初期候補、問題箱数、採用ゲート、人手確認を対応付ける |
| [ステージ実装状況](./docs/stage-implementation-status.md) | コード化、自動確認、人手確認待ちを区別する |
| [ステージ仕様テンプレート](./docs/stage-spec-template.md) | 各ステージの意図、権限、後片付け、検証を同じ形式で記録する |
| [問題箱の形状と再挑戦モデル](./docs/problem-box-state-model.md) | 全問題で共通する箱形状、リボン、入場単位の開閉を定義する |
| [ステージMind Map設計](./docs/stage-map-design.md) | ステージ同士の近さと手掛かり関係を示す一覧地図を定義する |
| [人手確認台帳](./docs/human-test-matrix.md) | 自動テストだけでは保証できない環境・権限・機器の確認を管理する |
| [検証記録](./docs/verification-record.md) | 自動チェック、ブラウザシナリオ、未実施ゲートの証跡を残す |
| [リリース準備状況](./docs/release-readiness.md) | 実装完了範囲と公開を止める外部条件を分離する |
| [権限・プライバシー方針](./docs/privacy-and-permissions.md) | センサーデータやGoogle Drive連携の境界を定義する |
| [ローカル進捗スキーマ](./docs/progress-schema.md) | IndexedDBの形式、移行、マージ、復旧規則を定義する |
| [PWA・オフライン運用](./docs/pwa-and-offline.md) | Service Worker scope、キャッシュ、更新、人手ゲートを定義する |
| [権限・実機ステージ実装メモ](./docs/permission-stage-implementation.md) | 権限要求、判定閾値、生入力を残さない境界、cleanupを記録する |
| [Google Drive設定と運用](./docs/google-drive-setup.md) | OAuth設定、最小scope、同期、削除、公開ゲートを定義する |
| [決定ログ](./docs/decision-log.md) | 確定事項と未確定事項を混同しないための記録 |
| [添付資料の保存版](./docs/source/README.md) | 企画書ドラフトとDeep Researchメモを非規範の入力資料として保存する |

## 作業の隔離

- ブランチ: `codex/busybox-web-api-game`
- worktree: `worktrees.local/busybox-web-api-game`
- 分岐元: `main`

過去のBusybox関連ブランチは整理し、このブランチを唯一のBusybox作業線とする。今後並行作業が必要になった場合だけ、このブランチから用途別の短命な子ブランチとworktreeを作る。

## 実装時のコメント方針

コメントはコードの動作を日本語に言い換えるためではなく、次のような「理由」を残すために使う。

- 権限要求を自動実行せず、明示操作の後に限定している理由
- `unsupported` と `unknown` を分ける理由
- 進捗マージを単純上書きにしない理由
- ブラウザ差を吸収せず、ステージの性質として残している理由
- Service Worker、OAuth、複数タブなど、見かけ上不要に見える境界処理の理由

関数名や型名から明らかな処理には説明コメントを増やさない。
