import type { TranslationResource } from "../types";

const translation: TranslationResource = {
  accordion: {
    title: "PCキーボードで演奏できるクロマティックボタンアコーディオン",
    pitch: {
      base: "基準ピッチ",
      relative: "相対ピッチ[セント]",
      units: {
        cent: "セント",
        hz: "Hz",
      },
    },
    volume: "音量",
    reeds: {
      toggle: "リードスイッチ",
      bassNote: "ベース音のリード",
      chord: "コードのリード",
    },
    register: {
      title: "レジスタースイッチ",
      description: "（F1-F12, ドラッグで並び替え可能）",
    },
    audio: {
      device: "音声出力デバイス",
      errors: {
        permission: "オーディオデバイスへのアクセスを許可してください",
        browser:
          "お使いのブラウザは音声出力デバイスの選択をサポートしていません",
        change: "音声出力デバイスの変更に失敗しました: {{message}}",
      },
    },
    latency: {
      label: "音声出力の遅延時間",
      value: "{{ value }}ms",
      unavailable: "N/A",
      update: "更新間隔: {{ value }}",
      lookAhead: "先読み時間: {{ value }}",
      base: "基本遅延: {{ value }}",
      output: "出力遅延: {{ value }}",
      total: "遅延合計(先読み時間 + 基本遅延 + 出力遅延): {{ value }}",
    },
    display: {
      label: "筐体切り替え",
      left: "左手（伴奏）",
      right: "右手（メロディー）",
    },
  },
  keyboard: {
    tabs: {
      label: "キーボード表示",
      key: "キー（QWERTY）",
      note: "音階（C4, C#4, D4…）",
      en: "音階（C4, C#4, D4…）",
      ja: "音階（ドレミ）",
    },
    layout: {
      label: "キーボードレイアウト",
      en: "US（英字配列）",
      ja: "JIS（日本語配列）",
    },
  },
  common: {
    errors: {
      microphoneAccess: {
        denied: "マイクへのアクセスが拒否されました",
        required:
          "音声出力デバイスの変更を行うには、マイクへのアクセス権限が必要です。",
      },
      browserLimitations: {
        userInteractionRequired:
          "ブラウザの制限により、音声の再生には事前にユーザーの操作が必要です。",
        audioDeviceChangeUnsupported:
          "音声出力デバイスの変更には対応していないブラウザもあります。",
      },
      devices: {
        enumerationFailed: "デバイス一覧の取得に失敗しました: {{message}}",
        noOutputDevices: "出力デバイスが見つかりませんでした",
        unexpectedError: "予期せぬエラーが発生しました",
      },
    },
    actions: {
      enable: "音声を有効化",
    },
  },
};

export default translation;
