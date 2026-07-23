# Task completion checklist

完了条件の正本は`.cursor/rules/verification.mdc`です。このメモリには、
ツールから参照しやすい要約だけを置きます。

1. 対象差分と適用ルールを確認する
2. 変更内容に応じて`npm run check`、`npm run test:ci`、`npm run build`を選ぶ
3. 変更しない検証を先に行い、自動修正は依頼範囲内だけで使う
4. 挙動・公開インターフェース・運用が変わる場合だけ関連文書を更新する
5. Scratchpadを使った場合は未完了項目を残さず、結果を簡潔に閉じる
6. 実行できなかった関連検証があれば、理由と未確認範囲を報告する
7. コミットする場合は`commit_message_policy`を参照する
