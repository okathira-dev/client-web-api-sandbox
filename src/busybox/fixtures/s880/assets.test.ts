import { readFile } from "node:fs/promises";
import { gunzipSync, inflateRawSync, inflateSync } from "node:zlib";

const assetRoot = new URL("./assets/", import.meta.url);

type FixtureManifest = {
  schemaVersion: number;
  parcels: readonly {
    asset: string;
    format: "gzip" | "deflate" | "deflate-raw";
    marker: string;
    uncompressedBytes: number;
    compressedBytes: number;
  }[];
};

const decompressors = {
  gzip: gunzipSync,
  deflate: inflateSync,
  "deflate-raw": inflateRawSync,
} as const;

describe("S-880 fixed compression fixtures", () => {
  it("contains three deterministic compressed parcels with their expected payloads", async () => {
    const manifest = JSON.parse(
      await readFile(new URL("generation-manifest.json", assetRoot), "utf8"),
    ) as FixtureManifest;
    expect(manifest.schemaVersion).toBe(1);
    expect(manifest.parcels).toHaveLength(3);

    for (const parcel of manifest.parcels) {
      const compressed = await readFile(new URL(parcel.asset, assetRoot));
      const payload = decompressors[parcel.format](compressed);
      expect(compressed.byteLength).toBe(parcel.compressedBytes);
      expect(payload.byteLength).toBe(parcel.uncompressedBytes);
      expect(payload.toString("utf8")).toContain(`marker=${parcel.marker}`);
    }
  });
});
