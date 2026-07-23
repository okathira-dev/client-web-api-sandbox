# Codex project instructions

このファイルは Codex 用の索引です。プロジェクトのルール本文は `.cursor/rules/*.mdc` を正本とし、ここには複製しません。

## ルール索引

Codex はタスクの対象を確認し、作業・レビューを始める前に該当するルールを読んで適用してください。

- 常時: `.cursor/rules/global.mdc`
- リポジトリの構成・概要を扱う場合: `.cursor/rules/repository.mdc`
- コードの実装・変更・レビューを行う場合: `.cursor/rules/coding-rules.mdc`
- Biomeの設定、lint、format、import整理を扱う場合: `.cursor/rules/biome.mdc`
- コード・設定・依存関係・AIエージェント設定を変更または検証する場合: `.cursor/rules/verification.mdc`
- `src/button-accordion-with-keyboard/**` を扱う場合: `.cursor/rules/button-accordion-with-keyboard.mdc`
- `src/button-accordion-with-keyboard/features/LeftHandAccordion/**` を扱う場合: `.cursor/rules/stradella-bass-system.mdc`

複数条件に一致する場合はすべて読み、対象範囲が狭いルールを優先してください。`.mdc` の frontmatter は Cursor 用メタデータとして解釈し、本文を指示として扱ってください。

## Skill索引

- FSL Skills: `.agents/README.md`
  - 公式Skill正本: `skills/`
  - Cursor発見用アダプター: `.cursor/skills/`
  - Codex発見用アダプター: `.agents/skills/`

## Codex 固有の指示

- セッション開始時に Serena MCP が利用可能なら、最初に現在のリポジトリを Serena プロジェクトとして activate し、Serena の initial instructions を読んでください。
- Codex は Cursor の `globs` を自動適用しないため、上記の索引に基づいて対象ルールを明示的に選択してください。
- ルールの内容と現在のコードや設定が食い違う場合は、実際のコード・設定を優先し、食い違いをユーザーへ報告してください。
