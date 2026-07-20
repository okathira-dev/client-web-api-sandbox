# PWA・オフライン運用

## 配置とscope

Service WorkerはBusyboxの `service-worker.js` から `./` scopeで登録する。公開時のscopeはリポジトリ全体ではなく、常に `.../busybox/` 配下だけである。トップページや他の実験アプリのリクエストを横取りしない。

manifestの `start_url`、`id`、`scope` とアイコンはすべて相対URLにし、GitHub Pagesのリポジトリ名が変わっても同じ成果物を使えるようにする。

## キャッシュ方針

- 開発サーバーでは `?mode=development` のpass-through Service Workerを登録する。通知などService Worker依存ステージは試せるが、fetchへ介入せず、activate時に古い `busybox-` キャッシュを削除する。
- 本番のinstall時にBusyboxの入口、manifest、アイコンに加え、生成済みHTMLが参照するcontent hash付きentry script、modulepreload、CSSをアプリシェルとして保存する。ビルドhashをService Workerへ手書きしない。
- HTML、manifest、アイコンはnetwork-firstとし、オンライン時に古い画面を優先しない。HTMLのオフラインfallbackはquery付きURLを増殖させず、正規化した `index.html` 1件を使う。
- Viteが生成する `/assets/` 配下のcontent hash付きJS、CSS、JSON、Wasmだけをcache-firstで実行時保存する。hashが変われば別URLになるため、古いchunkを新しいHTMLへ混在させない。
- ソースコード、HMR、任意のGET、APIレスポンスはキャッシュ対象にしない。
- 進捗はCache Storageへ置かず、IndexedDBだけを正とする。
- キャッシュ名は用途別の `busybox-shell-v2` と `busybox-assets-v2`。版を上げたactivate時に過去の `busybox-` キャッシュだけを削除する。
- 更新待機中は設定画面に明示操作を表示し、プレイ途中に自動再読込しない。

初回訪問前の完全オフライン起動はできない。少なくとも一度オンラインでアプリ本体を読み込んだ後にオフライン確認を行う。遅延ロードするステージは、そのstage chunkを一度オンラインで読み込んだ後からオフラインで利用できる。

開発環境で旧 `busybox-shell-v1` がすでに制御中の場合は、最初の一度だけ設定画面の「新しい版があります。更新する」を押すか、DevToolsでBusyboxのService Workerを解除して再読み込みする。新しいdevelopment workerが有効になった後はVite更新がCache Storageで隠れない。

## ステージとの接続

- S-070は `navigator.onLine` とonline/offlineイベントを観測する。ネットワーク疎通の完全な保証には使わない。
- S-080は `display-mode: standalone` を観測する。インストール可否そのものをAPI存在だけで判定しない。
- S-090はステージ内ボタンから通知権限を要求し、Service Workerのnotification clickで専用URLへ戻った事実を判定する。
- S-410はnotification actionをService Worker内で処理し、pageを開かず次の通知へ差し替える。完了結果は専用IndexedDB inboxへ置き、通常訪問時に一度だけconsumeする。S-090とはnotification tagで分岐する。
- S-420はnotification actionを入力列として保存し、本文click時に提出snapshotをcommitしてから金庫pageへ戻す。S-090 / S-410とは別tagとround recordを使い、直接URLでは提出扱いにしない。
- S-240はmanifestの `share_target` でinstalled BusyboxをOSの共有先として登録し、同じround URLを外から受信した事実を判定する。通常tabでは、stage内と共通設定画面の両方からBusybox自身のインストール手順へ進めるようにする。インストール操作だけでは箱を開かない。
- S-310はmanifestの `launch_handler` と `window.launchQueue` の実callbackを使う。B01はstage-scoped外部URL、B02はinstalled icon context menuのmanifest shortcut専用URL、B03は`note_taking.new_note_url`専用URLを受ける。通常page内遷移だけでは開かない。
- S-330は表示中にだけWake Lockを保持し、visibilityで解放された後の再取得までを観測する。
- S-440はmanifest `file_handlers`で`.busybox`をOSへ関連付け、OSの「開く」からLaunchQueueへ渡された実file handleだけを読む。fileはclient生成し、serverへuploadしない。起動済みpageへの通常dropは判定外とする。
- S-450はmanifest `protocol_handlers`で`web+busybox`を登録し、custom scheme経由のround payloadを受ける。初回handler確認を拒否した環境では未観測のままとする。
- S-460はdesktop installed PWAのWindow Controls Overlayがvisibleな時だけtitlebar geometryを盤面にする。
- S-510はinstalled PWAをsticker source、通常browser windowをreceiverとして使う。共通install導線からsourceの起動とreceiver pageの並べ方を示すが、同一page内dropや通常file uploadはclearにしない。

通知本文やキャッシュには進捗、生入力、端末識別子を含めない。

## 公開前の人手ゲート

H-005、H-021、H-022、H-023を消化する。特にChromeのインストール条件、iOSのホーム画面追加、更新配信中の古いHTML/新しいJS混在、キャッシュ削除後の回復を実環境で確認する。SVGアイコンだけで要件を満たさない対象ブラウザが確認された場合は、同じ図柄の192px・512px PNGとApple Touch Iconを追加する。
