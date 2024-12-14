import eslint from "@eslint/js";
import tsEslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import typescriptEslintParser from "@typescript-eslint/parser";
import html from "eslint-plugin-html";

// import tsconfigNode from "./tsconfig.node.json" with { type: "json" };

export default tsEslint.config(
  // 全般
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { ignores: ["dist"] },
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.es2021, ...globals.node },
      parserOptions: {
        projectService: true,
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
  tsEslint.configs.recommendedTypeChecked,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],
  {
    // eslint-plugin-react-hooks
    plugins: { "react-hooks": pluginReactHooks },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
    },
  },
  {
    // node
    files: ["vite.config.ts", "eslint.config.mjs", ".prettierrc.js"], // tsconfigNode.include
    languageOptions: {
      parser: typescriptEslintParser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        projectService: true,
        project: "./tsconfig.node.json",
        // project: ["tsconfig.json", "tsconfig.node.json"],
        // tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // html
    files: ["**/*.html"],
    plugins: { html },
  },
  eslintConfigPrettier, // eslint-config-prettier は最後
  {
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
);
