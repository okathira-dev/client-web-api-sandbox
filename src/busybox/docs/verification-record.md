# 検証記録

## 2026-07-20 相談結果の統合とステージ展開計画

Blackbox初期△28件・×1件の対話判断、新規G-033〜G-059、既存ステージ再設計を[ステージ展開計画](./stage-rollout-plan.md)へ統合した。コード実装は行わず、現在のcatalogueと計画値を分離して検証した。

| 確認 | 結果 | 証跡 |
| --- | --- | --- |
| 現行catalogue | 合格 | 35ステージ・42問題箱 |
| 計画台帳 | 合格 | stage status 60行、Gimmick 59件、うち取りやめ2件 |
| 計画箱数 | 合格 | 既存変更後50箱＋新規47箱＝97箱。S-190-B05採用時のみ98箱 |
| Blackbox相談 | 合格 | 初期△28件＋×1件の29/29にWeb案または新規問題を作らない理由あり |
| Markdownリンク | 合格 | `src/busybox`配下の全相対Markdownリンクが実在 |
| 差分形式 | 合格 | `git diff --check` |
| 自動test | 合格 | 16 suites / 99 tests |
| 静的check | 合格 | markuplint、Biome check。既存のBiome schema差異info 2件と`jest.setup.ts` warning 1件のみ |
| build | 合格 | TypeScriptとVite production build。既存のbrowser external、plugin timing、chunk size warningのみ |

完全なMDN 147ファミリー・1,045インターフェースの機械可読台帳は未作成である。この件数は2026-07-18の調査スナップショットとしてのみ保持し、次のWave 0で母集団を再取得する。

## 2026-07-18 ステージID単位の分割と問題ハンドル抽象化

### コード・成果物

| 項目 | 結果 | 証跡 |
| --- | --- | --- |
| モジュール境界 | 合格 | `S-000.tsx`〜`S-340.tsx`を10刻みで35ファイル。runtime registryも35件すべて同じIDの遅延import |
| 静的定義 | 合格 | 35 `StageSpec` と42 `ProblemSpec`を単一catalogueからregistry、一覧、箱表示、永続集計へ供給 |
| 入場オブジェクト | 合格 | 全ステージが `ProblemHandle` の定義・今回状態・安定した `solve` を利用し、移行用 `problemState` / ID別 `solve` を削除 |
| 表示ラベル境界 | 合格 | 日英ラベルは `label` と画面表示だけに残し、ファイル、export、registry、URL、保存、テストの識別はIDへ固定 |
| JSDoc | 合格 | 全35ファイルに `Gimmick`、`Uses`、`Success`、`Privacy/Permission`、`Cleanup`、`Human verification`。全件を人手台帳H-001〜H-025へ接続 |
| 共有化 | 合格 | 複数のcaptureステージで意味が同じMediaStream全track停止だけを `stages/shared/media.ts` へ抽出 |
| TypeScript / Biome / markuplint | 合格 | `tsc --noEmit`、Busybox 64ファイルのBiome、BusyboxのHTML/TSX markup検査 |
| Jest | 合格 | 16 suites / 99 tests。registry 35件、問題42件、S-200入力境界、Service Worker振り分けを含む |
| production build | 合格 | Vite buildが35個の `S-xxx` chunkを個別生成。既存の他entryに関するexternal化・500kB警告だけ継続 |

### セルフレビュー

| 観点 | 発見事項 | 対応 |
| --- | --- | --- |
| 永続化コールバック | 長時間動くstage effectが、保存状態変更前の `solve` / `observe` を保持し得た | `ProblemHandle` の関数identityを保ったまま、実行時は最新の進捗controllerへ委譲 |
| 非同期離脱 | 権限picker、メディア再生、共有、Drive、周辺機器処理の待機中にstageを離れると、完了後にstateまたは進捗を更新し得た | 各await境界でentryの `AbortSignal` を確認し、離脱後の更新・解決・後続I/Oを停止 |
| リソース所有権 | camera / microphone / display capture、PiP、通知、Bluetooth / HID / USB、WebGPUの一部確保後に失敗すると解放漏れの余地があった | 確保直後にcleanupを登録し、成功・拒否・例外・離脱・部分確保の全経路で停止、切断、close、destroy |
| 再検証 | 上記修正による型・表示・chunk境界への影響 | Biome、markuplint、`tsc --noEmit`、16 suites / 99 tests、production build、35 stage / 42 problem / JSDoc台帳整合を修正後に再実行 |

