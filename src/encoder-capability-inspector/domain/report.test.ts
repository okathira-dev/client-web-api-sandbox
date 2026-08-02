import { REPORT_VERSION } from "../consts/inspection";
import {
  audioResultFixture,
  reportFixture,
  videoResultFixture,
} from "./__fixtures__/results";
import {
  getAudioCandidatesForFamily,
  getVideoCandidatesForFamily,
} from "./plan";
import {
  countResults,
  getActiveElapsedMs,
  getEffectiveReport,
  getRemainingMs,
  isCompleteReport,
  isResumableReport,
  summarizeFamilies,
} from "./report";
import { AUDIO_FAMILIES, VIDEO_FAMILIES } from "./types";

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
    expect(summaries).toHaveLength(
      VIDEO_FAMILIES.length + AUDIO_FAMILIES.length,
    );
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

  it("includes every video candidate in the denominator", () => {
    const h264 = summarizeFamilies(reportFixture()).find(
      (summary) => summary.family === "h264",
    );
    expect(h264?.totalCount).toBe(getVideoCandidatesForFamily("h264").length);
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

describe("getActiveElapsedMs", () => {
  it("keeps counting from the last update while the inspection runs", () => {
    expect(
      getActiveElapsedMs({
        activeMs: 30_000,
        updatedAt: 1_000_000,
        running: true,
        now: 1_002_500,
      }),
    ).toBe(32_500);
  });

  it("does not count the time spent interrupted", () => {
    // 30 秒ぶん検査したところで中断し、その後 10 分眺めていた。
    expect(
      getActiveElapsedMs({
        activeMs: 30_000,
        updatedAt: 1_000_000,
        running: false,
        now: 1_600_000,
      }),
    ).toBe(30_000);
  });

  it("carries the earlier run's time into the resumed run", () => {
    // 中断時点で 30 秒。再開して 5 秒経ったところ。
    const resumed = getActiveElapsedMs({
      activeMs: 35_000,
      updatedAt: 2_000_000,
      running: true,
      now: 2_000_000,
    });
    expect(resumed).toBe(35_000);
  });

  it("does not go backwards when the clock is behind the last update", () => {
    expect(
      getActiveElapsedMs({
        activeMs: 30_000,
        updatedAt: 1_000_000,
        running: true,
        now: 999_000,
      }),
    ).toBe(30_000);
  });
});

describe("getRemainingMs", () => {
  it("estimates from the time actually spent per candidate", () => {
    expect(
      getRemainingMs({
        elapsedMs: 20_000,
        completedUnits: 100,
        totalUnits: 472,
      }),
    ).toBe(74_400);
  });

  it("gives no estimate before the first candidate finishes", () => {
    expect(
      getRemainingMs({ elapsedMs: 5_000, completedUnits: 0, totalUnits: 472 }),
    ).toBeNull();
  });

  it("gives no estimate once everything is done", () => {
    expect(
      getRemainingMs({
        elapsedMs: 40_000,
        completedUnits: 472,
        totalUnits: 472,
      }),
    ).toBeNull();
  });
});

describe("summarizeFamilies with audio", () => {
  it("covers audio families as well as video", () => {
    const kinds = summarizeFamilies(null).map((summary) => summary.kind);
    expect(kinds.filter((kind) => kind === "video")).toHaveLength(
      VIDEO_FAMILIES.length,
    );
    expect(kinds.filter((kind) => kind === "audio")).toHaveLength(
      AUDIO_FAMILIES.length,
    );
  });

  it("counts audio per profile and channel, since a codec string does not express every setting", () => {
    // AAC はプロファイルとチャンネル数の組み合わせごとに結果を数える。
    const report = reportFixture({
      results: [
        audioResultFixture({
          id: "audio:aac:2:2",
          candidateId: "aac:2:2",
          codec: "mp4a.40.2",
          family: "aac",
          profile: "AAC-LC",
          expectedAudioObjectType: 2,
          outputAudioObjectType: 2,
        }),
      ],
    });
    const aac = summarizeFamilies(report).find(
      (summary) => summary.family === "aac",
    );
    expect(aac?.totalCount).toBe(getAudioCandidatesForFamily("aac").length);
    expect(aac?.usableCount).toBe(1);
  });
});
