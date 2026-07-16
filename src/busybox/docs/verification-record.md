# 検証記録

## 2026-07-17 統一問題箱・再挑戦の再検証

### コード・成果物

| 項目 | 結果 | 証跡 |
| --- | --- | --- |
| TypeScript | 合格 | `tsc --noEmit` |
| Biome | 合格 | Busyboxコードと `publish-pages.yml` を確認 |
| markuplint | 合格 | Busybox配下を確認 |
| Jest | 合格 | 14 suites / 91 tests。全15ステージ・19問題箱のID対応と入場状態導出を含む |
| production build | 合格 | Vite production buildでBusybox本体と遅延stage chunkを生成 |

### ブラウザシナリオ

| シナリオ | 結果 | 観測 |
| --- | --- | --- |
| S-000初回 | 合格 | 入場時はリボン付き閉箱・0/1、箱クリック後は開箱・1/1 |
| S-000再入場 | 合格 | 過去クリア済みでもリボンなし閉箱・0/1から始まり、再クリックで開箱・1/1。累積進捗は重複加算せず1/19 |
| S-010同形性 | 合格 | 3箱はいずれも72px幅、同じDOM部品・寸法・リボン形状で、差分は色と直下のSVGヒントだけ |
| S-010入力分離 | 合格（マウス） | マウスクリックでB01だけが開き、B02 touchとB03 penはリボン付き閉箱のまま。実機touch / penはH-024へ残す |
| S-010再入場 | 合格 | B01はリボンなし閉箱、未クリアのB02/B03はリボン付き閉箱、今回進捗は0/3へ戻る |
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
- ファイルのキャンセル、大容量、別ファイル、ダウンロード制限
- Google OAuth実アカウント、単一端末、2端末、失効、削除、アカウント切替
- GitHub Pages本番相当のサブパス、直接URL、Service Worker scope

これらは[人手確認台帳](./human-test-matrix.md)の該当IDへ結果と環境を追記してから公開合格にする。
