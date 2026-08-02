import { audioResultFixture, videoResultFixture } from "./__fixtures__/results";
import { estimateRetainedBytes } from "./sustained";

const withBitrate = (bitrate: number) =>
  videoResultFixture({
    requestedConfig: {
      codec: "avc1.640028",
      width: 1920,
      height: 1080,
      bitrate,
      framerate: 30,
    },
  });

describe("estimateRetainedBytes", () => {
  it("takes the highest bitrate, not the sum", () => {
    // 候補は 1 件ずつ処理して都度解放するので、山になるのは 1 件ぶん。
    expect(
      estimateRetainedBytes(
        [withBitrate(20_000_000), withBitrate(60_000_000)],
        10,
      ),
    ).toBe(75_000_000);
  });

  it("scales with the duration", () => {
    const results = [withBitrate(60_000_000)];
    expect(estimateRetainedBytes(results, 60)).toBe(450_000_000);
    expect(estimateRetainedBytes(results, 600)).toBe(4_500_000_000);
  });

  it("returns zero for an empty selection", () => {
    expect(estimateRetainedBytes([], 60)).toBe(0);
  });

  it("counts audio candidates too", () => {
    expect(estimateRetainedBytes([audioResultFixture()], 8)).toBe(128_000);
  });

  it("uses the representative bitrate for quantizer candidates", () => {
    const quantizer = videoResultFixture({
      bitrate: null,
      probeBitrate: 60_000_000,
      requestedConfig: {
        codec: "avc1.640028",
        width: 1920,
        height: 1080,
        framerate: 30,
        bitrateMode: "quantizer",
      },
    });
    expect(estimateRetainedBytes([quantizer], 10)).toBe(75_000_000);
  });
});
