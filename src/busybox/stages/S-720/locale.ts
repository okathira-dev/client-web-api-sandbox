import { defineStageLocale } from "../locale";

export const locale = defineStageLocale({
  stageName: { ja: "映像復元室", en: "Video recovery room" },
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
  canvasDescription: {
    ja: "接続済みの動画ケーブル",
    en: "Connected video cables",
  },
  sourcePrefix: { ja: "動画", en: "Video" },
  sourceAriaPrefix: { ja: "動画ソース", en: "Video source" },
  connectSourceOutput: {
    ja: "動画ソースの出力を接続",
    en: "Connect video source output",
  },
  connectNodeInput: {
    ja: "変換ノードの入力を接続",
    en: "Connect transform input",
  },
  connectNodeOutput: {
    ja: "変換ノードの出力を接続",
    en: "Connect transform output",
  },
  connectOutput: {
    ja: "動画出力の入力を接続",
    en: "Connect video output input",
  },
  silentFixture: { ja: "無音fixture", en: "Silent fixture" },
  silentOutput: { ja: "無音の出力", en: "Silent output" },
  outputIdle: { ja: "動画出力は待機中", en: "Video output idle" },
  outputLabel: { ja: "出力", en: "OUTPUT" },
  flagLabel: { ja: "flag", en: "flag" },
  unknownError: { ja: "不明なエラー", en: "unknown error" },
  B01: { ja: "T1の箱", en: "T1 box" },
  B02: { ja: "T2の箱", en: "T2 box" },
  B03: { ja: "T3の箱", en: "T3 box" },
  B04: { ja: "QR復元の箱", en: "QR-recovery box" },
});
