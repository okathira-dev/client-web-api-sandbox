import {
  audioTracks,
  bestMediaCapabilityProfile,
  mediaCapabilityProfiles,
  mediaProfilePixelRate,
  resolutionReels,
  subtitleTracks,
  vfrSegments,
} from "./fixtures";

describe("S-350 native media PoC fixture", () => {
  it("ranks only all-green capability profiles by pixel rate then bitrate", () => {
    const allGreen = new Map(
      mediaCapabilityProfiles.map((profile) => [
        profile.id,
        { supported: true, smooth: true, powerEfficient: true },
      ]),
    );
    expect(bestMediaCapabilityProfile(allGreen)?.id).toBe("h264-1080p60");

    const tied = new Map(allGreen);
    tied.set("h264-1080p60", {
      supported: true,
      smooth: false,
      powerEfficient: true,
    });
    expect(bestMediaCapabilityProfile(tied)?.id).toBe("hevc-1080p30");
    const firstProfile = mediaCapabilityProfiles[0];
    expect(firstProfile).toBeDefined();
    if (!firstProfile) throw new Error("Missing first media profile.");
    expect(mediaProfilePixelRate(firstProfile)).toBe(6_912_000);
  });

  it("has one stable 24 fps VFR segment among four distinct cadences", () => {
    expect(vfrSegments.map((segment) => segment.framerate)).toEqual([
      12, 24, 30, 60,
    ]);
    expect(vfrSegments.find((segment) => segment.framerate === 24)).toEqual({
      start: 2,
      end: 5,
      framerate: 24,
    });
  });

  it("keeps resolution and native track targets unique and non-default", () => {
    expect(
      new Set(resolutionReels.map((reel) => `${reel.width}x${reel.height}`))
        .size,
    ).toBe(3);
    expect(resolutionReels.filter((reel) => reel.target)).toHaveLength(1);

    for (const tracks of [subtitleTracks, audioTracks]) {
      expect(tracks.filter((track) => track.target)).toHaveLength(1);
      expect(tracks.find((track) => track.target)?.label).toBe("Busybox");
      expect(tracks.find((track) => track.target)?.default).toBe(false);
      expect(new Set(tracks.map((track) => track.label)).size).toBe(3);
      expect(new Set(tracks.map((track) => track.language)).size).toBe(3);
    }
  });
});
