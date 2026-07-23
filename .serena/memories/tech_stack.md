# Tech stack

このメモリは技術の役割だけを示します。正確なバージョンと依存関係は
`package.json`と`package-lock.json`、コンパイラ設定は`tsconfig*.json`、
品質設定は`biome.json`を正本としてください。

- ビルド/開発: Vite
- 言語/型: TypeScript、ES Modules
- UI: React、MUI、Emotion
- 状態管理: Jotai
- i18n: i18next + react-i18next + language detector
- オーディオ: Tone.js
- 3D/描画: Three.js
- 品質: Biome、Markuplint
- テスト: Jest + ts-jest（`jest.config.js`）
- Git hooks: husky + lint-staged
- Node要件: `package.json`の`engines`
