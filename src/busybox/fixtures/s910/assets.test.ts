import { readFile } from "node:fs/promises";
import { activeS910CueId, s910Cues } from "../../stages/S-910/functions";

const assetRoot = new URL("./assets/", import.meta.url);
const webmHeader = Buffer.from([0x1a, 0x45, 0xdf, 0xa3]);
const deterministicTrackUid = Buffer.from([
  0x73, 0xc5, 0x88, 0, 0, 0, 0, 0, 0, 0, 1,
]);

describe("S-910 fixed runtime caption fixture", () => {
  it("keeps the base video and expected overlay cue schedule", async () => {
    const manifest = JSON.parse(
      await readFile(new URL("generation-manifest.json", assetRoot), "utf8"),
    ) as {
      schemaVersion: number;
      generator: string;
      asset: string;
      frameRate: number;
      durationSeconds: number;
      width: number;
      height: number;
      visuals: Array<{ id: string; start: number; end: number }>;
      probe: {
        codec: string;
        width: number;
        height: number;
        averageFrameRate: string;
        durationSeconds: number;
      };
    };
    const video = await readFile(new URL(manifest.asset, assetRoot));
    expect(manifest.schemaVersion).toBe(2);
    expect(manifest.generator).toBe("ffmpeg");
    expect(manifest.frameRate).toBe(15);
    expect(manifest.durationSeconds).toBe(4);
    expect([manifest.width, manifest.height]).toEqual([640, 360]);
    expect(manifest.visuals).toEqual(s910Cues);
    expect(manifest.probe).toMatchObject({
      codec: "vp8",
      width: 640,
      height: 360,
      averageFrameRate: "15/1",
      durationSeconds: 4,
    });
    expect(video.subarray(0, 4)).toEqual(webmHeader);
    expect(video.byteLength).toBeGreaterThan(20_000);
    expect(video.indexOf(deterministicTrackUid)).toBeGreaterThanOrEqual(0);
  });

  it("maps each intended video moment to exactly one runtime cue", () => {
    expect(activeS910CueId(0.8)).toBe("circle");
    expect(activeS910CueId(1.9)).toBe("triangle");
    expect(activeS910CueId(3.1)).toBe("square");
    expect(activeS910CueId(0)).toBeUndefined();
  });
});
