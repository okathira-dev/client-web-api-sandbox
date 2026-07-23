# Style and conventions

詳細の正本は`.cursor/rules/coding-rules.mdc`、Biomeの設定と検証方法は
`.cursor/rules/biome.mdc`と`biome.json`です。このメモリへ個別ルールや
ツールバージョンを複製しません。

- コロケーション原則（coding-rules）
  - 機能単位で `/features/${機能名}` に集約
  - 子機能は親機能ディレクトリ内へ
  - `atoms/consts/hooks/utils` は必要に応じて機能配下に配置
- インポート方針
  - 可能な限り named import を使用（default import は極力避ける）
  - 型は `import type` を使用
  - import整理はBiome Assistの`organizeImports`に従う
- TypeScript
  - コンパイラ設定は`tsconfig.json`を正本とする
  - コンポーネントから状態管理ライブラリを直接 import しない（jotai は atom ファイルのみ）
- 品質
  - JavaScript、TypeScript、JSON、CSS、HTMLはBiomeを使用する
  - JSX、TSX、HTMLにはMarkuplintも適用する
  - ESLintやPrettierを前提にした設定を追加しない
- 命名/構成
  - 機能ディレクトリのメインは `${機能名}.tsx` とし `index.ts` で必要最小限を re-export
  - UI ロジックと状態管理・ドメインロジックはファイル分離
