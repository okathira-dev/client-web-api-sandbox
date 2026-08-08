import { createPlanarQueue, createResampler, mapChannels } from "./liveAudio";

const planes = (...values: number[][]): Float32Array[] =>
  values.map((channel) => Float32Array.from(channel));

describe("mapChannels", () => {
  it("passes the planes through when the counts already match", () => {
    const source = planes([1, 2], [3, 4]);
    expect(mapChannels(source, 2)).toEqual(source);
  });

  it("averages every channel down to mono", () => {
    expect(mapChannels(planes([1, 0], [0, 1]), 1)).toEqual(planes([0.5, 0.5]));
  });

  it("duplicates a mono capture across the requested channels", () => {
    const [left, right] = mapChannels(planes([0.5, -0.5]), 2);
    expect([...(left ?? [])]).toEqual([0.5, -0.5]);
    expect([...(right ?? [])]).toEqual([0.5, -0.5]);
  });

  it("keeps the leading channels when asked for fewer but more than one", () => {
    const mapped = mapChannels(planes([1, 1], [2, 2], [3, 3]), 2);
    expect(mapped).toEqual(planes([1, 1], [2, 2]));
  });

  it("returns silence for a source with no planes", () => {
    expect(mapChannels([], 2)).toEqual([
      new Float32Array(0),
      new Float32Array(0),
    ]);
  });
});

describe("createResampler", () => {
  it("keeps the sample count when the rates match", () => {
    const resampler = createResampler({
      sourceRate: 48_000,
      targetRate: 48_000,
      channels: 1,
    });
    const [first] = resampler.push(planes([0, 1, 2, 3]));
    const [second] = resampler.push(planes([4, 5, 6, 7]));
    expect([...(first ?? [])]).toEqual([0, 1, 2, 3]);
    expect([...(second ?? [])]).toEqual([4, 5, 6, 7]);
  });

  it("produces roughly the target rate's worth of samples", () => {
    const resampler = createResampler({
      sourceRate: 44_100,
      targetRate: 48_000,
      channels: 1,
    });
    let total = 0;
    // 1 秒ぶんを 10ms ずつ流す。
    for (let chunk = 0; chunk < 100; chunk += 1) {
      total += resampler.push(planes(new Array(441).fill(0)))[0]?.length ?? 0;
    }
    expect(Math.abs(total - 48_000)).toBeLessThan(4);
  });

  it("stays continuous across chunk boundaries", () => {
    const resampler = createResampler({
      sourceRate: 48_000,
      targetRate: 96_000,
      channels: 1,
    });
    // 傾き 1 の直線を分けて流す。補間が正しければ出力も直線のまま。
    const first = resampler.push(planes([0, 1, 2, 3]))[0] ?? new Float32Array();
    const second =
      resampler.push(planes([4, 5, 6, 7]))[0] ?? new Float32Array();
    const joined = [...first, ...second];
    for (let index = 1; index < joined.length; index += 1) {
      expect((joined[index] ?? 0) - (joined[index - 1] ?? 0)).toBeCloseTo(
        0.5,
        6,
      );
    }
  });

  it("resamples every channel with the same positions", () => {
    const resampler = createResampler({
      sourceRate: 48_000,
      targetRate: 24_000,
      channels: 2,
    });
    const [left, right] = resampler.push(planes([0, 1, 2, 3], [0, 2, 4, 6]));
    expect(left).toHaveLength(right?.length ?? 0);
    for (let index = 0; index < (left?.length ?? 0); index += 1) {
      expect((right?.[index] ?? 0) / 2).toBeCloseTo(left?.[index] ?? 0, 6);
    }
  });
});

describe("createPlanarQueue", () => {
  it("refuses to hand out more than it holds", () => {
    const queue = createPlanarQueue(2);
    queue.push(planes([1, 2], [3, 4]));
    expect(queue.size()).toBe(2);
    expect(queue.take(new Float32Array(8), 4)).toBe(false);
  });

  it("joins chunks into the requested length", () => {
    const queue = createPlanarQueue(2);
    queue.push(planes([1, 2], [-1, -2]));
    queue.push(planes([3, 4], [-3, -4]));
    const target = new Float32Array(8);
    expect(queue.take(target, 4)).toBe(true);
    expect([...target]).toEqual([1, 2, 3, 4, -1, -2, -3, -4]);
    expect(queue.size()).toBe(0);
  });

  it("keeps the leftover of a partially consumed chunk", () => {
    const queue = createPlanarQueue(1);
    queue.push(planes([1, 2, 3, 4, 5]));
    const first = new Float32Array(2);
    expect(queue.take(first, 2)).toBe(true);
    expect([...first]).toEqual([1, 2]);
    expect(queue.size()).toBe(3);

    const second = new Float32Array(3);
    expect(queue.take(second, 3)).toBe(true);
    expect([...second]).toEqual([3, 4, 5]);
    expect(queue.size()).toBe(0);
  });
});
