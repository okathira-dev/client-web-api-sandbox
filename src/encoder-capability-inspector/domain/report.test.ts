import { REPORT_VERSION } from "../consts/inspection";
import { reportFixture, videoResultFixture } from "./__fixtures__/results";
import { getVideoCandidatesForFamily } from "./plan";
import {
  countResults,
  getEffectiveReport,
  isCompleteReport,
  isResumableReport,
  summarizeFamilies,
} from "./report";

describe("isCompleteReport", () => {
  it("accepts a report that processed every unit", () => {
    expect(isCompleteReport(reportFixture())).toBe(true);
  });

  it("rejects a running report even when every unit happens to be done", () => {
    expect(isCompleteReport(reportFixture({ status: "running" }))).toBe(false);
  });

  it("rejects a report that stopped short of the full plan", () => {
    expect(
      isCompleteReport(reportFixture({ totalUnits: 10, completedUnits: 3 })),
    ).toBe(false);
  });

  it("rejects a report written by an older report version", () => {
    expect(
      isCompleteReport(reportFixture({ version: REPORT_VERSION - 1 })),
    ).toBe(false);
  });

  it("rejects an empty plan so a zero-unit run never counts as complete", () => {
    expect(
      isCompleteReport(
        reportFixture({ results: [], totalUnits: 0, completedUnits: 0 }),
      ),
    ).toBe(false);
  });

  it("rejects null", () => {
    expect(isCompleteReport(null)).toBe(false);
  });
});

describe("getEffectiveReport", () => {
  it("returns the report itself when it is complete", () => {
    const report = reportFixture();
    expect(getEffectiveReport(report)).toBe(report);
  });

  it("falls back to the previous complete report when a rerun is cancelled", () => {
    const previous = reportFixture();
    const cancelled = reportFixture({
      status: "cancelled",
      totalUnits: 100,
      completedUnits: 4,
      previousCompleted: previous,
    });
    expect(getEffectiveReport(cancelled)).toBe(previous);
  });

  it("returns null when neither the report nor its predecessor is complete", () => {
    const cancelled = reportFixture({
      status: "cancelled",
      totalUnits: 100,
      completedUnits: 4,
      previousCompleted: reportFixture({ status: "failed" }),
    });
    expect(getEffectiveReport(cancelled)).toBeNull();
  });
});

describe("isResumableReport", () => {
  it("accepts a cancelled run with unprocessed candidates left", () => {
    expect(
      isResumableReport(
        reportFixture({
          status: "cancelled",
          totalUnits: 100,
          completedUnits: 40,
        }),
      ),
    ).toBe(true);
  });

  it("rejects a cancelled run that had not started any candidate", () => {
    expect(
      isResumableReport(
        reportFixture({
          status: "cancelled",
          results: [],
          totalUnits: 100,
          completedUnits: 0,
        }),
      ),
    ).toBe(false);
  });

  it("rejects a completed run", () => {
    expect(isResumableReport(reportFixture())).toBe(false);
  });
});

describe("summarizeFamilies", () => {
  it("treats every family as untested when no complete report exists", () => {
    const summaries = summarizeFamilies(null);
    expect(summaries).toHaveLength(5);
    for (const summary of summaries) {
      expect(summary.complete).toBe(false);
      expect(summary.unavailable).toBe(false);
      expect(summary.usableCount).toBe(0);
    }
  });

  it("counts a codec string once even when several hardware preferences pass", () => {
    const report = reportFixture({
      results: [
        videoResultFixture({
          id: "video:avc1.640028:prefer-hardware",
          hardwareAcceleration: "prefer-hardware",
        }),
        videoResultFixture({
          id: "video:avc1.640028:prefer-software",
          hardwareAcceleration: "prefer-software",
        }),
      ],
    });
    const h264 = summarizeFamilies(report).find(
      (summary) => summary.family === "h264",
    );
    expect(h264?.usableCount).toBe(1);
    expect(h264?.unavailable).toBe(false);
  });

  it("excludes experimental variants from the denominator", () => {
    const h264 = summarizeFamilies(reportFixture()).find(
      (summary) => summary.family === "h264",
    );
    const productionCount = getVideoCandidatesForFamily("h264").filter(
      (candidate) => !candidate.experimental,
    ).length;
    expect(h264?.totalCount).toBe(productionCount);
  });

  it("marks a family unavailable only when a complete report found nothing usable", () => {
    const report = reportFixture({
      results: [videoResultFixture({ usable: false, error: "boom" })],
    });
    const h264 = summarizeFamilies(report).find(
      (summary) => summary.family === "h264",
    );
    expect(h264?.complete).toBe(true);
    expect(h264?.unavailable).toBe(true);
  });

  it("ignores results from a report that never completed", () => {
    const partial = reportFixture({
      status: "running",
      totalUnits: 100,
      completedUnits: 1,
    });
    const h264 = summarizeFamilies(partial).find(
      (summary) => summary.family === "h264",
    );
    expect(h264?.usableCount).toBe(0);
    expect(h264?.complete).toBe(false);
  });
});

describe("countResults", () => {
  it("counts a warning result as both a pass and a warning", () => {
    expect(
      countResults([
        videoResultFixture(),
        videoResultFixture({ warning: "throughput-below-75-percent" }),
        videoResultFixture({ usable: false, error: "isConfigSupported-false" }),
      ]),
    ).toEqual({ pass: 2, warning: 1, fail: 1 });
  });

  it("returns zeroes for an empty list", () => {
    expect(countResults([])).toEqual({ pass: 0, warning: 0, fail: 0 });
  });
});
