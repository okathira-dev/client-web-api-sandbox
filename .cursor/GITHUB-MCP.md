# GitHub MCP の利用

このプロジェクトでも [GitHub MCP Server](https://github.com/github/github-mcp-server) でリポジトリ・Issue・PR 等を扱えます。  
**公式の Cursor 用ガイド**: [Install GitHub MCP Server in Cursor](https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-cursor.md)

---

## GitHub MCP はグローバルで設定する

**PAT（Personal Access Token）は個人の秘密情報**のため、GitHub MCP は **グローバル設定**（`~/.cursor/mcp.json`）で行うのが適切です。

- トークンをリポジトリに含めずに済む
- 1 回設定すれば全プロジェクトで使える
- このリポジトリの `.cursor/mcp.json` には**プロジェクト専用の MCP**（例: serena）だけを置く

---

## 前提条件

1. **Cursor IDE** の最新版（リモート利用時は **v0.48.0 以降**）
2. **GitHub Personal Access Token (PAT)**（必要なスコープを付与）
3. ローカルで Docker を使う場合のみ: [Docker](https://www.docker.com/) のインストール・起動

---

## グローバルでの設定手順（リモートサーバー・推奨）

1. **グローバル設定ファイル** `~/.cursor/mcp.json` を開く（なければ作成）。
2. 次の内容を追加する。**`YOUR_GITHUB_PAT`** を実際の [GitHub PAT](https://github.com/settings/personal-access-tokens/new) に置き換える。

    ```json
    {
      "mcpServers": {
        "github": {
          "url": "https://api.githubcopilot.com/mcp/",
          "headers": {
            "Authorization": "Bearer YOUR_GITHUB_PAT"
          }
        }
      }
    }
    ```

3. **Settings** → **Tools & Integrations** → **MCP tools** で「github」の横の **鉛筆アイコン**からも PAT を編集できる。
4. 保存し、**Cursor を再起動**する。

**注意**: 既に `~/.cursor/mcp.json` に別の MCP（例: serena）がある場合は、`mcpServers` の中に `"github": { ... }` を追加する形でマージする。

---

## グローバルでの設定（Docker でローカル実行する場合）

`~/.cursor/mcp.json` の `mcpServers` に次を追加する。`YOUR_GITHUB_PAT` を実際のトークンに置き換える。

```json
"github": {
  "command": "docker",
  "args": [
    "run",
    "-i",
    "--rm",
    "-e",
    "GITHUB_PERSONAL_ACCESS_TOKEN",
    "ghcr.io/github/github-mcp-server"
  ],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_GITHUB_PAT"
  }
}
```

**注意**: `@modelcontextprotocol/server-github` は非推奨のため、公式イメージ `ghcr.io/github/github-mcp-server` を使う。

---

## このリポジトリの .cursor/mcp.json について

このプロジェクトの `.cursor/mcp.json` には **プロジェクト固有の MCP**（serena など）だけを定義しています。  
GitHub MCP はグローバル設定で読み込まれるため、Cursor は両方をマージして利用します。同じ名前のサーバーがプロジェクト側にあればプロジェクト設定が優先されますが、このリポジトリでは `github` は定義していないため、グローバルの GitHub MCP がそのまま使われます。

---

## 動作確認

1. Cursor を**完全に再起動**する。
2. **Settings** → **Tools & Integrations** → **MCP Tools** で「github」に**緑のドット**が出ているか確認する。
3. チャットで「List my GitHub repositories」などと試す。

---

## トラブルシューティング（公式ガイドより）

- **Streamable HTTP が動かない**: Cursor v0.48.0 以降か確認する。
- **認証エラー**: PAT のスコープ（少なくとも `repo`）を確認する。
- **MCP が読み込まれない**: 設定変更後に Cursor を完全に再起動する。
- **詳細**: [公式インストールガイド](https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-cursor.md) の Troubleshooting を参照。
