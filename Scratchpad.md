# Scratchpad

このファイルは、タスクの計画と進捗状況を追跡するためのスクラッチパッドとして使用されます。
（`.cursor/rules/global.mdc`のルールに従って管理されています）

## 現在のタスク

audio-multi-outputプロジェクトのリンクまとめページやVite設定、SNSリンクの設置
audio-multi-outputプロジェクトのGrid2への更新
audio-multi-outputプロジェクトのPlayButtonをSwitchに変更
audio-multi-outputプロジェクトの全体再生ボタンの動作変更
audio-multi-outputプロジェクトの重複再生問題の修正
audio-multi-outputプロジェクトのトグル状態変化による制御の実装
audio-multi-outputプロジェクトの位相反転スイッチの注意書き削除

## 進捗状況

[X] プロジェクトディレクトリの作成
[X] 基本ファイル構造の作成
[X] DeviceManagerの実装
[X] OscillatorControlの実装
[X] OutputControllerの実装
[X] メインAppコンポーネントの実装
[X] スタイリングの追加
[ ] 動作確認とテスト
[X] Vite設定への追加
[X] メインindex.htmlへのリンク追加
[X] SNSリンクの設置（Reactコンポーネント使用）
[X] Grid2への更新
[X] PlayButtonのSwitch化
[X] 全体再生ボタンの動作変更
[X] 重複再生問題の修正
[X] トグル状態変化による制御の実装
[X] 位相反転スイッチの注意書き削除

## タスク詳細

調整済みの設計に基づいて、audio-multi-outputプロジェクトを実装します。
WebAudio APIとAudio Output Devices APIを使用して、複数の音声出力デバイスから独立した波形を同時再生できるWebアプリケーションを構築します。

### 主な調整ポイント
- ディレクトリ構造をコロケーション原則に従って調整
- 状態管理（Jotai）の使用方法をルールに合わせて調整
- 型定義の配置を適切な場所に調整
- インポート/エクスポート方法をnamed importに統一

## メモと反省

- 新しいプロジェクト設計の調整作業を開始
- 既存のコーディングルールとの整合性を確保することが重要

## リポジトリ構造分析結果

- リポジトリは様々なWeb APIを使ったサンドボックスプロジェクトの集合体
- 主要プロジェクト：クロマティックボタンアコーディオン、データモッシング、線形合同法乱数予測ツールなど
- ルールファイル構成：
  - `global.mdc`: リポジトリ全体に適用されるツール・レッスン・スクラッチパッド使用法
  - `repository.mdc`: リポジトリ概要とプロジェクト一覧
  - `coding-rules.mdc`: 基本的なコーディングルールとディレクトリ構造
  - `eslint.mdc`: ESLint設定に関するルール
  - プロジェクト固有のルール（`button-accordion-with-keyboard.mdc`と`stradella-bass-system.mdc`）

## ルール間の整合性

- 基本的に整合性は保たれています
- 最近の変更：
  - `global.mdc`とScratchpad.mdの関係を明確化
  - Lessons.mdファイルを作成し、Lessonsに関する情報をglobal.mdcから分離
  - global.mdcに他のルールファイルとの関連性を明示的に記載
  - global.mdcを日本語化し、内容の一貫性を向上（コマンド例の文字列は技術的な正確性のため原文のまま）
  - README.mdとrepository.mdcを更新して新しいサポートファイルとルールファイルの情報を追加

## メモと反省

- リポジトリ内の個別プロジェクトは独立しているが、共通のコーディングルールで統一されている
- ルールファイルは適切に整理・構造化されている
- ルールの分割と再構成により、責任範囲がより明確になった
- 日本語化によりグローバルルールの一貫性が向上した
- コマンド例やプロンプトなどの技術的な文字列は原文のままにすることで正確性を確保
- ドキュメントとルールファイルの相互参照により、プロジェクト全体の把握がしやすくなった

## 実装完了

audio-multi-outputプロジェクトの実装が完了しました。

### 実装された機能
- DeviceManager: 音声出力デバイスの検出、選択、権限管理
- OscillatorControl: 各デバイスごとの波形、周波数、位相反転設定
- OutputController: 音声出力の制御、再生/停止機能
- App: メインアプリケーション、ブラウザサポートチェック
- 完全なREADMEドキュメント

### 技術的特徴
- コロケーション原則に基づく設計
- Jotaiによる状態管理（カスタムフック提供方式）
- TypeScriptによる型安全性
- Web Audio API、Audio Output Devices API、Media Devices APIの活用
- レスポンシブなUI設計 

