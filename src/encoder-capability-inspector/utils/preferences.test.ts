import {
  MAX_CANDIDATE_PAUSE_MS,
  MAX_SUSTAINED_DURATION_SECONDS,
  MIN_SUSTAINED_DURATION_SECONDS,
} from "../consts/inspection";
import {
  parseCandidatePauseMs,
  parseSustainedDurationSeconds,
} from "./preferences";

describe("parseCandidatePauseMs", () => {
  it("accepts 0 so the run can skip the pause entirely", () => {
    expect(parseCandidatePauseMs(0)).toBe(0);
    expect(parseCandidatePauseMs("0")).toBe(0);
  });

  it("accepts integers up to the maximum", () => {
    expect(parseCandidatePauseMs(250)).toBe(250);
    expect(parseCandidatePauseMs(MAX_CANDIDATE_PAUSE_MS)).toBe(
      MAX_CANDIDATE_PAUSE_MS,
    );
  });

  it("rejects values outside the allowed range", () => {
    expect(parseCandidatePauseMs(-1)).toBeNull();
    expect(parseCandidatePauseMs(MAX_CANDIDATE_PAUSE_MS + 1)).toBeNull();
  });

  it("rejects non-integers and unparsable input", () => {
    expect(parseCandidatePauseMs(12.5)).toBeNull();
    expect(parseCandidatePauseMs("abc")).toBeNull();
    expect(parseCandidatePauseMs(undefined)).toBeNull();
    expect(parseCandidatePauseMs(Number.NaN)).toBeNull();
  });

  it("rejects blank input instead of reading it as 0", () => {
    expect(parseCandidatePauseMs("")).toBeNull();
    expect(parseCandidatePauseMs("   ")).toBeNull();
    expect(parseCandidatePauseMs(null)).toBeNull();
  });
});

describe("parseSustainedDurationSeconds", () => {
  it("accepts the documented range inclusively", () => {
    expect(parseSustainedDurationSeconds(MIN_SUSTAINED_DURATION_SECONDS)).toBe(
      MIN_SUSTAINED_DURATION_SECONDS,
    );
    expect(parseSustainedDurationSeconds(MAX_SUSTAINED_DURATION_SECONDS)).toBe(
      MAX_SUSTAINED_DURATION_SECONDS,
    );
  });

  it("accepts long runs, since the inspection can always be interrupted", () => {
    expect(parseSustainedDurationSeconds(600)).toBe(600);
    expect(parseSustainedDurationSeconds(3600)).toBe(3600);
  });

  it("allows fractional durations inside the range", () => {
    expect(parseSustainedDurationSeconds("2.5")).toBe(2.5);
  });

  it("rejects values outside the range", () => {
    expect(
      parseSustainedDurationSeconds(MIN_SUSTAINED_DURATION_SECONDS - 0.5),
    ).toBeNull();
    expect(
      parseSustainedDurationSeconds(MAX_SUSTAINED_DURATION_SECONDS + 1),
    ).toBeNull();
  });

  it("rejects unparsable input", () => {
    expect(parseSustainedDurationSeconds("")).toBeNull();
    expect(parseSustainedDurationSeconds("abc")).toBeNull();
  });
});
