import { videoResultFixture } from "./__fixtures__/results";
import { inferNoPreferenceBackends } from "./backendInference";
import type { HardwarePreference, UnitResult } from "./types";

const withPreference = (
  hardwareAcceleration: HardwarePreference,
  overrides: Partial<Parameters<typeof videoResultFixture>[0]> = {},
) =>
  videoResultFixture({
    id: `video:avc1.640028:${hardwareAcceleration}`,
    candidateId: "avc1.640028",
    hardwareAcceleration,
    ...overrides,
  });

const sized = (outputBytes: number) => {
  const base = videoResultFixture().performance;
  return { performance: base && { ...base, outputBytes } };
};

const infer = (results: readonly UnitResult[]) =>
  inferNoPreferenceBackends(results).get("video:avc1.640028:no-preference");

describe("inferNoPreferenceBackends", () => {
  it("picks the sibling whose output it reproduces byte for byte", () => {
    expect(
      infer([
        withPreference("prefer-hardware", sized(5000)),
        withPreference("prefer-software", sized(7000)),
        withPreference("no-preference", sized(5000)),
      ]),
    ).toEqual({ verdict: "hardware", basis: "output-match" });

    expect(
      infer([
        withPreference("prefer-hardware", sized(5000)),
        withPreference("prefer-software", sized(7000)),
        withPreference("no-preference", sized(7000)),
      ]),
    ).toEqual({ verdict: "software", basis: "output-match" });
  });

  it("cannot tell them apart when both siblings produce the same output", () => {
    expect(
      infer([
        withPreference("prefer-hardware", sized(5000)),
        withPreference("prefer-software", sized(5000)),
        withPreference("no-preference", sized(5000)),
      ]),
    ).toEqual({ verdict: "unknown", basis: null });
  });

  it("settles on the only sibling that worked when the output matches it", () => {
    // もう一方の方針は動かないので、消去法と出力一致の両方が揃う。
    expect(
      infer([
        withPreference("prefer-hardware", sized(5000)),
        withPreference("prefer-software", {
          usable: false,
          error: "isConfigSupported-false",
        }),
        withPreference("no-preference", sized(5000)),
      ]),
    ).toEqual({ verdict: "hardware", basis: "only-one-worked" });
  });

  it("does not settle on the only sibling that worked when the output differs", () => {
    // 動く実装が 1 つしかないはずなのに出力が違う。第三の実装が動いたことになる。
    expect(
      infer([
        withPreference("prefer-hardware", sized(5000)),
        withPreference("prefer-software", {
          usable: false,
          error: "isConfigSupported-false",
        }),
        withPreference("no-preference", sized(9000)),
      ]),
    ).toEqual({ verdict: "unknown", basis: null });
  });

  it("gives up when the output matches neither sibling", () => {
    expect(
      infer([
        withPreference("prefer-hardware", sized(5000)),
        withPreference("prefer-software", sized(7000)),
        withPreference("no-preference", sized(9000)),
      ]),
    ).toEqual({ verdict: "unknown", basis: null });
  });

  it("gives up when the no-preference run itself failed", () => {
    expect(
      infer([
        withPreference("prefer-hardware", sized(5000)),
        withPreference("prefer-software", sized(7000)),
        withPreference("no-preference", { usable: false, error: "boom" }),
      ]),
    ).toEqual({ verdict: "unknown", basis: null });
  });

  it("does not compare runs that saw different input", () => {
    // 継続検査とライブ入力は候補ごとに入力が変わるので、突き合わせても意味がない。
    expect(
      infer([
        withPreference("prefer-hardware", {
          ...sized(5000),
          testMode: "sustained",
        }),
        withPreference("prefer-software", {
          ...sized(7000),
          testMode: "sustained",
        }),
        withPreference("no-preference", {
          ...sized(5000),
          testMode: "sustained",
        }),
      ]),
    ).toBeUndefined();

    expect(
      infer([
        withPreference("prefer-hardware", {
          ...sized(5000),
          inputMode: "live",
        }),
        withPreference("prefer-software", {
          ...sized(7000),
          inputMode: "live",
        }),
        withPreference("no-preference", { ...sized(5000), inputMode: "live" }),
      ]),
    ).toBeUndefined();
  });

  it("keeps candidates apart instead of mixing their siblings", () => {
    const other = videoResultFixture({
      id: "video:vp8:no-preference",
      candidateId: "vp8",
      codec: "vp8",
      family: "vp8",
      hardwareAcceleration: "no-preference",
      ...sized(5000),
    });
    const inferences = inferNoPreferenceBackends([
      withPreference("prefer-hardware", sized(5000)),
      withPreference("prefer-software", sized(7000)),
      withPreference("no-preference", sized(5000)),
      other,
    ]);
    expect(inferences.get("video:avc1.640028:no-preference")?.verdict).toBe(
      "hardware",
    );
    expect(inferences.get("video:vp8:no-preference")).toEqual({
      verdict: "unknown",
      basis: null,
    });
  });
});
