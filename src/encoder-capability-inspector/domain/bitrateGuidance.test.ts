import { AUDIO_CANDIDATES, VIDEO_CANDIDATES } from "../consts/candidates";
import { getBitrateGuidance, guidanceKey } from "./bitrateGuidance";

describe("bitrate guidance catalog", () => {
  it("keeps codec support facts separate from the inspector test value", () => {
    const candidate = VIDEO_CANDIDATES.find(
      (item) => item.codec === "avc1.42E028",
    );
    expect(candidate).toBeDefined();
    if (!candidate) throw new Error("test candidate is missing");
    const h264 = getBitrateGuidance(candidate);
    expect(h264.support[0]).toMatchObject({
      kind: "range",
      max: 20_000_000,
      source: "h264-standard",
    });
    expect(h264.recommendations[0]).toMatchObject({
      kind: "target",
      value: 8_000_000,
      source: "youtube-upload",
    });
    expect(h264.testBitrate).toBe(8_000_000);
  });

  it("includes the official Opus range and usage recommendations", () => {
    const candidate = AUDIO_CANDIDATES.find((item) => item.family === "opus");
    expect(candidate).toBeDefined();
    if (!candidate) throw new Error("test candidate is missing");
    const opus = getBitrateGuidance(candidate);
    expect(opus.support[0]).toMatchObject({
      min: 6_000,
      max: 510_000,
      source: "opus-rfc",
    });
    expect(opus.recommendations).toHaveLength(5);
  });

  it("shows the AAC bitrate differences across the three target environments", () => {
    const candidate = AUDIO_CANDIDATES.find((item) => item.family === "aac");
    expect(candidate).toBeDefined();
    if (!candidate) throw new Error("test candidate is missing");
    const aac = getBitrateGuidance(candidate);
    expect(aac.support).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "discrete",
          values: [96_000, 128_000, 160_000, 192_000],
          source: "aac-chromium-windows",
          context: "windowsChromium",
        }),
        expect.objectContaining({
          kind: "dynamic",
          source: "aac-chromium-macos",
          context: "macChromium",
        }),
        expect.objectContaining({
          kind: "dynamic",
          source: "aac-safari-macos",
          context: "macSafari",
        }),
      ]),
    );
  });

  it("describes codec quantizer ranges, quality direction, and targets", () => {
    const av1 = VIDEO_CANDIDATES.find((item) => item.family === "av1");
    const vp9 = VIDEO_CANDIDATES.find((item) => item.family === "vp9");
    expect(av1).toBeDefined();
    expect(vp9).toBeDefined();
    if (!av1 || !vp9) throw new Error("test candidates are missing");

    expect(getBitrateGuidance(av1).quantizer).toMatchObject({
      comparisonValue: 32,
      qualityDirection: "lowerIsHigherQuality",
    });
    expect(getBitrateGuidance(av1).quantizer?.support[0]).toMatchObject({
      min: 0,
      max: 63,
      source: "av1-webcodecs-registration",
    });
    expect(getBitrateGuidance(vp9).quantizer?.recommendations[0]).toMatchObject(
      {
        kind: "target",
        value: 33,
        source: "google-vp9-quantizer",
      },
    );
  });

  it("deduplicates bitrate-mode variants by profile and level", () => {
    const entries = new Set(
      VIDEO_CANDIDATES.map((candidate) =>
        guidanceKey(getBitrateGuidance(candidate)),
      ),
    );
    expect(entries.size).toBe(154);
  });
});