セルフレビュー後の未解決コード指摘はない。権限UI、OS連携、実センサー、実周辺機器、OAuth、PWAについては自動検査で代替せず、下記の人手ゲートを公開判定に残す。

### ブラウザシナリオ

| シナリオ | 結果 | 観測 |
| --- | --- | --- |
| 初回一覧 | 合格 | fresh production preview originで35ステージ、42問題箱、推敲可能な日英ラベルを表示 |
| S-000再挑戦 | 合格 | 初回リボン付き0/1→クリックで開箱1/1→再入場で累積1/1のままリボンなし閉箱 |
| S-010共通箱 | 合格 | 3箱が同形・同寸法で、直下ヒントはマウス、指、ペン。マウス操作後はB01だけ開き1/3 |
| S-140複数問題 | 合格 | Drive未設定でもB01/B02の共通箱を表示し、同期操作だけを無効化 |
| S-200遅延・offline | 合格 | ID単位chunkをonlineで読込後、preview停止中の再読込でもService Workerから問題箱を表示 |
| S-250入場状態 | 合格 | lock取得でB01だけ今回開箱、B02はリボン付き閉箱、ヘッダーは永続1/2 |

権限プロンプト、実センサー、外部機器、PWAインストール、OAuth実アカウントはこの確認で発火していない。公開合格には引き続き[人手確認台帳](./human-test-matrix.md)の該当ケースが必要である。

## 2026-07-18 Service Workerキャッシュ境界の再設計

### コード・成果物

| 項目 | 結果 | 証跡 |
| --- | --- | --- |
| 開発モード | 合格 | `?mode=development` workerはfetchへ介入せず、即時activate時に旧 `busybox-` キャッシュを削除 |
| 本番HTML | 合格 | Busyboxのnavigation、manifest、iconをnetwork-firstで更新し、正規化した `index.html` をオフラインfallbackに使用 |
| 本番asset | 合格 | `/assets/` のcontent hash付きJS・CSS・JSON・Wasmだけをcache-firstとし、生成HTML参照entry assetsをinstall時に自動precache |
| 対象外通信 | 合格 | ViteのTSX/HMR、任意のGET、APIレスポンスをCache Storageへ保存しない |
| TypeScript / Biome | 合格 | `tsc --noEmit`、Busybox 39ファイル |
| Jest | 合格 | 16 suites / 99 tests。development pass-through、precache抽出、navigation・asset・sourceの振り分けを含む |
| production build | 合格 | Vite production buildで新しい登録処理、Service Worker、hash付き遅延chunkを生成 |

### ブラウザシナリオ

| シナリオ | 結果 | 観測 |
| --- | --- | --- |
| Vite開発サーバー | 合格 | 設定画面に「開発モードではキャッシュせず、Service Worker機能だけを有効」と表示。35ステージを描画し可視エラーなし |
| production preview | 合格 | 設定画面がオフライン起動readyとなり、development workerと混同しない |
| 遅延stage online | 合格 | S-200の遅延chunkを読み込み、共通問題箱を表示 |
| 遅延stage offline再訪 | 合格 | production preview停止後、S-200直接URLを再読込してstageと問題箱をService Workerキャッシュから表示。可視エラーなし |

旧cache-first workerがすでに開発originを制御している環境だけは、最初の一度だけ更新操作またはDevToolsからの登録解除が必要になる。以後の開発workerはfetchを処理しないため、Viteの更新を古いCache Storageが隠さない。

## 2026-07-17 全ギミック実装の最終確認

### コード・成果物

