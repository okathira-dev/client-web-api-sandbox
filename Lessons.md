# Lessons

このファイルは、プロジェクト内で学んだ教訓や再利用可能な知識を記録するためのものです。
（`.cursor/rules/global.mdc`のルールに従って管理されています）

## User Specified Lessons

- Python venvの使用: `./venv`ディレクトリにあるPython仮想環境を常に使用（activate）してください。最初に`which uv`を実行して'uv'が利用可能かを確認し、利用可能であれば仮想環境をアクティベートした後に`uv pip install`を使用してパッケージをインストールしてください。利用できない場合は`pip`を使用してください。
- デバッグ情報: プログラム出力に役立つデバッグ情報を含めてください。
- ファイル編集の前提: ファイルを編集する前に必ずその内容を確認してください。
- Cursorの制限に関して: `git`や`gh`を使用する際に複数行のコミットメッセージが必要な場合は、まずメッセージをファイルに書き、`git commit -F <filename>`などのコマンドを使用してコミットしてください。その後ファイルを削除します。コミットメッセージとPRタイトルには「[Cursor] 」を含めてください。

## Cursor learned

- 検索結果: 国際的なクエリに対して異なる文字エンコーディング（UTF-8）を適切に処理することを確保してください。
- デバッグ情報の出力: パイプライン統合を改善するため、stderrにデバッグ情報を追加し、stdoutはメイン出力をクリーンに保ちます。
- seabornスタイル: matplotlibでseabornスタイルを使用する場合、最近のseabornバージョン変更により、'seaborn'ではなく'seaborn-v0_8'をスタイル名として使用してください。
- OpenAIモデル名: OpenAIのGPT-4（ビジョン機能付き）には'gpt-4o'をモデル名として使用してください。
- 最新情報の検索: 最新ニュースを検索する場合は、前年ではなく現在の年（2025）を使用するか、単に「recent」キーワードを使用して最新情報を取得してください。

## Lessons管理ルール

1. **目的**: このファイルは、プロジェクト作業中に学んだ教訓や再利用可能な知識を記録し、共有するためのものです。

2. **更新方法**:
   - 新しいLessonを発見したら、適切なセクションに追加してください
   - 既存のLessonを修正・改善する場合は、その理由を記載してください
   - 各Lessonは簡潔かつ具体的に記述し、可能であれば例を含めてください

3. **分類**:
   - User Specified Lessons: ユーザーが明示的に指定した重要なレッスン
   - Cursor learned: AIが作業中に学んだレッスン
   - Project Specific Lessons: 特定のプロジェクトに関連するレッスン（必要に応じて追加）

4. **他のファイルとの連携**:
   - Scratchpad.mdでタスクを実行する際、このLessons.mdを参照して過去の教訓を活かしてください
   - 新しいLessonを発見したら、現在のタスクを中断せずに、タスク完了後にこのファイルを更新してください 