import { readFile } from "node:fs/promises";

const webmHeader = Buffer.from([0x1a, 0x45, 0xdf, 0xa3]);

const assetRoot = new URL("./assets/", import.meta.url);

type Manifest = {
  size: string;
  answers: Record<"t1" | "t2" | "alpha" | "beta", string>;
  routes: {
    "source-t1": readonly string[];
    "source-t2": readonly string[];
    "source-t3": {
      alpha: readonly string[];
      beta: readonly string[];
    };
  };
  assets: readonly { file: string }[];
};

async function manifest(): Promise<Manifest> {
  return JSON.parse(
    await readFile(new URL("generation-manifest.json", assetRoot), "utf8"),
  ) as Manifest;
}

describe("S-720 video recovery fixture", () => {
  it("keeps all generated WebM assets and the intended recovery routes", async () => {
    const fixture = await manifest();

    expect(fixture.size).toBe("360x360");
    expect(fixture.answers).toEqual({
      t1: "busybox{swap_halves}",
      t2: "busybox{merge_frames}",
      alpha: "busybox{odd_even_alpha}",
      beta: "busybox{swap_route_beta}",
    });
    expect(fixture.routes).toEqual({
      "source-t1": ["T1"],
      "source-t2": ["T2"],
      "source-t3": {
        alpha: ["T3", "T2"],
        beta: ["T1", "T3", "T2", "T1"],
      },
    });

    expect(fixture.assets.map((asset) => asset.file)).toEqual([
      "source-t1.webm",
      "source-t2.webm",
      "source-t3.webm",
      "t3-alpha-intermediate.webm",
      "t3-beta-intermediate.webm",
      "recovered-t1.webm",
      "recovered-t2.webm",
      "recovered-alpha.webm",
      "recovered-beta.webm",
    ]);

    for (const asset of fixture.assets) {
      const bytes = await readFile(new URL(asset.file, assetRoot));
      expect(bytes.length).toBeGreaterThan(webmHeader.length);
      expect(bytes.subarray(0, webmHeader.length)).toEqual(webmHeader);
    }
  });
});