| 項目 | 結果 | 証跡 |
| --- | --- | --- |
| TypeScript | 合格 | `tsc --noEmit` |
| Biome | 合格 | Busyboxの38ファイルを確認 |
| markuplint | 合格 | Busybox配下を確認 |
| Jest | 合格 | 15 suites / 95 tests。35ステージ・42問題箱のID対応、入場状態導出、永続集計、Gamepad入力境界を含む |
| production build | 合格 | Vite production buildで本体、基礎・複数コンテキスト・周辺機器の遅延chunk、PWA静的ファイルを生成 |
| 台帳整合 | 合格 | G-001〜G-032をすべて採用済みとして記録し、35ステージ・42問題箱のregistry、表示定義、仕様台帳が一致 |

### ブラウザシナリオ

| シナリオ | 結果 | 観測 |
| --- | --- | --- |
| 初回一覧 | 合格 | 全35ステージを番号順に表示し、全42問題箱の永続進捗を集計 |
| S-200待機状態 | 合格 | Gamepadの遅延chunkが読み込まれ、実入力待ちのリボン付き共通箱として表示 |
| S-210実行 | 合格 | Badging APIの成功を1→2→3回と数え、3回目に箱が開いてヘッダーが永続1/1へ更新 |
| S-210再入場 | 合格 | ヘッダーは永続1/1、一覧は1/42を維持しつつ、問題箱はリボンなし閉箱 `closed` へ戻り再挑戦可能 |
| S-280待機状態 | 合格 | Web Bluetooth対応ブラウザで実API操作を明示ボタンの後にだけ開始する構成を表示。自動確認では機器選択を発火させていない |
| 共通箱 | 合格 | 新規ステージを含め、ステージ内問題を共通 `ProblemGiftBox` と `data-box-state` で表現 |
| エラー隔離 | 合格（確認範囲） | 上記画面でエラー境界・alertの可視表示なし。権限UIや実機接続後のエラーは人手ゲートへ残す |

限定提供・実験的APIは、APIの存在だけでクリアさせない。Gamepad、Screen Capture、Picture-in-Picture、Web Locks、EyeDropper、WebGPU、Web Bluetooth、WebHID、WebUSB、Device Posture、Screen Wake Lockは、それぞれ仕様に定めた実イベントまたは実データを観測した場合だけ箱を開く。

## 2026-07-17 統一問題箱・再挑戦の再検証

### コード・成果物

| 項目 | 結果 | 証跡 |
| --- | --- | --- |
| TypeScript | 合格 | `tsc --noEmit` |
| Biome | 合格 | Busyboxコードと `publish-pages.yml` を確認 |
| markuplint | 合格 | Busybox配下を確認 |
| Jest | 合格 | 14 suites / 92 tests。全15ステージ・19問題箱のID対応、入場状態導出、ステージ別累積数を含む |
| production build | 合格 | Vite production buildでBusybox本体と遅延stage chunkを生成 |

### ブラウザシナリオ

| シナリオ | 結果 | 観測 |
| --- | --- | --- |
| S-000初回 | 合格 | 入場時はリボン付き閉箱・0/1、箱クリック後は開箱・1/1 |
| S-000再入場 | 合格 | 過去クリア済みではリボンなし閉箱から再挑戦し、ヘッダーは累積1/1を維持。再クリックで開箱になり、累積進捗は重複加算せず1/19 |
| S-010同形性 | 合格 | 3箱はいずれも72px幅、同じDOM部品・寸法・リボン形状で、差分は色と直下のSVGヒントだけ |
| S-010入力分離 | 合格（マウス） | マウスクリックでB01だけが開き、B02 touchとB03 penはリボン付き閉箱のまま。実機touch / penはH-024へ残す |
| S-010再入場 | 合格 | B01はリボンなし閉箱、未クリアのB02/B03はリボン付き閉箱へ戻る一方、ヘッダーは累積1/3を維持 |
| アクセシブル名 | 合格（確認範囲） | 未クリア、過去クリア・今回未クリア、今回クリアを箱のボタン名で区別 |
| コンソール | 合格 | 上記シナリオでerror / warningなし |

