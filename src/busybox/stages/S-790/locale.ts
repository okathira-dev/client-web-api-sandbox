import { defineStageLocale } from "../locale";

export const locale = defineStageLocale({
  stageName: { ja: "活字の鍵", en: "The type key" },
  B01: { ja: "OS活字の箱", en: "Installed-type box" },
  download: { ja: "専用活字をダウンロード", en: "Download the dedicated font" },
  scan: { ja: "OSの活字を探す", en: "Find the OS font" },
  clear: { ja: "読み込んだ活字を破棄", en: "Release loaded font" },
  instruction: {
    ja: "ファイルをOS標準のfont previewからinstallし、このpageへ戻って限定照会します。",
    en: "Install the file through the OS font preview, then return and run the limited query.",
  },
  idle: {
    ja: "全fontは列挙せず、Busybox専用PostScript名だけを照会します。",
    en: "Only the Busybox PostScript name is queried; all fonts are never enumerated.",
  },
  scanning: {
    ja: "OSの専用活字を確認しています…",
    en: "Checking the dedicated OS font…",
  },
  success: {
    ja: "OSから戻った実font dataで専用glyphを表示しました。",
    en: "Rendered the dedicated glyph from real OS font data.",
  },
  missing: {
    ja: "専用活字が一件だけ見つかりません。install後に再試行します。",
    en: "Exactly one dedicated font was not found. Install it and try again.",
  },
  mismatch: {
    ja: "font dataがGit管理fixtureと一致しません。",
    en: "The font data does not match the Git-managed fixture.",
  },
  unavailable: {
    ja: "Local Font Access APIを利用できません。uploadやlocal()では代替しません。",
    en: "Local Font Access is unavailable; upload and local() are not substitutes.",
  },
  cancelled: {
    ja: "font照会は取消または失敗しました。",
    en: "The font query was cancelled or failed.",
  },
  cleared: {
    ja: "FontData、FontFace、object URLを破棄しました。OSのuninstallは端末側で行います。",
    en: "Released FontData, FontFace, and object URL. Uninstall the font in the OS.",
  },
  glyphLabel: { ja: "専用glyph", en: "Dedicated glyph" },
});
