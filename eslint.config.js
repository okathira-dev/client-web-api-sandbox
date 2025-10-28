import eslint from "@eslint/js";
// @types/eslint-config-prettier を利用している
import typescriptEslintParser from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier";
// @ts-expect-error 型定義がない
import html from "eslint-plugin-html";
import { flatConfigs } from "eslint-plugin-import-x";
// reactPlugin.configs.flatの型定義が曖昧 ref: https://github.com/jsx-eslint/eslint-plugin-react/issues/3878
import reactPlugin from "eslint-plugin-react";
// @ts-expect-error 型定義がない ref: https://github.com/facebook/react/issues/30119
import pluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import { config, configs as tsEslintConfigs } from "typescript-eslint";

export default config(
  // 全般
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { ignores: ["dist", "**/*.d.ts"] },
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.es2020, ...globals.node },
      parserOptions: {
        // projectService: true, // vscode-eslintが非対応？ ref: https://github.com/microsoft/vscode-eslint/issues/1911
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // eslint-plugin-react
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  // プラグインの基本設定
  eslint.configs.recommended,
  tsEslintConfigs.recommendedTypeChecked,
  // @ts-expect-error 型定義が曖昧
  reactPlugin.configs.flat.recommended,
  // @ts-expect-error型定義が曖昧
  reactPlugin.configs.flat["jsx-runtime"],
  flatConfigs.recommended,
  flatConfigs.typescript,
  {
    // eslint-plugin-react-hooks
    plugins: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      "react-hooks": pluginReactHooks,
    },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    rules: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ...pluginReactHooks.configs.recommended.rules,
    },
  },
  {
    // node コンフィグ系ファイル
    files: [
      "vite.config.ts",
      "eslint.config.js",
      "jest.config.js",
      "commitlint.config.ts",
    ], // import tsconfigNodeJson from "tsconfig.node.json" with {type: "json"}; tsconfigNodeJson.include
    languageOptions: {
      parser: typescriptEslintParser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        project: "./tsconfig.node.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // html
    files: ["**/*.html"],
    plugins: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      html,
    },
  },
  {
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    // インポート関連
    rules: {
      // 型インポートの強制
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          disallowTypeAnnotations: true,
        },
      ],
      // インポートの順序とグループ化
      "import-x/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling"],
            "index",
            "object",
            "type",
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "import-x/no-duplicates": "error",
      "import-x/no-named-as-default-member": "error",
      "import-x/no-extraneous-dependencies": "error",
      "import-x/no-empty-named-blocks": "error",
      "import-x/default": "off",
    },
  },
  // 最後に適用する
  eslintConfigPrettier,
);