S-010は画面でも、各箱の下にマウスカーソル、指、ペンのアイコンが対応順で表示されることを確認した。全API・権限条件を実端末で再達成する確認はH-025として人手台帳へ残す。

## 2026-07-15 ローカル自動確認

### 対象

- ブランチ: `codex/busybox-web-api-game`
- worktree: `worktrees.local/busybox-web-api-game`
- URL: Viteローカルサーバーの `/busybox/index.html`
- ブラウザ: Codex in-app Chromiumブラウザ
- OAuth Client ID: 未設定

### コード・成果物

| 項目 | 結果 | 証跡 |
| --- | --- | --- |
| TypeScript | 合格 | `tsc --noEmit` |
| Biome | 合格 | Busybox変更に新規警告なし。リポジトリ既存の設定version情報と `jest.setup.ts` 1警告は継続 |
| markuplint | 合格 | リポジトリ全対象がpass |
| Jest | 合格 | 14 suites / 89 tests |
| production build | 合格 | Busybox本体と遅延stage chunkを生成 |
| PWA静的ファイル | 合格 | `manifest.webmanifest`、`service-worker.js`、`icon.svg` を `dist/busybox/` へ配置 |

### ブラウザシナリオ

| シナリオ | 結果 | 観測 |
| --- | --- | --- |
| 初回一覧 | 合格 | 15ステージ、19問題箱、進捗0/19を表示 |
| デスクトップ表示 | 合格 | ヘッダー、ナビゲーション、4列カード、フォーカス可能な操作を目視 |
| S-000直接URL | 合格 | `?stage=S-000` で直接起動 |
| S-000解決と再読込 | 合格 | 0/1→解決、reload後も解決、一覧1/19 |
| 日英切替 | 合格 | Englishを選び、reload後も英語コピーを保持 |
| IndexedDB状態 | 合格 | 設定画面が保存readyを表示 |
| S-050複数タブ | 合格 | 同じURLを2タブで開き、両方が解決 |
| S-060再訪 | 合格 | 箱本体表示後に即別ページへ移動し、次の直接訪問で解決 |
| Drive未設定 | 合格 | OAuth Client ID未設定を表示し、同期操作を無効化。ローカル進捗は利用可能 |
| コンソール | 合格（確認範囲） | S-060診断タブでerror/warningなし |
| 390px viewport | 未確定 | viewport制御中に自動ブラウザがタイムアウト。合格へ数えずH-020へ残す |

S-060の最初の試行では、問題コンポーネントの遅延読込前に強制遷移したため観測対象にならなかった。箱本体が表示されたことを待つ正しいシナリオへ修正し、表示commit直後の同期フラグとIndexedDB観測の両方で再訪を確認した。

## 未実施の人手ゲート

次はローカル自動確認だけでは合格にしない。

- Firefox、Safari、Android Chrome、iOS Safari
- 200%拡大、390px相当の実表示、スクリーンリーダー
- PWAインストール、ホーム画面起動、オフライン起動、更新、アンインストール
- 通知の許可・拒否・通知クリック
- mouse / touch / pen実機
- Device Orientation実機とiOS許可
- カメラ・マイクの許可、拒否、機器なし、インジケーター停止、閾値
- Screen Captureの許可・拒否・共有停止と、共有面からの実フレーム観測
- Picture-in-Pictureの入退場、Web Shareの共有完了、Web Locksの複数タブ待機順
- Gamepadの複数ボタン・スティック、Badging、EyeDropper、Screen Wake Lockの実機・OS差
- WebGPUの対応GPU、デバイス喪失、計算結果readback
- Web Bluetooth、WebHID、WebUSBの対象機器、選択キャンセル、切断、再接続
- Device Posture / Viewport Segmentsの折りたたみ実機、Launch Handlerのインストール済みPWA起動
- ファイルのキャンセル、大容量、別ファイル、ダウンロード制限
- Google OAuth実アカウント、単一端末、2端末、失効、削除、アカウント切替
- GitHub Pages本番相当のサブパス、直接URL、Service Worker scope

これらは[人手確認台帳](./human-test-matrix.md)の該当IDへ結果と環境を追記してから公開合格にする。
