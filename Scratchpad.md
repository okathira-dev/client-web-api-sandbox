# Scratchpad

## 現在のタスク

### audio-tone-lab モデム再設計 v2（完了）

- [x] ModemId / AcousticModem / registry / frame v3 (ATLV) / transferEngine
- [x] Quiet.js バックエンド（QUIET_AUDIBLE / QUIET_ULTRASONIC）
- [x] ggwave バックエンド（GGWAVE_AUDIBLE）
- [x] 自前 Web Audio（MFSK-4 / GMSK-WEB / FSK-FAST）
- [x] ModemWorkbench + ModemTuningPanel + ModemSurvey
- [x] 旧 phy/profileMatrix/DTMF 経路削除、README・テスト更新
- [x] `npm test` 80件・`npm run build` 成功

## 進捗状況

- 6モデム × 3バックエンド（quiet / ggwave / webaudio）に再構成
- DTMF 統一搬送を廃止し、各ライブラリ／自前変調に直接配線
- チューニングは catalog スキーマ + localStorage

## メモと反省

- `buildFrame` の bodyLen に messageId 長バイト分が抜けていた（修正済み）
- Web Audio ループバック復調は環境依存が強いため、ユニットテストは波形生成・Goertzel に限定
