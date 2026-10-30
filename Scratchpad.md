# Scratchpad

## レーザー検出検証PoCの新規プロジェクト組み込み

- [x] node_modules を用意する（既存作業クローンへのシンボリックリンク。package.json / package-lock.json が同一であることを確認済み）
- [x] poc.html を src/laser-detection-poc/index.html として配置し、そのまま通るか確認（markuplint エラー2件・Biome エラー多数のため分離へ移行）
- [x] vanilla 前例に倣い script/style を分離する等の最小限の適応
- [x] プロジェクト README.md を作成
- [x] 登録3点（vite.config.ts / src/index.html / ルート README.md）
- [x] npm run check / npm run build で検証し、dist 出力を確認

## 結果

- `src/laser-detection-poc/` に index.html + main.ts + style.css + README.md で配置。登録3点も追加済み。
- 適応の要点: そのままの単体HTMLでは Biome がインラインJSを大量に指摘するため、style→style.css、script 2本→main.ts 結合に分離。main.ts は @ts-nocheck + 一部ルールの biome-ignore（ブロック内 var 宣言・文字列結合は挙動保持を優先）、Biome の安全な自動修正（format・矢印関数化等）は適用済み。`this` を使うイベントハンドラは関数式のまま保持されていることを確認。
- markuplint のエラー2件（video の track 要件、colspan）は、静的HTML側のみの最小変更で解消（JS が起動時に描き直す初期行と、カメラ専用 video への空字幕 track 追加）。ボタン36個への type="button" 追加、role="group" の div 2件の fieldset 化と CSS リセット追加も実施。
- `npm run check` 成功（markuplint は head 要素順序の警告3件のみ残存、エラー0）。`npm run build` 成功し、dist/laser-detection-poc/index.html と assets の JS/CSS が生成されることを確認。
- push / PR は未実施（親担当）。ブラウザ実機確認（カメラ必須のため）と Jest テストは未実施。再利用可能な教訓: 単体HTMLの検証ページをこのリポジトリへ移植する場合は、最初から vanilla 分離構成にすると lint 対応が最小で済む。
