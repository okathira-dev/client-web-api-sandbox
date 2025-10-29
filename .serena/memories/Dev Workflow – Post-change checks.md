# 変更後チェック手順

- まとまった編集の後は `npm run check:fix` を先に実行して自動修正を適用する
- 続けて `npm run check` を実行し、markup / lint / format をすべて通す
- 失敗はブロッカーとして扱い、修正してから続行・コミットする
- 本リポジトリ全体および PDF Compressor プロジェクトで徹底する