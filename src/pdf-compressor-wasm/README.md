# PDF Compressor (Ghostscript WASM)

クライアントサイドのみでPDFを圧縮するWebアプリの設計・技術調査メモ。

参照:

- ps-wasm (Ghostscript WASM ラッパー) — <https://github.com/ochachacha/ps-wasm>
- Blog: Playing around with Webassembly: Ghostscript — <https://meyer-laurent.com/playing-around-webassembly-and-ghostscript>

## 目的

- 完全クライアントサイドでPDF圧縮（プライバシー保護）
- GUIで代表的なオプション設定（品質/解像度/互換性 等）
- 上級者向けのカスタムコマンド入力モード

## 想定UI

- 基本モード: `/screen`, `/ebook`, `/printer`, `/prepress` などのプリセット + 互換性(1.3/1.4/1.5)
- 詳細モード: 画像ダウンサンプル(`-dDownsample*`, `*ImageResolution`), DownsampleType, フォント埋め込み 等
- カスタムモード: 自由入力（安全のため `-sDEVICE=pdfwrite` は固定）

## 実行フロー（概略）

1. `<input type="file">` でPDF選択 → `URL.createObjectURL`
2. XHR(ArrayBuffer) → Emscripten FS に `input.pdf`
3. `gs` 引数を組み立てて実行（例: `-sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile=/working/output.pdf /working/input.pdf`）
4. `output.pdf` をFSから読み出しBlob化 → ダウンロード
5. `Module.setStatus` をパースして進捗表示

## 技術選定/構成

- React + Vite（本リポジトリ標準） / 状態: Jotai / UI: MUI
- WASMはWeb Workerで実行（UIスレッドをブロックしない）
- `gs.js`/`.wasm` は動的import（必要時のみ読込）
- メモリ対策: `ALLOW_MEMORY_GROWTH=1`、進捗/キャンセル導線

## リスク/注意

- 大きいPDFでメモリ/CPU負荷が高い可能性
- Chromium優先対応（Firefox/Safariは別途検証）
- ライセンス: ps-wasm/GhostscriptはAGPL-3.0 → ソース開示・表記・改変点明記

## MVP

- `/ebook` プリセットで圧縮→DLまで
- 進捗表示・エラーハンドリング

## 次フェーズ

- 代表オプションのGUI化
- カスタムコマンドモード
- キャンセル/複数ファイル/ドラッグ&ドロップ、PWA化
