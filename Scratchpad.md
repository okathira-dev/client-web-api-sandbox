# Scratchpad

## 依存更新と開発環境・CIのLTS統一

- [x] 最新mainから codex/dependency-updates-lts-mui9 を作成し、既存変更を保持
- [x] Node・npm統一と更新前の検証
- [x] 通常依存・翻訳・Jest・TypeScript 6・開発ツール更新
- [x] Biome・Markuplintの指摘解消
- [x] MUI 9・Tree View 9・Jotai 3へ移行
- [x] Actions更新と監査・チェック・テスト・ビルド・画面確認
- [x] 差分レビューと結果記録

## 結果

- クリーンインストール、Markuplint・Biome、24スイート222テスト、ビルドが成功。
- ブラウザーで乱数生成、翻訳、エンコーダーの進捗・選択、XML帳票の読込とツリー展開、アコーディオン左右表示を確認。
- TypeScriptはts-jestの対応範囲内、Nodeの型は採用LTSに合わせる。固定版の正本はpackage.json。
- 実行時依存の監査は問題なし。Markuplint経由の未修正braces問題と上流修正後の対応はREADMEに記録。
