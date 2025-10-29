# Tech stack

- ビルド/開発: Vite 6, SWC React プラグイン
- 言語/型: TypeScript 5（strict）, ES Modules（`type: module`）
- UI: React 18, MUI 6, Emotion
- 状態管理: jotai 2
- i18n: i18next + react-i18next + language detector
- オーディオ: Tone.js
- 3D/描画: Three.js
- 品質: ESLint 9（flat config, type-aware）, Prettier 3, markuplint 4, import-x, react, react-hooks, html
- テスト: Jest 29 + ts-jest（`jest.config.js`）
- Git hooks: husky + lint-staged
- Node: >= 22.12.0（Windows/PowerShell 7 想定）