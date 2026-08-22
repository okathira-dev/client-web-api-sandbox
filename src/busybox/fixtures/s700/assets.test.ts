import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "assets");

describe("S-700 fixed Remote Playback media", () => {
  it("keeps four unique finite slots with portable checksums", async () => {
    const manifest = JSON.parse(
      await readFile(resolve(root, "generation-manifest.json"), "utf8"),
    ) as {
      generator: string;
      assets: Array<{
        file: string;
        key: string;
        token: string;
        sha256: string;
        bytes: number;
        width: number;
        height: number;
        seconds: number;
        textRange: number[];
        qrRange: number[];
      }>;
    };
    expect(manifest.generator).toBe(
      "scripts/generate-busybox-s700-fixtures.mjs",
    );
    expect(manifest.assets).toHaveLength(4);
    expect(new Set(manifest.assets.map((asset) => asset.key)).size).toBe(4);
    expect(new Set(manifest.assets.map((asset) => asset.token)).size).toBe(4);
    for (const asset of manifest.assets) {
      expect(asset.key).toMatch(/^[a-z]+ [a-z]+$/u);
      expect(asset.token).toMatch(/^bbx-rp-[a-d]-[a-z0-9]+$/u);
      expect(asset).toMatchObject({
        width: 640,
        height: 360,
        seconds: 8,
        textRange: [0, 4],
        qrRange: [4, 8],
      });
      const video = await readFile(resolve(root, asset.file));
      expect(video.length).toBe(asset.bytes);
      expect(video.subarray(0, 4)).toEqual(
        Buffer.from([0x1a, 0x45, 0xdf, 0xa3]),
      );
      expect(createHash("sha256").update(video).digest("hex")).toBe(
        asset.sha256,
      );
    }
  });
});
