# Google FedCM 設定

更新日: 2026-08-21

S-770はGoogle Identity Services（GIS）の公式JavaScript APIを使い、ブラウザが仲介した手動FedCM結果だけを受け入れる。通常のOAuth popup / redirectやGoogle Drive認可は代替にならない。

## 公開クライアントの準備

1. Google Cloud ConsoleでWebアプリケーション用OAuth clientを作る。
2. Busyboxを配信する正確なoriginを「承認済みのJavaScript生成元」へ登録する。originにはpathを含めない。
3. client secretは作業ディレクトリ、GitHub、Vite環境変数へ置かない。Web client IDは公開識別子として扱う。
4. Google Drive同期用とは別のclient IDを使い、S-770の設定と権限範囲を分離する。

公式資料:

- [Google Identity Services JavaScript API reference](https://developers.google.com/identity/gsi/web/reference/js-reference)
- [FedCM migration guide](https://developers.google.com/identity/gsi/web/guides/fedcm-migration)

## ローカルとGitHub Pages

ローカルbuildでは次を設定する。

```text
VITE_BUSYBOX_FEDCM_GOOGLE_CLIENT_ID=<public-web-client-id>
```

GitHubではRepository Secret `BUSYBOX_FEDCM_GOOGLE_CLIENT_ID`へ同じ公開client IDを登録する。`publish-pages.yml`がbuild時に`VITE_BUSYBOX_FEDCM_GOOGLE_CLIENT_ID`へ渡す。最終bundleでは読める公開識別子だが、Secretに入れることでGitHub設定画面とActionsログでの偶発表示を抑える。未設定時、S-770は設定不足を表示し、通常OAuthへfallbackしない。

## 成功境界と人手確認

製品stageはGIS callbackのcredentialが非空で、`select_by`が厳密に`fedcm`のときだけ開く。`fedcm_auto`を含む自動選択やlegacy結果は拒否する。credentialはdecode・表示・log・保存・同期・送信しない。

公開originでのaccount chooser、手動Continue、取消、未login、network failure、late callback、provider側の接続解除は[H-049](./human-test-matrix.md)に従って人手確認する。
