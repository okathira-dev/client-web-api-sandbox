import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const assetRoot = new URL("../../public/busybox/", import.meta.url);

describe("S-510 fixed drag fixtures", () => {
  it("keeps the three player-facing images fixed and documented", async () => {
    const manifest = JSON.parse(
      await readFile(new URL("drag-fixtures-manifest.json", assetRoot), "utf8"),
    ) as {
      width: number;
      height: number;
      assets: readonly {
        name: string;
        purpose: string;
        sha256: string;
      }[];
    };
    expect(manifest.width).toBe(240);
    expect(manifest.height).toBe(120);
    const playerAssets = manifest.assets.filter((asset) =>
      ["drag-page.png", "drag-file.png", "drag-window.png"].includes(
        asset.name,
      ),
    );
    expect(playerAssets).toHaveLength(3);
    for (const asset of playerAssets) {
      const bytes = await readFile(new URL(asset.name, assetRoot));
      expect(bytes.length).toBeGreaterThan(100);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(
        asset.sha256,
      );
    }
  });
});
