# audio-tone-lab

実音響（スピーカー送信・マイク受信）で **6 種類のモデム** を比較するラボです。  
Quiet.js・ggwave・自前 Web Audio の 3 バックエンドに集約しています。

## 6 モデム

| ID | 名称 | バックエンド | 用途 |
|----|------|-------------|------|
| `QUIET_AUDIBLE` | Quiet Audible | quiet-js | 実用・可聴 GMSK（推奨） |
| `GGWAVE_AUDIBLE` | ggwave Audible | npm `ggwave` | 短文・実用 FSK+ECC |
| `MFSK_AUDIBLE_4` | MFSK-4 自前 | Web Audio | 4 トーン FSK（チューニング可） |
| `GMSK_WEB` | GMSK 自前 | Web Audio | GMSK 近似（Quiet 風） |
| `QUIET_ULTRASONIC` | Quiet Ultrasonic | quiet-js | 近超音波 ~19kHz |
| `FSK_TUNABLE_FAST` | FSK 高速 | Web Audio | 2-FSK 高速・実験 |

## できること

- 送信 / 受信モードの端末役割分離
- モデムごとの **スキーマ駆動チューニング**（プリセット: 既定 / 堅牢 / 高速）
- `localStorage` にチューニング保存（`audio-tone-lab-modem-tuning:{modemId}`）
- 推定転送時間・進捗・活動ログ
- テキスト / ファイル送受信、結果ダッシュボード

## 使い方

1. 受信端末でアプリを開き、**同じモデム** を選択
2. チューニング（プリセット）を送信側と揃える
3. 受信端末で「受信待機開始」（マイク許可）
4. 送信端末でペイロードを選び「送信開始」

## ブラウザ制約

- **Quiet 受信**: Chrome / Edge 推奨。音量は 50% 以下推奨（[Quiet.js](https://quiet.github.io/quiet-js/)）
- **Quiet Ultrasonic**: Firefox 受信非対応、Safari は不安定
- **ggwave 超音波**: Safari に制限あり
- マイクは HTTPS 推奨。制約は `echoCancellation` / `noiseSuppression` / `autoGainControl` を OFF

## アーキテクチャ

```
domain/modems/          # 6 モデム catalog / registry / backends
domain/pipeline/        # ATLV フレーム v3、transferEngine
domain/protocol/        # resultsStore (IndexedDB)
features/
  ModemWorkbench/       # 送受信 UI
  ModemTuningPanel/       # チューニング UI
  ModemSurvey/            # 比較表・文献リンク
```

## 参考文献

- [Quiet.js](https://quiet.github.io/quiet-js/) / [libquiet](https://github.com/quiet/quiet)
- [ggwave](https://github.com/ggerganov/ggwave) — [論文 arXiv:2103.11261](https://arxiv.org/abs/2103.11261)
- [Bell 202 / AFSK](https://en.wikipedia.org/wiki/Bell_202_modem)（自前 FSK の参考）

## 開発

```bash
npm run dev
# audio-tone-lab: http://localhost:5173/audio-tone-lab/
npm test
npm run build
```
