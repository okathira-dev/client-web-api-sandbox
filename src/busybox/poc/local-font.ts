import type { PocRoot } from "./contracts";

type LocalFontDataLike = {
  family: string;
  fullName: string;
  postscriptName: string;
  style: string;
  blob: () => Promise<Blob>;
};

type QueryLocalFonts = (options: {
  postscriptNames: string[];
}) => Promise<LocalFontDataLike[]>;

export function mount(root: PocRoot): () => void {
  const status = root.querySelector<HTMLOutputElement>("#local-font-status");
  const nameInput = root.querySelector<HTMLInputElement>(
    "#local-font-postscript",
  );
  const glyph = root.querySelector<HTMLElement>("#local-font-glyph");
  let fontFace: FontFace | undefined;
  let fontUrl: string | undefined;

  const windowWithFonts = window as Window & {
    queryLocalFonts?: QueryLocalFonts;
  };

  const writeStatus = (message: string) => {
    if (status) status.value = message;
  };

  const clearLoadedFont = () => {
    if (fontFace) document.fonts.delete(fontFace);
    fontFace = undefined;
    if (fontUrl) URL.revokeObjectURL(fontUrl);
    fontUrl = undefined;
    if (glyph) glyph.style.removeProperty("font-family");
  };

  const scanButton = root.querySelector<HTMLButtonElement>("#scan-local-font");
  const clearButton =
    root.querySelector<HTMLButtonElement>("#clear-local-font");

  const scan = async () => {
    const queryLocalFonts = windowWithFonts.queryLocalFonts;
    const postscriptName = nameInput?.value.trim();
    if (!queryLocalFonts || !postscriptName) {
      writeStatus(
        "window.queryLocalFontsまたは対象PostScript名がありません。全font列挙やuploadへfallbackしません。",
      );
      return;
    }
    clearLoadedFont();
    try {
      const result = await queryLocalFonts({
        postscriptNames: [postscriptName],
      });
      if (result.length !== 1) {
        writeStatus(
          `限定照会結果=${result.length}件。期待する1件以外では開かない (${postscriptName})。`,
        );
        return;
      }
      const font = result[0];
      if (!font) {
        writeStatus("限定照会結果が空です。font dataは読み込みません。");
        return;
      }
      const blob = await font.blob();
      const bytes = await blob.arrayBuffer();
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      const checksum = [...new Uint8Array(digest)]
        .map((value) => value.toString(16).padStart(2, "0"))
        .join("");
      fontUrl = URL.createObjectURL(blob);
      fontFace = new FontFace("Busybox Local PoC", `url(${fontUrl})`);
      await fontFace.load();
      document.fonts.add(fontFace);
      if (glyph) glyph.style.fontFamily = '"Busybox Local PoC"';
      writeStatus(
        `限定照会・Blob・glyph表示に成功: ${font.postscriptName} / ${font.family} / ${font.style} / sha256=${checksum}`,
      );
    } catch (error) {
      writeStatus(
        `Local Font Access failed: ${error instanceof Error ? `${error.name}: ${error.message}` : "error"}`,
      );
    }
  };

  const clear = () => {
    clearLoadedFont();
    writeStatus(
      "FontData、FontFace、object URLを破棄しました。OS側のfont uninstallは別途行ってください。",
    );
  };

  scanButton?.addEventListener("click", scan);
  clearButton?.addEventListener("click", clear);

  return () => {
    scanButton?.removeEventListener("click", scan);
    clearButton?.removeEventListener("click", clear);
    clearLoadedFont();
  };
}
