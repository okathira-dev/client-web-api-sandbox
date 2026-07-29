import {
  audioResultFixture,
  performanceFixture,
  videoResultFixture,
} from "./__fixtures__/results";
import {
  EMPTY_RESULT_FILTERS,
  filterResults,
  getPeakFrameTimePercent,
  getResultDetails,
  getResultStatus,
  getResultVariant,
  isFiltersEmpty,
  matchesFilters,
  type ResultFilters,
} from "./filters";

const withFilters = (overrides: Partial<ResultFilters>): ResultFilters => ({
  ...EMPTY_RESULT_FILTERS,
  ...overrides,
});

describe("getResultStatus", () => {
  it("separates a clean pass from a pass carrying a warning", () => {
    expect(getResultStatus(videoResultFixture())).toBe("pass");
    expect(getResultStatus(videoResultFixture({ warning: "slow" }))).toBe(
      "warning",
    );
  });

  it("reports a failure regardless of any warning on it", () => {
    expect(
      getResultStatus(
        videoResultFixture({ usable: false, warning: "slow", error: "boom" }),
      ),
    ).toBe("fail");
  });
});

describe("getResultVariant", () => {
  it("uses the hardware preference for video and the channel count for audio", () => {
    expect(getResultVariant(videoResultFixture())).toBe("prefer-hardware");
    expect(getResultVariant(audioResultFixture({ channels: 1 }))).toBe("1ch");
  });
});

describe("getResultDetails", () => {
  it("joins the basic and sustained messages into one line", () => {
    const result = videoResultFixture({
      warning: "basic-warning",
      sustained: videoResultFixture({
        error: "sustained-error",
        testMode: "sustained",
      }),
    });
    expect(getResultDetails(result)).toBe("basic-warning · sustained-error");
  });

  it("returns an empty string when nothing went wrong", () => {
    expect(getResultDetails(videoResultFixture())).toBe("");
  });
});

describe("getPeakFrameTimePercent", () => {
  it("takes the worse of the basic and sustained measurements", () => {
    const result = videoResultFixture({
      performance: performanceFixture({ frameTimePercent: 40 }),
      sustained: videoResultFixture({
        testMode: "sustained",
        performance: performanceFixture({ frameTimePercent: 130 }),
      }),
    });
    expect(getPeakFrameTimePercent(result)).toBe(130);
  });

  it("returns 0 when no measurement was recorded", () => {
    expect(
      getPeakFrameTimePercent(videoResultFixture({ performance: null })),
    ).toBe(0);
  });
});

describe("matchesFilters", () => {
  const result = videoResultFixture({
    codec: "avc1.640028",
    family: "h264",
    elapsedMs: 200,
  });

  it("keeps everything when no filter is set", () => {
    expect(matchesFilters(result, EMPTY_RESULT_FILTERS)).toBe(true);
  });

  it("filters by family", () => {
    expect(matchesFilters(result, withFilters({ family: "h264" }))).toBe(true);
    expect(matchesFilters(result, withFilters({ family: "av1" }))).toBe(false);
  });

  it("matches codec strings case-insensitively as a substring", () => {
    expect(matchesFilters(result, withFilters({ codec: "AVC1.64" }))).toBe(
      true,
    );
    expect(matchesFilters(result, withFilters({ codec: " 640028 " }))).toBe(
      true,
    );
    expect(matchesFilters(result, withFilters({ codec: "vp09" }))).toBe(false);
  });

  it("filters by hardware preference or channel count", () => {
    expect(
      matchesFilters(result, withFilters({ variant: "prefer-hardware" })),
    ).toBe(true);
    expect(
      matchesFilters(result, withFilters({ variant: "prefer-software" })),
    ).toBe(false);
    expect(
      matchesFilters(audioResultFixture(), withFilters({ variant: "2ch" })),
    ).toBe(true);
  });

  it("filters by status", () => {
    expect(matchesFilters(result, withFilters({ status: "pass" }))).toBe(true);
    expect(matchesFilters(result, withFilters({ status: "fail" }))).toBe(false);
  });

  it("searches error and warning text", () => {
    const failed = videoResultFixture({
      usable: false,
      error: "isConfigSupported-false",
    });
    expect(matchesFilters(failed, withFilters({ details: "configsup" }))).toBe(
      true,
    );
    expect(matchesFilters(failed, withFilters({ details: "timeout" }))).toBe(
      false,
    );
  });

  it("can narrow to candidates that have a sustained measurement", () => {
    expect(matchesFilters(result, withFilters({ budget: "sustained" }))).toBe(
      false,
    );
    const withSustained = videoResultFixture({
      sustained: videoResultFixture({ testMode: "sustained" }),
    });
    expect(
      matchesFilters(withSustained, withFilters({ budget: "sustained" })),
    ).toBe(true);
  });

  it("can narrow to candidates that blew the frame budget", () => {
    expect(matchesFilters(result, withFilters({ budget: "over" }))).toBe(false);
    const overBudget = videoResultFixture({
      performance: performanceFixture({ frameTimePercent: 145 }),
    });
    expect(matchesFilters(overBudget, withFilters({ budget: "over" }))).toBe(
      true,
    );
  });

  it("splits results at the one second mark", () => {
    expect(matchesFilters(result, withFilters({ time: "quick" }))).toBe(true);
    expect(matchesFilters(result, withFilters({ time: "slow" }))).toBe(false);

    const slow = videoResultFixture({ elapsedMs: 1000 });
    expect(matchesFilters(slow, withFilters({ time: "quick" }))).toBe(false);
    expect(matchesFilters(slow, withFilters({ time: "slow" }))).toBe(true);
  });

  it("requires every active filter to match", () => {
    expect(
      matchesFilters(result, withFilters({ family: "h264", status: "fail" })),
    ).toBe(false);
  });
});

describe("filterResults", () => {
  it("preserves the input order of the surviving results", () => {
    const results = [
      videoResultFixture({ id: "a", codec: "avc1.640028" }),
      videoResultFixture({ id: "b", codec: "vp09.00.40.08", family: "vp9" }),
      videoResultFixture({ id: "c", codec: "avc1.42E01E" }),
    ];
    expect(
      filterResults(results, withFilters({ family: "h264" })).map(
        (result) => result.id,
      ),
    ).toEqual(["a", "c"]);
  });
});

describe("isFiltersEmpty", () => {
  it("treats whitespace-only text filters as empty", () => {
    expect(isFiltersEmpty(EMPTY_RESULT_FILTERS)).toBe(true);
    expect(isFiltersEmpty(withFilters({ codec: "   " }))).toBe(true);
    expect(isFiltersEmpty(withFilters({ codec: "avc" }))).toBe(false);
  });
});
