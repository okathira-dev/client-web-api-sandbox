import type { ModemCatalogEntry, ModemId, TuningPresetId } from "./types";

const COMMON_RX: ModemCatalogEntry["tuningSchema"] = [
  {
    key: "inputGain",
    label: "入力ゲイン",
    type: "number",
    min: 1,
    max: 4,
    step: 0.1,
    description: "マイク入力のブースト（Web Audio モデム / 参考値）",
  },
  {
    key: "detectionMode",
    label: "検出モード",
    type: "select",
    options: [
      { value: "auto", label: "自動" },
      { value: "manual", label: "手動" },
    ],
  },
];

export const MODEM_CATALOG: Record<ModemId, ModemCatalogEntry> = {
  QUIET_AUDIBLE: {
    id: "QUIET_AUDIBLE",
    label: "Quiet Audible",
    shortDescription: "libquiet GMSK 可聴帯（実績あり）",
    backend: "quiet",
    bandDescription: "可聴 ~4kHz GMSK",
    capabilities: {
      supportsLiveSpeakerMic: true,
      estimatedBitrateBps: { min: 800, typical: 2000, max: 4000 },
      robustness: "high",
      speed: "medium",
      experimental: false,
      browserNotes: "受信は Chrome/Edge 推奨。音量は 50% 以下推奨。",
    },
    references: [
      { title: "Quiet.js", url: "https://quiet.github.io/quiet-js/" },
      { title: "libquiet", url: "https://github.com/quiet/quiet" },
    ],
    tuningSchema: [
      {
        key: "profile",
        label: "Quiet プロファイル",
        type: "select",
        options: [
          { value: "audible", label: "audible" },
          { value: "audible-7k-channel-0", label: "audible-7k-channel-0" },
          { value: "audible-fsk-robust", label: "audible-fsk-robust" },
        ],
      },
      {
        key: "clampFrame",
        label: "フレーム重なり防止",
        type: "boolean",
      },
    ],
    presets: {
      default: { profile: "audible", clampFrame: true },
      robust: { profile: "audible-fsk-robust", clampFrame: true },
      fast: { profile: "audible-7k-channel-0", clampFrame: false },
    },
  },
  QUIET_ULTRASONIC: {
    id: "QUIET_ULTRASONIC",
    label: "Quiet Ultrasonic",
    shortDescription: "libquiet 近超音波 ~19kHz",
    backend: "quiet",
    bandDescription: "近超音波 ~19kHz",
    capabilities: {
      supportsLiveSpeakerMic: true,
      estimatedBitrateBps: { min: 1000, typical: 3000, max: 6000 },
      robustness: "medium",
      speed: "medium",
      experimental: true,
      browserNotes: "Firefox 受信非対応。Safari は不安定。",
    },
    references: [
      { title: "Quiet.js", url: "https://quiet.github.io/quiet-js/" },
      {
        title: "Near-Ultrasonic Communication (arXiv)",
        url: "https://arxiv.org/abs/2103.11261",
      },
    ],
    tuningSchema: [
      {
        key: "profile",
        label: "Quiet プロファイル",
        type: "select",
        options: [
          { value: "ultrasonic", label: "ultrasonic" },
          {
            value: "ultrasonic-experimental",
            label: "ultrasonic-experimental",
          },
          { value: "ultrasonic-fsk-robust", label: "ultrasonic-fsk-robust" },
        ],
      },
      { key: "clampFrame", label: "フレーム重なり防止", type: "boolean" },
    ],
    presets: {
      default: { profile: "ultrasonic", clampFrame: true },
      robust: { profile: "ultrasonic-fsk-robust", clampFrame: true },
      fast: { profile: "ultrasonic-experimental", clampFrame: false },
    },
  },
  GGWAVE_AUDIBLE: {
    id: "GGWAVE_AUDIBLE",
    label: "ggwave Audible",
    shortDescription: "ggwave FSK + ECC（npm WASM）",
    backend: "ggwave",
    bandDescription: "可聴 FSK",
    capabilities: {
      supportsLiveSpeakerMic: true,
      estimatedBitrateBps: { min: 8, typical: 16, max: 32 },
      robustness: "high",
      speed: "low",
      experimental: false,
      browserNotes: "短文向け。超音波は Safari で制限あり。",
    },
    references: [
      { title: "ggwave", url: "https://github.com/ggerganov/ggwave" },
    ],
    tuningSchema: [
      {
        key: "protocol",
        label: "プロトコル",
        type: "select",
        options: [
          { value: "audible-fast", label: "Audible Fast" },
          { value: "audible-fast-short", label: "Audible Fast Short" },
          { value: "normal", label: "Normal" },
          { value: "fast", label: "Fast" },
        ],
      },
      {
        key: "volume",
        label: "音量",
        type: "number",
        min: 5,
        max: 50,
        step: 1,
      },
    ],
    presets: {
      default: { protocol: "audible-fast", volume: 20 },
      robust: { protocol: "normal", volume: 15 },
      fast: { protocol: "fast", volume: 25 },
    },
  },
  MFSK_AUDIBLE_4: {
    id: "MFSK_AUDIBLE_4",
    label: "MFSK-4 自前",
    shortDescription: "4トーン FSK（Web Audio）",
    backend: "webaudio",
    bandDescription: "2–6kHz 4値FSK",
    capabilities: {
      supportsLiveSpeakerMic: true,
      estimatedBitrateBps: { min: 200, typical: 600, max: 1200 },
      robustness: "medium",
      speed: "medium",
      experimental: true,
      browserNotes: "周波数・シンボル長のチューニングが効く。",
    },
    references: [
      { title: "ggwave (参考)", url: "https://github.com/ggerganov/ggwave" },
    ],
    tuningSchema: [
      {
        key: "symbolMs",
        label: "シンボル長 (ms)",
        type: "number",
        min: 30,
        max: 200,
        step: 5,
      },
      {
        key: "gapMs",
        label: "ギャップ (ms)",
        type: "number",
        min: 5,
        max: 50,
        step: 1,
      },
      {
        key: "txGain",
        label: "送信ゲイン",
        type: "number",
        min: 0.02,
        max: 0.2,
        step: 0.01,
      },
      {
        key: "freq0",
        label: "トーン0 (Hz)",
        type: "number",
        min: 1000,
        max: 3000,
        step: 50,
      },
      {
        key: "freq1",
        label: "トーン1 (Hz)",
        type: "number",
        min: 1500,
        max: 3500,
        step: 50,
      },
      {
        key: "freq2",
        label: "トーン2 (Hz)",
        type: "number",
        min: 2000,
        max: 4500,
        step: 50,
      },
      {
        key: "freq3",
        label: "トーン3 (Hz)",
        type: "number",
        min: 2500,
        max: 5500,
        step: 50,
      },
      ...COMMON_RX,
    ],
    presets: {
      default: {
        symbolMs: 80,
        gapMs: 15,
        txGain: 0.08,
        freq0: 1800,
        freq1: 2200,
        freq2: 2600,
        freq3: 3000,
        inputGain: 2,
        detectionMode: "auto",
      },
      robust: { symbolMs: 100, gapMs: 20, txGain: 0.07 },
      fast: { symbolMs: 50, gapMs: 8, txGain: 0.09 },
    },
  },
  GMSK_WEB: {
    id: "GMSK_WEB",
    label: "GMSK 自前",
    shortDescription: "GMSK 近似（Quiet 風・Web Audio）",
    backend: "webaudio",
    bandDescription: "3–5kHz 連続位相FSK",
    capabilities: {
      supportsLiveSpeakerMic: true,
      estimatedBitrateBps: { min: 300, typical: 900, max: 1800 },
      robustness: "medium",
      speed: "medium",
      experimental: true,
      browserNotes: "中心周波数とシンボル率を環境に合わせて調整。",
    },
    references: [
      { title: "Quiet.js", url: "https://quiet.github.io/quiet-js/" },
    ],
    tuningSchema: [
      {
        key: "centerHz",
        label: "中心周波数 (Hz)",
        type: "number",
        min: 2000,
        max: 6000,
        step: 100,
      },
      {
        key: "deviationHz",
        label: "偏差 (Hz)",
        type: "number",
        min: 200,
        max: 1500,
        step: 50,
      },
      {
        key: "symbolMs",
        label: "シンボル長 (ms)",
        type: "number",
        min: 20,
        max: 120,
        step: 5,
      },
      {
        key: "txGain",
        label: "送信ゲイン",
        type: "number",
        min: 0.02,
        max: 0.2,
        step: 0.01,
      },
      ...COMMON_RX,
    ],
    presets: {
      default: {
        centerHz: 4200,
        deviationHz: 600,
        symbolMs: 40,
        txGain: 0.08,
        inputGain: 2,
        detectionMode: "auto",
      },
      robust: { symbolMs: 55, deviationHz: 500, txGain: 0.07 },
      fast: { symbolMs: 28, deviationHz: 800, txGain: 0.09 },
    },
  },
  FSK_TUNABLE_FAST: {
    id: "FSK_TUNABLE_FAST",
    label: "FSK 高速",
    shortDescription: "2-FSK 最小構成（高速・実験）",
    backend: "webaudio",
    bandDescription: "可聴 2-FSK",
    capabilities: {
      supportsLiveSpeakerMic: true,
      estimatedBitrateBps: { min: 400, typical: 1200, max: 2400 },
      robustness: "low",
      speed: "high",
      experimental: true,
      browserNotes: "FEC なし。ノイズに弱い。",
    },
    references: [
      {
        title: "Bell 202 / AFSK",
        url: "https://en.wikipedia.org/wiki/Bell_202_modem",
      },
    ],
    tuningSchema: [
      {
        key: "markHz",
        label: "Mark 周波数 (Hz)",
        type: "number",
        min: 800,
        max: 2500,
        step: 50,
      },
      {
        key: "spaceHz",
        label: "Space 周波数 (Hz)",
        type: "number",
        min: 1200,
        max: 3500,
        step: 50,
      },
      {
        key: "baud",
        label: "ボー rate (sym/s)",
        type: "number",
        min: 10,
        max: 80,
        step: 5,
      },
      {
        key: "txGain",
        label: "送信ゲイン",
        type: "number",
        min: 0.02,
        max: 0.2,
        step: 0.01,
      },
      {
        key: "useFec",
        label: "簡易CRC",
        type: "boolean",
      },
      ...COMMON_RX,
    ],
    presets: {
      default: {
        markHz: 1200,
        spaceHz: 2200,
        baud: 30,
        txGain: 0.09,
        useFec: true,
        inputGain: 2.5,
        detectionMode: "auto",
      },
      robust: { baud: 20, useFec: true },
      fast: { baud: 50, useFec: false },
    },
  },
};

export function getModemCatalogEntry(modemId: ModemId) {
  return MODEM_CATALOG[modemId];
}

export function getModemLabel(modemId: ModemId | undefined) {
  if (modemId == null) return "不明";
  const entry = MODEM_CATALOG[modemId];
  if (entry) return entry.label;
  if (modemId.startsWith("legacy:")) {
    return `旧方式 (${modemId.slice("legacy:".length)})`;
  }
  return String(modemId);
}

export function listModemCatalogEntries() {
  return Object.values(MODEM_CATALOG);
}

export function getPresetLabel(preset: TuningPresetId) {
  switch (preset) {
    case "default":
      return "既定";
    case "robust":
      return "堅牢";
    case "fast":
      return "高速";
    case "custom":
      return "カスタム";
  }
}
