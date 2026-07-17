# 検証記録

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
| 遅延stage online | 合格 | S-200の `peripheralStages` chunkを読み込み、共通問題箱を表示 |
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
