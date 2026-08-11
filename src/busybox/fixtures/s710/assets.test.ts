import { readFile } from "node:fs/promises";

const assetRoot = new URL("./assets/", import.meta.url);
const webmHeader = Buffer.from([0x1a, 0x45, 0xdf, 0xa3]);

describe("S-710 fixed media fixtures", () => {
  it("keeps the dark-frame and QR-frame inputs Git-managed and non-empty", async () => {
    const manifest = JSON.parse(
      await readFile(new URL("generation-manifest.json", assetRoot), "utf8"),
    ) as {
      durationSeconds: number;
      blackWindow: readonly number[];
      qrWindow: readonly number[];
      qrPayload: string;
      assets: readonly string[];
    };
    expect(manifest.durationSeconds).toBe(10);
    expect(manifest.blackWindow).toEqual([4, 5]);
    expect(manifest.qrWindow).toEqual([4, 5]);
    expect(manifest.qrPayload).toBe("S710_QR_TEST");
    expect(manifest.assets).toEqual([
      "dark-frame-input.webm",
      "qr-frame-input.webm",
    ]);
    for (const name of manifest.assets) {
      const bytes = await readFile(new URL(name, assetRoot));
      expect(bytes.length).toBeGreaterThan(1024);
      expect(bytes.subarray(0, 4)).toEqual(webmHeader);
    }
  });
});
