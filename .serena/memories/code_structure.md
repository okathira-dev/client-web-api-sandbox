# コード構造

- ルート
  - `vite.config.ts`: `src` を root とし、複数 HTML を `rollupOptions.input` で指定
  - `tsconfig.json`: strict, bundler 解決, JSX は `react-jsx`
  - `eslint.config.js`: flat config, type-aware, react/react-hooks/import-x/html, prettier 連携
  - `jest.config.js`: ts-jest 設定
  - `README.md`, `Scratchpad.md`, `Lessons.md`
- `src/`
  - 各サブプロジェクトごとにディレクトリ（`button-accordion-with-keyboard`, `lcg-predictor`, `computation-of-tears` など）
  - `shared/` 共有 UI/HTML

## プロジェクト内の推奨ディレクトリ（coding-rules）

- `/features`: 機能ディレクトリ配下に機能別にコロケーション
- `/components`: 汎用/共通 UI
- `/atoms`: プロジェクト全体で共有する状態
- `/consts`: ドメイン知識に基づく定数
- `/domain`: ドメインロジック
- `/utils`: 機能に依存しないユーティリティ
- `App.tsx`, `index.html`, `main.tsx`, `README.md`

子機能は更に子ディレクトリ化し、`index.ts(x)` で必要なもののみ再エクスポート。
