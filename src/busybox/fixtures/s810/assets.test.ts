import { readFile } from "node:fs/promises";
import { classifyS810AspectRatio } from "../../stages/S-810/functions";

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

describe("S-810 fixed aspect-ratio seek fixture", () => {
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
    expect(manifest.segments[39]).toMatchObject({
      width: 3840,
      height: 144,
    });
    expect(manifest.segments[79]).toMatchObject({
      width: 144,
      height: 3840,
    });
    expect(manifest.segments[119]).toMatchObject({
      width: 3840,
      height: 3840,
    });

    expect(
      manifest.segments.slice(0, 40).every((segment) => segment.height === 144),
    ).toBe(true);
    expect(
      manifest.segments.slice(40, 80).every((segment, index) => {
        const previous = manifest.segments[39 + index];
        return (
          segment.width <= (previous?.width ?? Number.POSITIVE_INFINITY) &&
          segment.height >= (previous?.height ?? 0)
        );
      }),
    ).toBe(true);
    expect(
      manifest.segments.slice(80).every((segment) => segment.height === 3840),
    ).toBe(true);
  });

  it("contains a seekable frame within five percent of every target ratio", async () => {
    const manifest = JSON.parse(
      await readFile(new URL("generation-manifest.json", assetRoot), "utf8"),
    ) as SweepManifest;

    for (const target of [
      "square",
      "four-three",
      "sixteen-nine",
      "nine-twenty",
    ] as const) {
      expect(
        manifest.segments.some(
          (segment) =>
            classifyS810AspectRatio(segment.width, segment.height) === target,
        ),
      ).toBe(true);
    }
  });
});
