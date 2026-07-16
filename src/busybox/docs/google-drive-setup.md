# Google Driveバックアップの設定と運用

## 採用方式と確定したアカウント方針

ブラウザだけで動く静的アプリなので、Google Identity Services（GIS）のtoken modelを使い、ユーザー操作のたびに短命アクセストークンを取得する。トークン、refresh token、クライアントシークレットはIndexedDB、Drive、配信物へ保存しない。

要求scopeは `https://www.googleapis.com/auth/drive.appdata` だけである。これは非機密scopeとして、アプリ自身の非表示 `appDataFolder` だけを操作する。Drive全体の一覧、プロフィール、メールアドレスは要求しない。

アカウントIDを得るidentity scopeは追加しない。同期時に選択したGoogleアカウントのバックアップと、その時点の単一ローカル進捗をgrow-onlyで統合する。別のGoogleアカウントを選ぶと両アカウント由来のクリア情報が混ざり、統合後は自動分離できないが、本作ではクリアを失わないことを優先してこの挙動を許容する。UIと公開説明ではこの挙動を隠さない。

実装時に再確認した一次資料:

- [Store application-specific data](https://developers.google.com/workspace/drive/api/guides/appdata)
- [Choose Google Drive API scopes](https://developers.google.com/workspace/drive/api/guides/api-specific-auth)
- [Use the token model](https://developers.google.com/identity/oauth2/web/guides/use-token-model)
- [Manage OAuth clients](https://support.google.com/cloud/answer/15549257)
- [Vite environment variables](https://vite.dev/guide/env-and-mode)
- [GitHub Actions variables](https://docs.github.com/actions/concepts/workflows-and-actions/variables)

確認日: 2026-07-17。

## Google Cloud設定

1. Google Cloudで本番用プロジェクトを作成または選択し、Google Drive APIを有効にする。開発用と本番用を分離する場合は、それぞれ別のClient IDとoriginを持たせる。
2. Google Auth PlatformのBrandingで、アプリ名、User support email、Developer contact information、公開時に必要なホームページとプライバシーポリシーを登録する。
3. Audienceを設定する。開発中はTestingとして利用者をTest usersへ追加する。一般公開時はExternal / In productionへ移し、表示されるVerification Centerの要件を完了する。
4. Data Accessへ `https://www.googleapis.com/auth/drive.appdata` だけを追加する。Cloud設定とコードの両方で同じ最小scopeにする。
5. ClientsでApplication typeが「Web application」のOAuth Clientを作成する。
6. Authorized JavaScript originsへ、実際に配信するoriginを完全一致で登録する。
   - ローカル例: `http://localhost:5173`。ポートが変わる場合はそのoriginも登録する。
   - GitHub Pages例: `https://okathira-dev.github.io`。
   - Pagesのリポジトリパス（例 `/client-web-api-sandbox`）や `/busybox/index.html` はoriginへ含めない。
   - 独自ドメインを使う場合は、そのHTTPS originを別途登録する。
7. 本実装はGIS token modelのポップアップcallbackを使うため、Authorized redirect URIは使用しない。
8. 発行されたブラウザ用OAuth Client IDをローカルまたはGitHubの設定へ登録する。Client Secretは使用しない。

値が空なら、設定画面は「未設定」を表示するだけで、ローカルゲーム・PWA・他のリポジトリアプリへ影響しない。

## フロントエンドへ露出してよい値

`VITE_GOOGLE_CLIENT_ID` に入れるOAuth Client IDは、GoogleがJavaScriptベースのpublic clientを識別するための公開値である。Google公式もClient IDをWebアプリへ含める方式を案内している。Client IDだけではDriveへアクセスできず、登録originからユーザーが明示的に認可して得た短命アクセストークンが別途必要になる。

| 値 | フロントエンド・配信物 | GitHubでの保存先 | 理由 |
| --- | --- | --- | --- |
| ブラウザ用OAuth Client ID | 含めてよい | Actions Repository Variable | 公開クライアント識別子。Viteがbuild時に埋め込む |
| OAuth Client Secret | 含めない | Actionsへ登録しない | Consoleが発行・表示しても本実装では使用しない。JavaScriptアプリは秘密を保持できない |
| OAuth access token | 含めない | 登録しない | ユーザー認可後に取得し、同期中のメモリだけに保持する |
| refresh token | 含めない | 登録しない | GIS token modelでは保存せず、期限切れ後にユーザー操作で再認可する |
| Drive API key | 不要 | 登録しない | 今回の認証済みDrive REST呼び出しには使用しない |

`VITE_*` は秘密管理機構ではない。Viteは値をbuild時にJavaScriptへ置換するため、ブラウザ開発者ツールや生成ファイルから読める前提で使う。Client Secret、トークン、パスワードなどを `VITE_*` へ入れてはいけない。

## ローカル開発

追跡対象外の `.env.local` を作る。

```dotenv
VITE_GOOGLE_CLIENT_ID=1234567890-example.apps.googleusercontent.com
```

`.env.example` は変数名と注意だけを記載し、実値をコミットしない。値を変更した後はdev serverを再起動する。production相当を確認する場合は、同じ値を設定したシェルからbuildする。

## GitHub Pages CI

Repositoryの `Settings` → `Secrets and variables` → `Actions` → `Variables` で、次を登録する。

| 名前 | 値 |
| --- | --- |
| `BUSYBOX_GOOGLE_CLIENT_ID` | Web application用OAuth Client ID |

CLIを使う場合は、リポジトリを指定して次のように登録できる。

```sh
gh variable set BUSYBOX_GOOGLE_CLIENT_ID --body "1234567890-example.apps.googleusercontent.com"
```

`publish-pages.yml` は `${{ vars.BUSYBOX_GOOGLE_CLIENT_ID }}` をworkflow環境変数 `VITE_GOOGLE_CLIENT_ID` へ渡し、`npm run build` で公開JavaScriptへ埋め込む。非機密値なのでSecretではなくVariableを使う。Secretへ入れても最終成果物からは読めるため、Client IDを隠す効果はない。

Variableが未登録または空ならDrive UIだけが未設定状態になり、buildとPages配信は成功する。Variableを変更しても既存の配信物は変化しないため、mainへの再pushまたはActionsの `workflow_dispatch` で必ず再build・再deployする。

Pagesで認可エラーになった場合は、次を順に確認する。

1. workflowのbuildが新しいVariable設定後に実行された。
2. Client IDがGoogle Auth PlatformのWeb application clientと一致する。
3. Authorized JavaScript originsに実際のPages originがHTTPSで登録されている。
4. AudienceがTestingなら、操作したGoogleアカウントがTest userに入っている。
5. Data Accessとコードがともに `drive.appdata` だけを要求している。

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

## 既知の挙動と公開ゲート

`drive.appdata` だけではGoogleアカウントのIDを取得しない。このため「前回と同じアカウントか」は判定・表示しない。毎回account selectorを出し、選んだアカウントの進捗と現在のローカル進捗をgrow-only統合する。H-017では、AからBへ切り替えた際にこの説明どおり両方のクリアが残り、拒否・取消・通信失敗時にはローカル進捗が変更されないことを確認する。
