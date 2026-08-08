import { AUDIO_CANDIDATES, VIDEO_CANDIDATES } from "../../consts/candidates";
import { getBitrateGuidance } from "../../domain/bitrateGuidance";
import {
  cycleBitrateGuideSort,
  filterBitrateGuidance,
  getBitrateGuideFilterOptions,
  sortBitrateGuidance,
} from "./filters";

const entries = [...VIDEO_CANDIDATES, ...AUDIO_CANDIDATES].reduce(
  (unique, candidate) => {
    const guidance = getBitrateGuidance(candidate);
    unique.set(
      `${guidance.family}|${guidance.profile}|${guidance.level ?? "—"}`,
      guidance,
    );
    return unique;
  },
  new Map<string, ReturnType<typeof getBitrateGuidance>>(),
);

describe("bitrate guide filters and sorting", () => {
  it("filters by family, codec, and profile text", () => {
    const all = [...entries.values()];
    expect(
      filterBitrateGuidance(all, {
        family: "aac",
        codec: "40.5",
        profile: "HE-AAC",
      }),
    ).toHaveLength(1);
    expect(
      filterBitrateGuidance(all, {
        family: "h264",
        codec: "",
        profile: "Level 3.1",
      }).every((entry) => entry.family === "h264" && entry.level === "3.1"),
    ).toBe(true);
  });

  it("cycles sort state and sorts without mutating the catalog", () => {
    const all = [...entries.values()];
    expect(cycleBitrateGuideSort(null, "codec")).toEqual({
      field: "codec",
      direction: "asc",
    });
    expect(
      cycleBitrateGuideSort({ field: "codec", direction: "asc" }, "codec"),
    ).toEqual({ field: "codec", direction: "desc" });
    expect(
      cycleBitrateGuideSort({ field: "codec", direction: "desc" }, "codec"),
    ).toBeNull();

    const sorted = sortBitrateGuidance(all, {
      field: "codec",
      direction: "asc",
    });
    expect(sorted).not.toBe(all);
    expect(sorted[0]?.codec).toBe("av01.0.05M.08");
    expect(all[0]?.codec).not.toBe(sorted[0]?.codec);
  });

  it("exposes stable family and profile filter options", () => {
    const options = getBitrateGuideFilterOptions([...entries.values()]);
    expect(options.families).toEqual([
      "h264",
      "h265",
      "vp9",
      "av1",
      "vp8",
      "aac",
      "opus",
    ]);
    expect(options.profiles).toContain("AAC-LC");
    expect(options.profiles).toContain("High 4.1");
  });
});
