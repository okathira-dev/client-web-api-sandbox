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
- S-310はmanifestの `launch_handler` と `window.launchQueue` の実callbackを使い、通常のURL遷移だけではクリアしない。
- S-330は表示中にだけWake Lockを保持し、visibilityで解放された後の再取得までを観測する。

通知本文やキャッシュには進捗、生入力、端末識別子を含めない。

## 公開前の人手ゲート

H-005、H-021、H-022、H-023を消化する。特にChromeのインストール条件、iOSのホーム画面追加、更新配信中の古いHTML/新しいJS混在、キャッシュ削除後の回復を実環境で確認する。SVGアイコンだけで要件を満たさない対象ブラウザが確認された場合は、同じ図柄の192px・512px PNGとApple Touch Iconを追加する。
