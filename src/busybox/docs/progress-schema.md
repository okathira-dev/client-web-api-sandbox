# ローカル進捗スキーマ

## 保存先と責務

主進捗は IndexedDB の `busybox-progress-v1` データベース、`documents/current` に保存する。保存するのはステージ単位の解決済み箱ID、ステージ内の最小限のmarker、言語設定、インストールIDだけである。クリア日時、判定facts、観測ログ、生入力は保存しない。

S-060 の再訪用booleanだけは、初回表示直後の終了に備えて localStorage にも保持する。この補助値は主進捗を復元せず、初期化時に同時に消える。

## version 1

```text
ProgressDocument
├── schemaVersion: 1
├── installationId: string
├── stages: Record<StageId, {
│   ├── solvedBoxIds: LocalBoxId[]
│   └── markers?: string[]
│ }>
└── settings: { locale: "ja" | "en" }
```

箱IDは `B01` のようにステージ内でだけ識別し、永続化では `stages[stageId]` に入れる。総問題数とステージ進捗は、各ステージmanifestの `boxIds` とこの集合から導出するため保存しない。入場中に開いた箱の集合もメモリだけに置き、再入場時には閉じた状態から始める。

## マージと互換性

解決済み箱IDとmarkerは grow-only set として和集合を取る。言語設定はローカルを優先する。公開前のため旧形式への移行は行わず、旧データとは別のデータベース名を使う。必須構造が壊れた文書や将来versionは自動で上書きしない。

## ユーザー操作

- 書き出し: 現在の文書を整形済みJSONとしてダウンロードする。
- 初期化: 確認後に `documents/current` を削除して新規文書を作る。
- 取込み: S-130の仕様と妥当性検証を通して追加する。任意JSONを現在の進捗へ直接代入しない。
