import { readFile } from "node:fs/promises";
import { hasS900CorrectOrder } from "../../stages/S-900/functions";

const assetRoot = new URL("./assets/", import.meta.url);
const webmHeader = Buffer.from([0x1a, 0x45, 0xdf, 0xa3]);
const deterministicTrackUid = Buffer.from([
  0x73, 0xc5, 0x88, 0, 0, 0, 0, 0, 0, 0, 1,
]);
const deterministicTagTrackUid = Buffer.from([
  0x63, 0xc5, 0x88, 0, 0, 0, 0, 0, 0, 0, 1,
]);

type Manifest = {
  schemaVersion: number;
  generator: string;
  mimeType: string;
  frameRate: number;
  width: number;
  height: number;
  leadIn: Segment;
  reels: Record<"A" | "B" | "C" | "D", Segment>;
  probe: {
    codec: string;
    width: number;
    height: number;
    averageFrameRate: string;
    durationSeconds: number;
  };
};

type Segment = { file: string; frames: number };

describe("S-900 fixed MediaSource fixture", () => {
  it("keeps one lead-in and four VP8 WebM reel segments", async () => {
    const manifest = JSON.parse(
      await readFile(new URL("generation-manifest.json", assetRoot), "utf8"),
    ) as Manifest;
    expect(manifest.schemaVersion).toBe(2);
    expect(manifest.generator).toBe("ffmpeg");
    expect(manifest.mimeType).toBe('video/webm; codecs="vp8"');
    expect(manifest.frameRate).toBe(15);
    expect([manifest.width, manifest.height]).toEqual([640, 360]);
    expect(manifest.leadIn.frames).toBe(8);
    expect(Object.values(manifest.reels).map((reel) => reel.frames)).toEqual([
      15, 15, 15, 15,
    ]);
    expect(manifest.probe).toMatchObject({
      codec: "vp8",
      width: 640,
      height: 360,
      averageFrameRate: "15/1",
    });
    for (const segment of [manifest.leadIn, ...Object.values(manifest.reels)]) {
      const bytes = await readFile(new URL(segment.file, assetRoot));
      expect(bytes.subarray(0, 4)).toEqual(webmHeader);
      expect(bytes.byteLength).toBeGreaterThan(5_000);
      expect(bytes.indexOf(deterministicTrackUid)).toBeGreaterThanOrEqual(0);
      expect(bytes.indexOf(deterministicTagTrackUid)).toBeGreaterThanOrEqual(0);
    }
  });

  it("recognizes only the intended reel sequence", () => {
    expect(hasS900CorrectOrder(["A", "B", "C", "D"])).toBe(true);
    expect(hasS900CorrectOrder(["A", "C", "B", "D"])).toBe(false);
  });
});
