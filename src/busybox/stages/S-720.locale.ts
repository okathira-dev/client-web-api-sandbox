import type { StageLocaleText } from "./locale";

export const s720Locale = {
  connectPrompt: {
    ja: "動画ノードを出力へつないでください。",
    en: "Connect a source to the output.",
  },
  direct: {
    ja: "動画を直接出力へ接続しました。",
    en: "Direct source connection.",
  },
  applying: {
    ja: "接続した変換を適用中…",
    en: "Applying the connected transforms…",
  },
  ready: { ja: "出力動画の準備完了。", en: "Output ready." },
  failed: { ja: "変換に失敗しました", en: "Transform failed" },
  disconnect: { ja: "ケーブルを外す", en: "Disconnect all" },
  patchBay: { ja: "動画変換の配線盤", en: "Video transform patch bay" },
  output: { ja: "変換後の動画出力", en: "Transformed video output" },
} satisfies Record<string, StageLocaleText>;
