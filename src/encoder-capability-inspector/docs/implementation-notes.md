# 実装上の判断・注意点

以下は将来の変更時に意図を失わないための設計判断である。現在の実装が正本であり、ライブラリ更新などで前提が変われば実装とこの文書を合わせて見直す。

- 合成パターンは一括実用検査用と実用継続検査用を分離する。一括検査では入力生成を軽く保ち、継続検査では動きと圧縮耐性を持たせる。
- Node.js に WebCodecs はない。検査用サンプル出力は `node:zlib` だけで書ける APNG / PNG / WAV とし、ffmpeg や追加依存に頼らない。`npm run inspector:samples:check` は生データのハッシュを確認する。
- MUI の `Box component="canvas"` は `width` / `height` をスタイルとして扱うため、描画バッファの HTML 属性を渡せない。キャンバスは素の `canvas` を `styled` で包む。
- MUI の `Accordion` は閉じても子要素を DOM に残す。重いプレビューには `slotProps={{ transition: { unmountOnExit: true } }}` を指定する。
- 補足文付きの入力とボタンの横並びでは、親の `Stack` に `alignItems="flex-start"` を付ける。既定の stretch によりボタンが入力の高さまで伸びるのを防ぐ。
- `URL.createObjectURL` は `a.click()` の直後に同期で解放しない。ダウンロード開始後、次のタスクまで解放を待つ。
- `REPORT_VERSION` は実装上の定数を正本とする。合成パターンや計測の意味が変わった場合、旧レポートを互換対象外にするため版を上げる。
