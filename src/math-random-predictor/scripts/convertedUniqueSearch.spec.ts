import {
  findFirstUniqueCountByIncreasing,
  findMinObservationCountForUnique,
  type ProbeAtCountResult,
  type ProbeConvertedUniquenessAtCount,
} from "./convertedUniqueSearch";

const mockProbe =
  (
    decide: (count: number) => ProbeAtCountResult,
  ): ProbeConvertedUniquenessAtCount =>
  async (_all, count) =>
    decide(count);

describe("convertedUniqueSearch", () => {
  const allObservations = Array.from({ length: 20 }, (_, index) => index);

  it("findMinObservationCountForUnique: multiple でも打ち切らず最小観測数を求めること", async () => {
    const probe = mockProbe((count) => {
      if (count < 4) {
        return { ok: false, status: "multiple" };
      }
      return { ok: true, status: "unique" };
    });

    const { minCount, statusAtMin } = await findMinObservationCountForUnique({
      allObservations,
      n: 4096,
      cacheOffset: 0,
      timeoutMs: 1000,
      maxCount: 10,
      probe,
    });

    expect(minCount).toBe(4);
    expect(statusAtMin).toBe("unique");
  });

  it("findMinObservationCountForUnique: timeout 時は観測数を減らして探索すること", async () => {
    const probe = mockProbe((count) => {
      if (count >= 8) {
        return { ok: false, status: "timeout" };
      }
      if (count < 5) {
        return { ok: false, status: "multiple" };
      }
      return { ok: true, status: "unique" };
    });

    const { minCount } = await findMinObservationCountForUnique({
      allObservations,
      n: 4096,
      cacheOffset: 0,
      timeoutMs: 1000,
      maxCount: 12,
      probe,
    });

    expect(minCount).toBe(5);
  });

  it("findFirstUniqueCountByIncreasing: 観測を増やすと unique になること", async () => {
    const probe = mockProbe((count) => {
      if (count < 12) {
        return { ok: false, status: "multiple" };
      }
      return { ok: true, status: "unique" };
    });

    const { upperCount } = await findFirstUniqueCountByIncreasing({
      allObservations,
      n: 4096,
      cacheOffset: 0,
      timeoutMs: 1000,
      maxCount: 20,
      startCount: 4,
      probe,
    });

    expect(upperCount).toBe(12);
  });
});
