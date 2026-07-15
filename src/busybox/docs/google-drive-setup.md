# Google Driveバックアップの設定と運用

## 採用方式

ブラウザだけで動く静的アプリなので、Google Identity Services（GIS）のtoken modelを使い、ユーザー操作のたびに短命アクセストークンを取得する。トークン、refresh token、クライアントシークレットはIndexedDB、Drive、配信物へ保存しない。

要求scopeは `https://www.googleapis.com/auth/drive.appdata` だけである。これは非機密scopeとして、アプリ自身の非表示 `appDataFolder` だけを操作する。Drive全体の一覧、プロフィール、メールアドレスは要求しない。

実装時に再確認した一次資料:

- [Store application-specific data](https://developers.google.com/workspace/drive/api/guides/appdata)
- [Use the token model](https://developers.google.com/identity/oauth2/web/guides/use-token-model)
- [Drive files.list](https://developers.google.com/workspace/drive/api/reference/rest/v3/files/list)

確認日: 2026-07-15。

## Google Cloud設定

1. Google CloudプロジェクトでGoogle Drive APIを有効にする。
2. OAuth同意画面を設定し、必要scopeとして `drive.appdata` だけを登録する。
3. 「ウェブアプリケーション」のOAuth Client IDを作る。クライアントシークレットは本アプリで使わない。
4. Authorized JavaScript originsへ開発origin（例 `http://localhost:5173`）と公開origin（例 `https://okathira-dev.github.io`）を登録する。originにはリポジトリ名やパスを含めない。
5. ローカルでは未追跡の `.env.local` に `VITE_GOOGLE_CLIENT_ID=<client id>` を設定する。
6. GitHub PagesではRepository Variable `BUSYBOX_GOOGLE_CLIENT_ID` を設定する。workflowがbuild時に `VITE_GOOGLE_CLIENT_ID` へ渡す。

値が空なら、設定画面は「未設定」を表示するだけで、ローカルゲーム・PWA・他のリポジトリアプリへ影響しない。

## 同期手順

1. 設定画面の同期ボタンという明示操作でGISスクリプトを初めて読み込む。
2. account selectorを表示し、`drive.appdata` のアクセストークンを得る。
3. `spaces=appDataFolder` とファイル名でバックアップを検索する。
4. なければメタデータを作成してJSONをmedia uploadする。
5. あれば `alt=media` で取得し、ローカルとgrow-onlyマージしてから同じファイルを更新する。
6. Drive通信・認可・妥当性確認のどこかで失敗した場合、ローカル文書を置換しない。

アクセストークン失効後は、次の同期ボタンから再度認可する。ページ再読込をまたいでGoogle接続状態を復元しない。

## 削除と解除

- 接続解除: 現在メモリにあるアクセストークンのgrantをrevokeする。ローカル進捗とDriveファイルは残す。
- Driveバックアップ削除: 確認後、`appDataFolder` 内の `busybox-progress.json` を完全削除する。ローカル進捗は残す。
- ローカル初期化: IndexedDBの現在文書だけを削除する。Driveバックアップは残す。

これらを独立操作にし、一つの削除操作から別の保存先まで連鎖削除しない。

## 既知の公開ゲート

`drive.appdata` だけではGoogleアカウントのIDを取得しない。このため、scopeを増やさずに「前回と同じアカウントか」を画面へ表示することはできない。毎回account selectorを出し、選んだアカウントの進捗と現在のローカル進捗を統合する。

H-017では、この最小scope方針で十分か、またはアカウント分離のためにidentity scopeとローカルのアカウント別領域を追加するかを公開判断する。未判断のまま「アカウント切替で混在しない」とは表示しない。
