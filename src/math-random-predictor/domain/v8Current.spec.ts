import {
  createV8CurrentGeneratorFromSeed,
  floorRandom,
  initializeV8StateFromSeed,
  MATH_RANDOM_MODELS,
  randomToMathRandomNumber,
  state0ToMathRandomNumber,
  V8_CHROME_148_MODEL,
  V8_CURRENT_MODEL,
} from "./v8Current";

describe("v8-node-24-cache-lifo-state0 model", () => {
  it("モデル説明用 metadata を持つこと", () => {
    expect(V8_CURRENT_MODEL).toMatchObject({
      id: "v8-node-24-cache-lifo-state0",
      displayName: "v8-node-24-cache-lifo-state0",
      stateBits: 128,
      outputBits: 53,
      lostBitsPerRawObservation: 11,
      outputTransform: "ToDouble(state.s0)",
    });
    expect(V8_CHROME_148_MODEL).toMatchObject({
      id: "v8-chrome-148-cache-lifo-sum",
      cacheSize: 64,
      outputTransform: "ToDouble(state0 + state1)",
    });
    expect(MATH_RANDOM_MODELS.map((model) => model.id)).toContain(
      "v8-node-24-cache-lifo-state0",
    );
  });

  it("V8 の 64-bit random を Math.random() の Number に変換できること", () => {
    expect(randomToMathRandomNumber(0n)).toBe(0);
    expect(randomToMathRandomNumber((1n << 64n) - 1n)).toBe(
      (2 ** 53 - 1) / 2 ** 53,
    );
    expect(state0ToMathRandomNumber((1n << 64n) - 1n)).toBe(
      (2 ** 53 - 1) / 2 ** 53,
    );
  });

  it("seed 1337 から Node.js 24 / V8 13.6 の Math.random() 実測列を再現できること", () => {
    const generator = createV8CurrentGeneratorFromSeed(1337n);
    const actual = Array.from({ length: 70 }, () => generator.next());

    expect(actual.slice(0, 10)).toEqual([
      0.9311600617849974, 0.3551442693830502, 0.7923158995678378,
      0.7877779424089971, 0.37637226430349113, 0.23137147109312428,
      0.19307439497737655, 0.05294192203272163, 0.9562008120870276,
      0.6770843658906902,
    ]);
    expect(actual.slice(60, 70)).toEqual([
      0.1624414617094847, 0.3060454899651386, 0.044271996522007084,
      0.5398361455864242, 0.6082055562128088, 0.1722477549610658,
      0.40707229060091044, 0.4286880686762242, 0.997629163291995,
      0.8759714900042757,
    ]);
  });

  it("seed 初期化は MurmurHash3(seed) と MurmurHash3(~seed) を使うこと", () => {
    expect(initializeV8StateFromSeed(1337n)).toEqual({
      s0: 6557339690562012544n,
      s1: 9958219219370578552n,
    });
  });

  it("変換系列用に floor(Math.random() * N) を計算できること", () => {
    expect(floorRandom(0.999, 10)).toBe(9);
    expect(floorRandom(0, 10)).toBe(0);
    expect(() => floorRandom(0.5, 1)).toThrow("N は 2 以上の整数が必要です。");
  });
});
