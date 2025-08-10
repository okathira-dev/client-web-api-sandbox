# 要件・設計（PDF Compressor / Ghostscript WASM）

## 対象 / デプロイ
- 対象: 最新版 Chrome（デスクトップ）。オフライン/PWA は非対応
- デプロイ: 本リポジトリの GitHub Pages。`gs.js`/`.wasm` は同梱し遅延ロード

## 入出力
- 入力: 単一PDF（`<input type="file">`）、~20MB まで（MVP）
- 出力: ダウンロードボタンで保存
- ファイル名: `<original>_compressed_YYYYMMDD-HHmmss.pdf`

## WASM実行
- Ghostscript（ps-wasm, AGPL-3.0）を Web Worker 上で実行（メインスレッド非ブロック）
- 固定パス: `/working/input.pdf` → `/working/output.pdf`
- Emscripten: `ALLOW_MEMORY_GROWTH=1`
- 失敗時: OOM等は明確なエラー表示

## 既定オプション（GUI）
- 常時: `-sDEVICE=pdfwrite -dNOPAUSE -dQUIET -dBATCH`
- プリセット: `-dPDFSETTINGS=/ebook`（既定）
- 互換性: `-dCompatibilityLevel=1.4`
- 画像:
  - Color: `-dDownsampleColorImages=true -dColorImageResolution=150 -dColorImageDownsampleType=/Bicubic`
  - Gray:  `-dDownsampleGrayImages=true -dGrayImageResolution=150`
  - Mono:  `-dDownsampleMonoImages=true -dMonoImageResolution=300`
- フォント: `-dEmbedAllFonts=true -dSubsetFonts=true -dCompressFonts=true`
- その他: `-dDetectDuplicateImages=true -dAutoRotatePages=/None`

## カスタムモード
- 任意引数を許可。ただし `-sDEVICE=pdfwrite` と入出力パスは固定
- コマンドのコピーボタンを提供

## UX
- MVP: ファイル選択 → GUIでオプション調整 → コマンド表示/編集 → 実行 → サイズ差表示 → ダウンロード
- 変換後: 入出力サイズと比率を表示
- サイズ予測: 後フェーズ
- テーマ: 信頼感重視（MUIベース）

## スコープ外（現段階）
- PS/EPS 入力（対応予定なし）
- オフライン/PWA
- 複数ファイル
- 暗号化PDF（後フェーズ）

## CI / バージョン
- ps-wasm/Ghostscript の最新安定版を利用
- 週次で新リリース検知 → 自動PR作成

## 参考
- ps-wasm: <https://github.com/ochachacha/ps-wasm>
- ブログ（WASM + Ghostscript）: <https://meyer-laurent.com/playing-around-webassembly-and-ghostscript>
- サンプルPDF: <https://github.com/py-pdf/sample-files>

## MVP成果物
- 既定値とカスタムモードを備えたUI（コピーボタン付）
- Worker連携でのGhostscript実行、WASM遅延ロード
- 明確なエラー表示、サイズ差表示、手動ダウンロード