# Codex setup

このディレクトリには、このリポジトリ専用の Codex 設定を置きます。

- `../AGENTS.md`: Cursor 向けルールを Codex に読み込ませるためのプロジェクト指示
- `config.toml`: Serena MCP のプロジェクトスコープ設定

## 初回利用

1. このリポジトリを Codex で trusted project として開きます。
2. `serena` コマンドを利用できる環境にします。
3. Codex アプリ、CLI、または IDE extension を再起動します。
4. MCP サーバー一覧で `serena` が接続済みになっていることを確認します。

`config.toml` はリポジトリで共有されます。PAT、API キー、個人用 MCP 設定は追加せず、ユーザー側の `~/.codex/config.toml` で管理してください。
