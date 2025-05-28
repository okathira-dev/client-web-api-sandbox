# Audio Multi Output

WebAudio APIとAudio Output Devices APIを活用した、複数の音声出力デバイスから独立した波形を同時再生できるWebアプリケーションです。

## 機能

- 複数の音声出力デバイスの検出と選択
- デバイスごとの独立した音声設定
  - 波形タイプ（sine, triangle, square, sawtooth）
  - 周波数（20Hz - 20kHz）
  - 位相反転
- リアルタイムでの設定変更
- 全デバイス一括制御と個別デバイス制御

## 技術仕様

### 使用技術

- React + TypeScript
- Jotai（状態管理）
- Web Audio API
- Audio Output Devices API
- Media Devices API

### ブラウザサポート

- Web Audio API対応ブラウザ
- Media Devices API対応ブラウザ
- Audio Output Devices API対応ブラウザ（推奨）

### 必要条件

- HTTPS接続
- ユーザーの操作（AudioContextの制約）
- マイクロフォンアクセス権限（デバイス一覧取得のために一瞬だけ必要）

## ディレクトリ構造

```plaintext
src/audio-multi-output/
├── features/
│   ├── DeviceManager/          # デバイス管理機能
│   │   ├── DeviceManager.tsx   # メインコンポーネント
│   │   ├── DeviceSelector.tsx  # デバイス選択UI
│   │   ├── atom.ts             # 状態管理
│   │   ├── functions.ts        # デバイス管理ロジック
│   │   ├── consts.ts           # 型定義・定数
│   │   └── index.ts            # 再エクスポート
│   ├── OscillatorControl/      # オシレーター制御機能
│   │   ├── OscillatorControl.tsx # メインコンポーネント
│   │   ├── WaveformSelector.tsx  # 波形選択UI
│   │   ├── FrequencySlider.tsx   # 周波数調整UI
│   │   ├── PhaseSwitch.tsx       # 位相反転UI
│   │   ├── atom.ts               # 状態管理
│   │   ├── consts.ts             # 型定義・定数
│   │   └── index.ts              # 再エクスポート
│   └── OutputController/       # 音声出力制御機能
│       ├── OutputController.tsx  # メインコンポーネント
│       ├── DevicePanel.tsx       # デバイス制御パネル
│       ├── PlayButton.tsx        # 再生/停止ボタン
│       ├── atom.ts               # 状態管理
│       ├── functions.ts          # 音声出力ロジック
│       └── index.ts              # 再エクスポート
├── atoms/
│   └── globalAtoms.ts          # グローバル状態管理
├── consts/
│   └── audioConsts.ts          # プロジェクト全体定数
├── utils/
│   └── audioUtils.ts           # 汎用ユーティリティ
├── App.tsx                     # メインアプリケーション
├── main.tsx                    # エントリーポイント
├── index.html                  # HTMLテンプレート
└── README.md                   # このファイル
```

## 使用方法

1. **デバイス選択権限の取得**

   - 「デバイス選択権限を要求」ボタンをクリック
   - ブラウザの権限ダイアログで許可

2. **音声出力デバイスの選択**

   - 検出されたデバイス一覧から使用したいデバイスを選択
   - 複数デバイスの同時選択が可能

3. **音声設定の調整**

   - 各デバイスごとに波形、周波数、位相反転を設定
   - 設定は再生中でもリアルタイムで反映

4. **音声再生**
   - 「再生」ボタンで全デバイス一括再生
   - 各デバイスパネルの再生ボタンで個別制御も可能

## 注意事項

- この機能にはHTTPS接続が必要です
- 初回再生時にはユーザーの操作が必要です（Web Audio APIの制約）
- ブラウザによっては複数デバイスへの同時出力に制限がある場合があります
- Audio Output Devices APIは実験的な機能のため、一部ブラウザでは利用できない可能性があります。

## 開発

### コーディングルール

このプロジェクトは、リポジトリ全体のコーディングルールに従って実装されています：

- コロケーション原則に基づくディレクトリ構造
- Jotaiを使用した状態管理（atomの直接エクスポートを避け、カスタムフックで提供）
- Named importの使用
- TypeScriptによる型安全性の確保

### 状態管理

- グローバル状態: `atoms/globalAtoms.ts`
- 機能別状態: 各機能ディレクトリの`atom.ts`
- カスタムフックによる状態アクセス

## 参考資料

- [Web Audio API - MDN](https://developer.mozilla.org/ja/docs/Web/API/Web_Audio_API)
- [Audio Output Devices API](https://developer.mozilla.org/ja/docs/Web/API/Audio_Output_Devices_API)
- [Media Devices API - MDN](https://developer.mozilla.org/ja/docs/Web/API/MediaDevices)
