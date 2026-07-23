# FSL Skill adapters

FSLのSkill本文、参照資料、UIメタデータの正本は、公式配布構成と同じ [`skills/`](../skills/) です。`.cursor/skills/`と`.agents/skills/`には、それぞれCursorとCodexがプロジェクトSkillを検出するための薄いアダプターだけを配置します。

各アダプターの`SKILL.md`は、検出に必要な`name`と`description`、対応する正本への参照、利用先リポジトリに存在しない上流パスの解釈だけを持ちます。ワークフロー指示や参照資料をアダプターへ複製しないでください。

## FSL

[ymm-oss/fsl](https://github.com/ymm-oss/fsl) のリリース `v3.1.0` から、次の公式Skillを導入しています。

- `fsl`: FSL構文、検証、修復ループの共通知識
- `fsl-business`: ビジネスフロー、統制、KPI
- `fsl-requirements`: 要件、受入条件、禁止フロー、NFR
- `fsl-design`: 設計仕様と要件へのrefinement
- `fsl-design-review`: 設計レビューと契約適合性
- `fsl-delivery`: businessから実装適合性までの一貫した進行

`skills/`は、公式`v3.1.0` Releaseのチェックサム付き`fsl-skills.tar.gz`から導入した無改変の配布物です。更新時は`fslc`と同じFSL ReleaseのSkill bundleを検証してから`skills/fsl*`をまとめて交換し、正本の`name`または`description`が変わった場合だけ両アダプターのfrontmatterを同期します。正本へローカル指示を追加しないでください。

正本内の`docs/`、`examples/`、`specs/`、`schemas/`は、必要に応じて参照する上流FSLソースツリーのパスです。利用先リポジトリ内で探索しないための注記は、Cursor/Codexのアダプター側で管理します。プロジェクト共通の指示は`.cursor/rules/`、Codex固有の入口だけをルートの`AGENTS.md`で管理します。

ネイティブCLIはリポジトリに含めません。各開発環境に同じリリースの `fslc` をインストールし、`fslc --version` で確認してください。

Cursorでは新しいAgentチャットを開いたあと、SettingsのRules / Skillsまたはスラッシュコマンド一覧で`fsl`、`fsl-business`、`fsl-requirements`、`fsl-design`、`fsl-design-review`、`fsl-delivery`を確認できます。Codexでは同じ名前のSkillを`.agents/skills/`のアダプター経由で利用します。どちらのアダプターも`skills/`の正本を直接参照します。
