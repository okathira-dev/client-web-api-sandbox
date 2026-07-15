# ローカル進捗スキーマ

## 保存先と責務

主進捗はIndexedDBの `busybox-progress` データベースへ保存する。キーは `documents/current`。`localStorage`、Cache Storage、Service Workerのキャッシュは主進捗として使わない。

保存するのは箱を解いた時刻、判定に必要な最小限の観測事実、言語設定、インストール単位のランダムIDである。カメラ、マイク、センサー、選択文字列、ファイル内容などの生入力は保存しない。

## version 1

```text
ProgressDocument
├── schemaVersion: 1
├── installationId: string
├── createdAt: ISO 8601 string
├── updatedAt: ISO 8601 string
├── boxes: Record<BoxId, { solvedAt, facts[] }>
└── settings: { locale: "ja" | "en" }
```

ステージ箱の状態は保存せず、各問題箱の解決状況から導出する。`facts` は正解の生入力ではなく、`mouse` や `installed-display-mode` のような非機密の判定結果だけを持つ。

## 互換性

- 同じversionに未知フィールドがあれば、読込・保存で保持する。
- version 0の試作形式（`solvedBoxes` 配列）はversion 1へ移行する。
- 現在より新しいversionは読み取り専用扱いとし、自動保存しない。
- 必須フィールドや箱レコードが壊れていれば、自動上書きしない。
- 破損・将来versionからの復旧は、設定画面でユーザーが明示的に初期化した場合だけ行う。

## マージ規則

問題箱の解決集合はgrow-only setとして扱う。ローカルとバックアップのどちらかで解決済みなら解決済みを残し、同じ箱の `solvedAt` は早い方、`facts` は和集合を採用する。端末固有の言語設定はローカルを優先する。

この規則は端末時計の正確さへクリア可否を依存させないためのものでもある。時刻は表示・診断用で、後の時刻を理由に箱を閉じ直さない。

## ユーザー操作

- 書き出し: 現在の進捗を整形済みJSONとしてダウンロードする。
- 初期化: 確認ダイアログ後、このアプリの `documents/current` だけを削除して新規文書を作る。
- 将来の取込み: S-130の仕様と妥当性検証を通して追加する。任意JSONを現在の進捗へ直接代入しない。
