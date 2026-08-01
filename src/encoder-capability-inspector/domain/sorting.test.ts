import {
  audioResultFixture,
  performanceFixture,
  videoResultFixture,
} from "./__fixtures__/results";
import { cycleSort, type ResultSort, sortResults } from "./sorting";

const ids = (results: readonly { id: string }[]) =>
  results.map((result) => result.id);

describe("sortResults", () => {
  const results = [
    videoResultFixture({
      id: "c",
      codec: "vp09.00.40.08",
      family: "vp9",
      elapsedMs: 300,
      performance: performanceFixture({ frameTimePercent: 20 }),
    }),
    videoResultFixture({
      id: "a",
      codec: "avc1.640028",
      family: "h264",
      elapsedMs: 100,
      performance: performanceFixture({ frameTimePercent: 150 }),
    }),
    videoResultFixture({
      id: "b",
      codec: "av01.0.08M.08",
      family: "av1",
      elapsedMs: 200,
      performance: performanceFixture({ frameTimePercent: 80 }),
    }),
  ];

  it("keeps the original order when no sort is active", () => {
    expect(ids(sortResults(results, null))).toEqual(["c", "a", "b"]);
  });

  it("does not mutate the input", () => {
    sortResults(results, { field: "codec", direction: "asc" });
    expect(ids(results)).toEqual(["c", "a", "b"]);
  });

  it("sorts codec strings in both directions", () => {
    expect(ids(sortResults(results, { field: "codec", direction: "asc" })))
      // av01… < avc1… < vp09…
      .toEqual(["b", "a", "c"]);
    expect(
      ids(sortResults(results, { field: "codec", direction: "desc" })),
    ).toEqual(["c", "a", "b"]);
  });

  it("sorts numeric columns by value rather than by text", () => {
    expect(
      ids(sortResults(results, { field: "time", direction: "asc" })),
    ).toEqual(["a", "b", "c"]);
    expect(
      ids(sortResults(results, { field: "budget", direction: "desc" })),
    ).toEqual(["a", "b", "c"]);
  });

  it("ranks results as pass, then warning, then fail", () => {
    const graded = [
      videoResultFixture({ id: "fail", usable: false, error: "boom" }),
      videoResultFixture({ id: "pass" }),
      videoResultFixture({ id: "warn", warning: "slow" }),
    ];
    expect(
      ids(sortResults(graded, { field: "status", direction: "asc" })),
    ).toEqual(["pass", "warn", "fail"]);
  });

  it("treats a missing sustained measurement as zero", () => {
    const mixed = [
      videoResultFixture({
        id: "measured",
        sustained: videoResultFixture({
          testMode: "sustained",
          performance: performanceFixture({ frameTimePercent: 90 }),
        }),
      }),
      videoResultFixture({ id: "not-run" }),
    ];
    expect(
      ids(sortResults(mixed, { field: "sustained", direction: "asc" })),
    ).toEqual(["not-run", "measured"]);
  });

  it("sorts the details column using the supplied text", () => {
    const failures = [
      videoResultFixture({ id: "second", usable: false, error: "b-error" }),
      videoResultFixture({ id: "first", usable: false, error: "a-error" }),
    ];
    // 表示中の訳文で並べたいので、照合と同じく解決関数を渡せること。
    const detailsText = (result: { id: string }) =>
      result.id === "first" ? "zzz" : "aaa";
    expect(
      ids(
        sortResults(
          failures,
          { field: "details", direction: "asc" },
          (result) => detailsText(result),
        ),
      ),
    ).toEqual(["second", "first"]);
  });

  it("keeps the original order between candidates that compare equal", () => {
    const tied = [
      audioResultFixture({ id: "x", channels: 2 }),
      audioResultFixture({ id: "y", channels: 2 }),
      audioResultFixture({ id: "z", channels: 2 }),
    ];
    expect(
      ids(sortResults(tied, { field: "variant", direction: "asc" })),
    ).toEqual(["x", "y", "z"]);
  });
});

describe("cycleSort", () => {
  it("starts a new column ascending", () => {
    expect(cycleSort(null, "codec")).toEqual({
      field: "codec",
      direction: "asc",
    });
  });

  it("goes ascending, descending, then back to the default order", () => {
    const asc: ResultSort = { field: "codec", direction: "asc" };
    const desc = cycleSort(asc, "codec");
    expect(desc).toEqual({ field: "codec", direction: "desc" });
    expect(cycleSort(desc, "codec")).toBeNull();
  });

  it("restarts ascending when a different column is picked", () => {
    expect(cycleSort({ field: "codec", direction: "desc" }, "time")).toEqual({
      field: "time",
      direction: "asc",
    });
  });
});

describe("sorting by family", () => {
  it("groups video before audio instead of ordering by name", () => {
    // 名前順なら aac < av1 < h264 < opus と混ざる。種別でまとまることを見る。
    const mixed = [
      audioResultFixture({ id: "opus", family: "opus" }),
      videoResultFixture({ id: "h264", family: "h264" }),
      audioResultFixture({ id: "aac", family: "aac" }),
      videoResultFixture({ id: "av1", family: "av1" }),
    ];
    expect(
      ids(sortResults(mixed, { field: "family", direction: "asc" })),
    ).toEqual(["h264", "av1", "aac", "opus"]);
  });

  it("reverses the whole order when descending", () => {
    const mixed = [
      videoResultFixture({ id: "h264", family: "h264" }),
      audioResultFixture({ id: "aac", family: "aac" }),
    ];
    expect(
      ids(sortResults(mixed, { field: "family", direction: "desc" })),
    ).toEqual(["aac", "h264"]);
  });
});
