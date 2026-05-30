import {
  parseConvertedObservations,
  parseRawObservations,
  rawObservationToMantissa,
} from "./observations";

describe("observations", () => {
  it("空白・カンマ・改行区切りの生系列を JS Number として parse できること", () => {
    expect(parseRawObservations("0.1, 0.25\n0.5\t0.75")).toEqual([
      0.1, 0.25, 0.5, 0.75,
    ]);
  });

  it("生系列は [0, 1) の有限数だけを受け付けること", () => {
    expect(() => parseRawObservations("")).toThrow("観測値が空です。");
    expect(() => parseRawObservations("0.1 nope")).toThrow(
      "観測値 2 が数値ではありません: nope",
    );
    expect(() => parseRawObservations("0 1")).toThrow(
      "観測値 2 は [0, 1) の範囲である必要があります: 1",
    );
  });

  it("生系列の JS Number から 53-bit 観測 mantissa を取り出せること", () => {
    expect(rawObservationToMantissa(0)).toBe(0n);
    expect(rawObservationToMantissa((2 ** 53 - 1) / 2 ** 53)).toBe(
      (1n << 53n) - 1n,
    );
  });

  it("変換系列は N と 0..N-1 の整数だけを受け付けること", () => {
    expect(parseConvertedObservations("0, 1 5", 6)).toEqual([0, 1, 5]);
    expect(() => parseConvertedObservations("0", 1)).toThrow(
      "N は 2 以上の整数が必要です。",
    );
    expect(() => parseConvertedObservations("0 6", 6)).toThrow(
      "観測値 2 は 0..5 の整数である必要があります: 6",
    );
  });
});
