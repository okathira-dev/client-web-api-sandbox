import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "assets");

describe("S-790 dedicated local font fixture", () => {
  it("matches its portable manifest and contains the required OpenType tables", async () => {
    const manifest = JSON.parse(
      await readFile(resolve(root, "generation-manifest.json"), "utf8"),
    ) as {
      asset: string;
      postscriptName: string;
      glyph: string;
      sha256: string;
      bytes: number;
      generator: string;
      derivedFromThirdPartyFont: boolean;
    };
    const font = await readFile(resolve(root, manifest.asset));
    expect(manifest.generator).toBe("scripts/generate-busybox-s790-font.mjs");
    expect(manifest.postscriptName).toBe("BusyboxKey-Regular");
    expect(manifest.glyph).toBe("U+E000");
    expect(manifest.derivedFromThirdPartyFont).toBe(false);
    expect(font.length).toBe(manifest.bytes);
    expect(createHash("sha256").update(font).digest("hex")).toBe(
      manifest.sha256,
    );
    expect(font.readUInt32BE(0)).toBe(0x00010000);
    const numTables = font.readUInt16BE(4);
    const tags = Array.from({ length: numTables }, (_, index) =>
      font.toString("ascii", 12 + index * 16, 16 + index * 16),
    );
    expect(tags).toEqual(
      expect.arrayContaining([
        "OS/2",
        "cmap",
        "glyf",
        "head",
        "hhea",
        "hmtx",
        "loca",
        "maxp",
        "name",
        "post",
      ]),
    );
  });
});
