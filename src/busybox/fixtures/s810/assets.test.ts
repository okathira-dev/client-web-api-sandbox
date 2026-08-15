import { readFile } from "node:fs/promises";

const assetRoot = new URL("./assets/", import.meta.url);
const webmHeader = Buffer.from([0x1a, 0x45, 0xdf, 0xa3]);

type SweepManifest = {
  schemaVersion: number;
  frameRate: number;
  frameCount: number;
  asset: string;
  segments: readonly {
    index: number;
    width: number;
    height: number;
    offset: number;
    length: number;
  }[];
};

describe("S-810 fixed resolution-sweep fixture", () => {
  it("keeps all native-size WebM segments in one portable pack", async () => {
    const manifest = JSON.parse(
      await readFile(new URL("generation-manifest.json", assetRoot), "utf8"),
    ) as SweepManifest;
    const pack = await readFile(new URL(manifest.asset, assetRoot));

    expect(manifest.schemaVersion).toBe(1);
    expect(manifest.frameRate).toBe(15);
    expect(manifest.frameCount).toBe(120);
    expect(manifest.segments).toHaveLength(120);
    expect(pack.length).toBeGreaterThan(100_000);

    let offset = 0;
    for (const [position, segment] of manifest.segments.entries()) {
      expect(segment.index).toBe(position);
      expect(segment.offset).toBe(offset);
      expect(segment.length).toBeGreaterThan(webmHeader.length);
      expect(pack.subarray(segment.offset, segment.offset + 4)).toEqual(
        webmHeader,
      );
      offset += segment.length;
    }
    expect(offset).toBe(pack.length);

    expect(manifest.segments[0]).toMatchObject({
      width: 144,
      height: 144,
    });
    expect(manifest.segments[29]).toMatchObject({
      width: 1080,
      height: 1080,
    });
    expect(manifest.segments[59]).toMatchObject({
      width: 144,
      height: 144,
    });
    expect(manifest.segments[89]).toMatchObject({
      width: 144,
      height: 1080,
    });
    expect(manifest.segments[119]).toMatchObject({
      width: 1080,
      height: 144,
    });
  });
});
