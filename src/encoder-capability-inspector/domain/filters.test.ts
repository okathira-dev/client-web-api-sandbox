import {
  audioResultFixture,
  performanceFixture,
  videoResultFixture,
} from "./__fixtures__/results";
import {
  EMPTY_RESULT_FILTERS,
  filterResults,
  getBasicFrameTimePercent,
  getResultDetails,
  getResultStatus,
  getResultVariant,
  getSustainedFrameTimePercent,
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

describe("frame budget accessors", () => {
  it("reads the basic and sustained measurements independently", () => {
    const result = videoResultFixture({
      performance: performanceFixture({ frameTimePercent: 40 }),
      sustained: videoResultFixture({
        testMode: "sustained",
        performance: performanceFixture({ frameTimePercent: 130 }),
      }),
    });
    expect(getBasicFrameTimePercent(result)).toBe(40);
    expect(getSustainedFrameTimePercent(result)).toBe(130);
  });

  it("returns 0 when no measurement was recorded", () => {
    const noMeasurement = videoResultFixture({ performance: null });
    expect(getBasicFrameTimePercent(noMeasurement)).toBe(0);
    expect(getSustainedFrameTimePercent(noMeasurement)).toBe(0);
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

  it("searches the supplied details text so translated messages can be matched", () => {
    const failed = videoResultFixture({
      usable: false,
      error: "isConfigSupported-false",
    });
    // UI は訳文とコードの両方を渡す。どちらの語でも引けること。
    const detailsText = () =>
      "この設定は宣言の時点で拒否されました (isConfigSupported-false)";

    expect(
      matchesFilters(failed, withFilters({ details: "拒否" }), detailsText),
    ).toBe(true);
    expect(
      matchesFilters(
        failed,
        withFilters({ details: "configsup" }),
        detailsText,
      ),
    ).toBe(true);
    // 既定の照合対象はコードだけなので、訳文では引けない。
    expect(matchesFilters(failed, withFilters({ details: "拒否" }))).toBe(
      false,
    );
  });

  it("can narrow to candidates with or without a sustained measurement", () => {
    expect(matchesFilters(result, withFilters({ sustained: "done" }))).toBe(
      false,
    );
    expect(matchesFilters(result, withFilters({ sustained: "none" }))).toBe(
      true,
    );

    const withSustained = videoResultFixture({
      sustained: videoResultFixture({ testMode: "sustained" }),
    });
    expect(
      matchesFilters(withSustained, withFilters({ sustained: "done" })),
    ).toBe(true);
    expect(
      matchesFilters(withSustained, withFilters({ sustained: "none" })),
    ).toBe(false);
  });

  it("splits the basic frame budget at 100 percent in both directions", () => {
    // 既定のフィクスチャは予算内。
    expect(matchesFilters(result, withFilters({ budget: "over" }))).toBe(false);
    expect(matchesFilters(result, withFilters({ budget: "under" }))).toBe(true);

    const overBudget = videoResultFixture({
      performance: performanceFixture({ frameTimePercent: 145 }),
    });
    expect(matchesFilters(overBudget, withFilters({ budget: "over" }))).toBe(
      true,
    );
    expect(matchesFilters(overBudget, withFilters({ budget: "under" }))).toBe(
      false,
    );
  });

  it("keeps the sustained budget filters off candidates that were never run", () => {
    // 未実施は予算比 0 なので、しきい値だけで見ると「100% 以下」に紛れてしまう。
    expect(matchesFilters(result, withFilters({ sustained: "under" }))).toBe(
      false,
    );
    expect(matchesFilters(result, withFilters({ sustained: "over" }))).toBe(
      false,
    );

    const slowSustained = videoResultFixture({
      sustained: videoResultFixture({
        testMode: "sustained",
        performance: performanceFixture({ frameTimePercent: 145 }),
      }),
    });
    expect(
      matchesFilters(slowSustained, withFilters({ sustained: "over" })),
    ).toBe(true);
    expect(
      matchesFilters(slowSustained, withFilters({ sustained: "under" })),
    ).toBe(false);
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
