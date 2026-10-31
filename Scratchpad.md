# Scratchpad

## レーザー検出検証PoC: Codex への引き継ぎ文書の追加

- [x] `src/laser-detection-poc/` に index.html + main.ts + style.css + README.md で配置し、登録3点（vite.config.ts / src/index.html / ルート README.md）を追加（`npm run check` / `npm run build` 成功）
- [x] ブランチ feat/laser-detection-poc へ push し、PR #620 を作成
- [x] PR #620 の追加行の個人情報チェック（該当なし）
- [x] 現状とやりたいことを `src/laser-detection-poc/HANDOVER.md` にまとめ、本ブランチへ追加

## 結果と引き継ぎ

- 詳細は `src/laser-detection-poc/HANDOVER.md` を正とする（目的・調査結論・実装状態・未検証範囲・次の作業候補・未決定事項）。
- 未完了の主なもの: PR #620 のマージ（署名必須ルールに当たる可能性あり）、マージ後の GitHub Pages での実カメラ実機確認、実測に基づく検出方式の絞り込み。
- 教訓: 単体HTMLの検証ページをこのリポジトリへ移植する場合は、最初から vanilla 分離構成にすると lint 対応が最小で済む。CodeSandbox（外部サービス）と client-web-api-sandbox（このリポジトリ）は別物なので混同しない。
