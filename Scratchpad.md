# Scratchpad

このファイルは、タスクの計画と進捗状況を追跡するためのスクラッチパッドとして使用されます。
（`.cursor/rules/global.mdc`のルールに従って管理されています。長期的な教訓・方針はserenaメモリに保存します）

## 現在のタスク

タスクなし（待機中）

## 最近完了したタスク

### button-accordion-with-keyboard: キーボードレイアウトシステムの大規模リファクタリング

#### 実施内容

1. **README.mdの修正**
   - 102/106キーボードレイアウトの説明を正確に修正
   - 「物理的なキーボードレイアウト対応」セクションを共通化し重複を削除

2. **キーボードレイアウトシステムの完全書き換え**
   - `PhysicalKeyboardLayoutType` (`"101" | "102" | "106"`) から `BackslashPosition` (`"row1" | "row2"`) への統一
   - 国際化キー（`IntlBackslash`, `IntlYen`, `IntlRo`）を常に表示
   - 共通の`PHYSICAL_KEYBOARD_MAP: Record<string, { row: number; col: number }>`を導入
   - `col: -1`など負の値も許容し、`1/Q/A/Z`を`col: 0`で揃える
   - 動的レイアウト生成（`getKeyboardLayout`関数）の実装

3. **右手側（C-system/B-system）のリファクタリング**
   - ハードコードされたキーマップを削除
   - `getSemitoneOffsetCSystem(row, col)` / `getSemitoneOffsetBSystem(row, col)` 関数を実装
   - `row/col`から機械的に音程を計算

4. **左手側（Stradella）のリファクタリング**
   - ハードコードされた`ROOT_NOTES`配列を削除
   - `getRootNote(col)` 関数を実装（`col: 0`のオフセット`4 - 12`、奇数/偶数で+7/-5の計算）
   - `Uncaught Error: Invalid root semitone` エラーを修正

5. **コードの整理と統合**
   - 重複していた`getCodeLabel`関数を`consts/keyboardLayout.ts`に統合
   - 不要な`getLayout`ラッパー関数を削除
   - 古いレイアウト定数（`KEYBOARD_LAYOUT_101/102/106`など）の削除を確認

6. **翻訳キーの整理**
   - `keyboard.view.code` → `keyboard.view.keytop` に変更
   - `note` と `en` を `note` に統一
   - `keyboard.layout` → `keyboard.backslashPosition` に変更（`secondRow`, `thirdRow`）

7. **Jotaiインポートルールへの準拠**
   - コンポーネントから`jotai`の直接インポートを削除
   - `atoms/keyboardLayout.ts`でカスタムフック（`useXxxValue`, `useSetXxx`）を提供
   - `BackslashPosition`型を`atoms/keyboardLayout.ts`から再エクスポート

#### 主な成果

- **コードの簡潔性**: ハードコードされた定数が大幅に減少し、計算ベースのシステムに移行
- **保守性の向上**: 単一のキーマップと計算関数により、変更が容易に
- **ルール準拠**: コーディングルール（特にJotaiの使用方法）に完全準拠
- **拡張性**: 新しいキー配列や音階システムの追加が容易
- **UI改善**: ユーザーにわかりやすい「バックスラッシュの位置」選択

#### 技術的な学び

- Serenaツールを使ったTypeScriptコード分析が効果的
- 型推論の問題は再エクスポートで解決できる
- 過度な型アノテーションより、シンプルな実装の方が型エラーを避けやすい

## 進捗状況

## リポジトリ構造分析結果

- リポジトリは様々なWeb APIを使ったサンドボックスプロジェクトの集合体
- 主要プロジェクト：クロマティックボタンアコーディオン、データモッシング、線形合同法乱数予測ツールなど
- ルールファイル構成：
  - `global.mdc`: リポジトリ全体に適用されるツール・レッスン・スクラッチパッド使用法
  - `repository.mdc`: リポジトリ概要とプロジェクト一覧
  - `coding-rules.mdc`: 基本的なコーディングルールとディレクトリ構造
  - `eslint.mdc`: ESLint設定に関するルール
  - プロジェクト固有のルール（`button-accordion-with-keyboard.mdc`と`stradella-bass-system.mdc`）

## メモと反省

- リポジトリ内の個別プロジェクトは独立しているが、共通のコーディングルールで統一されている
- ルールファイルは適切に整理・構造化されている
- ルールの分割と再構成により、責任範囲がより明確になった
- 日本語化によりグローバルルールの一貫性が向上した
- コマンド例やプロンプトなどの技術的な文字列は原文のままにすることで正確性を確保
- ドキュメントとルールファイルの相互参照により、プロジェクト全体の把握がしやすくなった