## 追加タスク詳細

他のプロジェクトと同様に以下の設定を行います：
- Vite設定ファイルにaudio-multi-outputプロジェクトを追加
- メインのindex.htmlにプロジェクトリンクを追加
- プロジェクト内にSNSリンクを設置 

## 設定完了

audio-multi-outputプロジェクトの統合設定が完了しました。

### 完了した設定
- Vite設定ファイル（vite.config.ts）にaudio-multi-outputプロジェクトを追加
- メインのindex.htmlにプロジェクトリンクを追加（「Audio Multi Output - 複数デバイス音声出力」）
- ReactコンポーネントのSocialIconsを使用してSNSリンクを設置
- MUIベースの統一されたデザインでSNSリンクを表示

### 設定内容
- プロジェクトは他のプロジェクトと同様にマルチページアプリケーションとして設定
- 右上にSNSリンクが固定表示される（MUIのIconButtonとSvgIconを使用）
- 目次アイコンからメインページに戻ることが可能
- ブラウザサポートエラー画面でもSNSリンクが表示される

## API実装の更新

### 変更内容
- `selectAudioOutput` APIの代わりに`mediaDevices.enumerateDevices`と`AudioContext.setSinkId`を組み合わせた実装に変更
- `HTMLAudioElement.setSinkId`の代わりに`AudioContext.setSinkId`を使用
- `MediaStreamDestination`と`HTMLAudioElement`を使用した複雑な実装を、直接`AudioContext.destination`に接続するシンプルな実装に変更

### 技術的改善
- MDNドキュメントに基づく標準的なWeb Audio API実装
- Chrome 110以降でサポートされる`AudioContext.setSinkId`を活用
- 権限要求は`getUserMedia`を使用してデバイス列挙権限を取得
- ブラウザサポートチェックを`AudioContext.setSinkId`の実際の存在確認に更新

## ユーザビリティ改善

### 位相反転機能の制限事項説明追加
- メインページのフッターに「重要な制限事項」セクションを追加
- 位相反転機能がノイズキャンセリングには期待通りに機能しない可能性について説明
- PhaseSwitchコンポーネントに具体的な注意書きを追加

### アクセシビリティ改善
- 見出しレベルの階層を修正（h1 → h2 → h3の適切な順序）
- App.tsxのフッター見出しをh4からh2に変更
- DevicePanel.tsxの見出しをh4からh3に変更

## MUI適用

### 全コンポーネントのMUI化完了
- **DeviceManager**: Box、Typography、Alert、Button、Checkbox、FormControlLabel
- **DeviceSelector**: Box、Button、Checkbox、FormControlLabel、Typography
- **OscillatorControl**: Box、Typography、Card、CardContent
- **WaveformSelector**: FormControl、InputLabel、Select、MenuItem、Box
- **FrequencySlider**: Box、Typography、Slider
- **PhaseSwitch**: Box、FormControlLabel、Switch、Typography
- **OutputController**: Box、Typography、Divider
- **PlayButton**: Button、PlayArrow、Stopアイコン
- **DevicePanel**: Card、CardContent、Typography、Box、Chip、Stack
- **App**: Container、Grid2、Typography、Alert、Box、Paper、List、ListItem、ListItemText

### デザイン改善
- 統一されたMUIテーマによる一貫したデザイン
- レスポンシブレイアウト（Grid2、Container）
- 適切な余白とスペーシング（sx prop）
- カード形式による情報の整理
- アイコン付きボタンによる直感的なUI
- Chipによる設定値の視覚的表示

### 最新の更新
- 非推奨の`Grid`コンポーネントから`Grid2`に変更
- `Grid2`の新しいAPIに対応（`size`プロパティの使用）
- `PlayButton`コンポーネントを`Switch`に変更してトグルスイッチによる直感的なUI操作を実現
- 全体再生ボタンを実際の音声再生ではなく、各デバイスのトグルスイッチ状態を一括操作する機能に変更
- 重複再生問題を修正：既に再生中のデバイスでは新しい音声を開始しない、全体スイッチの状態を実際の再生状態に基づいて更新
- トグル状態変化による制御：スイッチのON/OFF状態変化で直接再生・停止を制御、より直感的なインターフェースを実現
- 位相反転スイッチの注意書きを削除してUIをすっきりと整理
