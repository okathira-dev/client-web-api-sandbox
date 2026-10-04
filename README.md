# Web API を使った遊び場

## start dev

```bash
npm run dev
```

## サプライチェーン対策

- GitHub Actions の外部 `uses:` はタグではなく **コミット SHA（40 桁）** で固定する。
- CI の依存取得は [`.github/actions/setup-node-npm`](./.github/actions/setup-node-npm) に集約し、その中で [Takumi Guard（匿名モード）](https://github.com/flatt-security/setup-takumi-guard-npm) を有効化したあと `npm ci` を実行する。
- Dependabot は [`.github/dependabot.yml`](./.github/dependabot.yml) で `npm` と `github-actions` の両方に `cooldown: 3 days` を設定している。
- 開発環境とCIのNode / npmは `package.json` の `volta` に固定する。Voltaを使用する開発環境ではプロジェクトに入ると同じ版が選ばれ、CIは `node-version-file: package.json` とnpmの明示インストールで同じ版を使用する。
- `engines.node` と `@types/node` は採用したNode LTSのメジャーに揃える。LTSの更新時は `volta.node`・`volta.npm`・`engines` を一緒に更新し、チェック・テスト・ビルドを確認する。

### Actions の更新ルール

- `uses: owner/repo@<40桁SHA>` のみで指定する。

## 依存更新の互換性と検証

- TypeScriptは `ts-jest` が対応するCompiler APIの範囲に留める。DependabotのTypeScript 7以降の除外は、対応確認後に解除する。
- Jestは `src` のテストだけを収集する。リポジトリ内の別作業用チェックアウトを重複実行しない。
- MarkuplintのJSX設定では、Reactの `onXxx` コールバックをHTMLの文字列イベント属性と区別する。HTMLファイルにはこの例外を適用しない。
- `npm audit` は実行時依存と開発用依存を分けて確認する。Markuplint 5のAstroパーサー経由の `braces` には、2026-10-04時点で[未修正のDoS問題](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)がある。このプロジェクトではAstroパーサーを使用せず、チェック対象のglobも固定している。上流の修正後にロックファイルを更新して再監査する。

## プロジェクトフォルダ

### [./src/shared](./src/shared)

共有コンポーネント

### [./src/index.html](./src/index.html)

以下のページの目次となるページ

### [./src/button-accordion-with-keyboard](./src/button-accordion-with-keyboard)

クロマティックボタンアコーディオンを演奏できるウェブアプリ

### [./src/webcodecs-data-moshing](./src/webcodecs-data-moshing)

データモッシング PoC

### [./src/webcodecs-data-moshing-react](./src/webcodecs-data-moshing-react)

**WIP** データモッシング React App

### [./src/lcg-predictor](./src/lcg-predictor)

線形合同法乱数予測ツール

### [./src/computation-of-tears](./src/computation-of-tears)

**WIP** [Tears of Overflowed Bits (by eau. / La Mer ArtWorks)](https://www.youtube.com/watch?v=LRXLwrTHqmY)の再現

### [./src/pdf-compressor-wasm](./src/pdf-compressor-wasm)

完全クライアントサイドでPDFを圧縮するWebアプリケーション（Ghostscript WASM使用）

### [./src/kojo-xml-viewer](./src/kojo-xml-viewer)

日本の控除証明書データのXMLファイルを閲覧する読み取り専用のウェブアプリケーション

### [./src/encoder-capability-inspector](./src/encoder-capability-inspector)

WebCodecs の映像・音声エンコード設定が実際に使えるかを、実エンコード・デコード・多重化まで通して検査するツール

## 開発サポートファイル

### [./Scratchpad.md](./Scratchpad.md)

タスクの計画と進捗状況を追跡するためのスクラッチパッド

### Serena memories（.serena/memories/*.md）

プロジェクト内で学んだ教訓や再利用可能な知識は Serena のメモリとして管理します。

### [FSL Agent Skills](./.agents/README.md)

[FSL](https://github.com/ymm-oss/fsl) v3.1.0 の公式Agent Skill bundleは、[`skills/`](./skills/)を無改変の正本として配置しています。Cursorは`.cursor/skills/`、Codexは`.agents/skills/`の薄い発見用アダプターから同じ正本を参照します。
形式仕様を作成・検証するときは、目的に合うFSL SkillをCodexでは `$fsl`、Cursorでは `/fsl` などで明示的に呼び出せます。

検証CLIは別途インストールした `fslc` を使用します。

```powershell
fslc --version
fslc check path/to/spec.fsl
fslc verify path/to/spec.fsl --depth 8
```

## ルールファイル

.cursor/rulesディレクトリには以下のルールファイルがあります。ここではすべてのプロジェクトに関するもののみを記載しています。

- **global.mdc**: リポジトリ全体に適用されるルール（Scratchpadの使用方法など）
- **repository.mdc**: リポジトリ構造とプロジェクト概要
- **coding-rules.mdc**: コーディングルールとディレクトリ構造
- **biome.mdc**: Biomeによるlint、format、import整理に関するルール
- **verification.mdc**: 変更内容に応じた検証と完了条件
