import { AUDIO_CANDIDATES, VIDEO_CANDIDATES } from "../consts/candidates";
import {
  buildAudioInspectionUnits,
  buildFullInspectionPlan,
  buildVideoInspectionUnits,
  findInspectionUnits,
  getVideoCandidatesForFamily,
} from "./plan";
import { HARDWARE_PREFERENCES, VIDEO_FAMILIES } from "./types";

describe("candidate matrix", () => {
  it("expands each family into the expected number of codec strings", () => {
    const counts = Object.fromEntries(
      VIDEO_FAMILIES.map((family) => [
        family,
        getVideoCandidatesForFamily(family).length,
      ]),
    );
    expect(counts).toEqual({
      h264: 6 * 12,
      h265: 2 * 2 * 9,
      vp9: 2 * 9,
      av1: 3 * 9,
      vp8: 1,
    });
    expect(VIDEO_CANDIDATES).toHaveLength(72 + 36 + 18 + 27 + 1);
  });

  it("keeps every video codec string unique", () => {
    const codecs = VIDEO_CANDIDATES.map((candidate) => candidate.codec);
    expect(new Set(codecs).size).toBe(codecs.length);
  });

  it("emits codec strings in the shape each encoder expects", () => {
    for (const candidate of VIDEO_CANDIDATES) {
      switch (candidate.family) {
        case "h264":
          // avc1.PPCCLL — profile_idc, constraint flags, level_idc の 3 バイト。
          expect(candidate.codec).toMatch(/^avc1\.[0-9A-F]{6}$/);
          break;
        case "h265":
          expect(candidate.codec).toMatch(/^(hvc1|hev1)\.\d+\.\d+\.L\d+\.B0$/);
          break;
        case "vp9":
          expect(candidate.codec).toMatch(/^vp09\.\d{2}\.\d{2}\.\d{2}$/);
          break;
        case "av1":
          expect(candidate.codec).toMatch(/^av01\.\d\.\d{2}M\.\d{2}$/);
          break;
        case "vp8":
          expect(candidate.codec).toBe("vp8");
          break;
      }
    }
  });

  it("marks 10-bit and Level 6.x variants as experimental", () => {
    const highTenLevelThree = VIDEO_CANDIDATES.find(
      (candidate) => candidate.codec === "avc1.6E001F",
    );
    expect(highTenLevelThree?.experimental).toBe(true);

    const highLevelSix = VIDEO_CANDIDATES.find(
      (candidate) => candidate.codec === "avc1.64003C",
    );
    expect(highLevelSix?.experimental).toBe(true);

    const highLevelFourZero = VIDEO_CANDIDATES.find(
      (candidate) => candidate.codec === "avc1.640028",
    );
    expect(highLevelFourZero?.experimental).toBe(false);
  });

  it("covers both AAC and Opus across channel counts and bitrates", () => {
    expect(AUDIO_CANDIDATES).toHaveLength(5 * 2 + 6 * 2);
    expect(
      AUDIO_CANDIDATES.filter((candidate) => candidate.family === "aac"),
    ).toHaveLength(10);
    expect(
      new Set(AUDIO_CANDIDATES.map((candidate) => candidate.channels)),
    ).toEqual(new Set([1, 2]));
  });

  it("routes each candidate to a container its codec can live in", () => {
    for (const candidate of VIDEO_CANDIDATES) {
      const expected =
        candidate.family === "h264" || candidate.family === "h265"
          ? "mp4"
          : "webm";
      expect(candidate.container).toBe(expected);
    }
    for (const candidate of AUDIO_CANDIDATES) {
      expect(candidate.container).toBe(
        candidate.family === "aac" ? "mp4" : "webm",
      );
    }
  });
});

describe("buildFullInspectionPlan", () => {
  it("runs every video codec string under all three hardware preferences", () => {
    const units = buildVideoInspectionUnits();
    expect(units).toHaveLength(
      VIDEO_CANDIDATES.length * HARDWARE_PREFERENCES.length,
    );
    const forOneCodec = units.filter((unit) => unit.codec === "avc1.640028");
    expect(forOneCodec.map((unit) => unit.hardwareAcceleration).sort()).toEqual(
      [...HARDWARE_PREFERENCES].sort(),
    );
  });

  it("does not expand audio candidates by hardware preference", () => {
    expect(buildAudioInspectionUnits()).toHaveLength(AUDIO_CANDIDATES.length);
  });

  it("produces unique unit ids across video and audio", () => {
    const plan = buildFullInspectionPlan();
    const ids = plan.map((unit) => unit.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(plan).toHaveLength(
      VIDEO_CANDIDATES.length * HARDWARE_PREFERENCES.length +
        AUDIO_CANDIDATES.length,
    );
  });

  it("tags each unit with its kind so video-only fields stay off audio units", () => {
    const plan = buildFullInspectionPlan();
    for (const unit of plan) {
      if (unit.kind === "video") {
        expect(HARDWARE_PREFERENCES).toContain(unit.hardwareAcceleration);
      } else {
        expect(unit.sampleRate).toBe(48_000);
      }
    }
  });
});

describe("findInspectionUnits", () => {
  it("returns only the requested ids", () => {
    const plan = buildFullInspectionPlan();
    const wanted = [plan[0], plan[5], plan[plan.length - 1]].map(
      (unit) => unit?.id ?? "",
    );
    const found = findInspectionUnits(wanted);
    expect(found.map((unit) => unit.id).sort()).toEqual([...wanted].sort());
  });

  it("ignores ids that are not in the plan", () => {
    expect(findInspectionUnits(["video:nope:prefer-hardware"])).toEqual([]);
  });
});
