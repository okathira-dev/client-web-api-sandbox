const MASK_64 = (1n << 64n) - 1n;
const TWO_POW_53 = 2 ** 53;
const CACHE_SIZE = 64;

export type V8State = {
  readonly s0: bigint;
  readonly s1: bigint;
};

export type V8ModelMetadata = {
  readonly id: string;
  readonly displayName: string;
  readonly targetEnvironments: readonly string[];
  readonly stateBits: number;
  readonly outputBits: number;
  readonly lostBitsPerRawObservation: number;
  readonly cacheSize: number;
  readonly outputTransform: string;
  readonly outputOrder: string;
  readonly references: readonly string[];
};

export const V8_CURRENT_MODEL: V8ModelMetadata = {
  id: "v8-node-24-cache-lifo-state0",
  displayName: "v8-node-24-cache-lifo-state0",
  targetEnvironments: ["Node.js 24.16.0 / V8 13.6.233.17-node.49"],
  stateBits: 128,
  outputBits: 53,
  lostBitsPerRawObservation: 11,
  cacheSize: CACHE_SIZE,
  outputTransform: "ToDouble(state.s0)",
  outputOrder: "64個のcacheを生成順とは逆順に観測する",
  references: [
    "https://github.com/v8/v8/blob/main/src/base/utils/random-number-generator.h",
    "https://github.com/nodejs/node/blob/main/deps/v8/src/numbers/math-random.cc",
  ],
};

export const V8_CHROME_148_MODEL: V8ModelMetadata = {
  id: "v8-chrome-148-cache-lifo-sum",
  displayName: "v8-chrome-148-cache-lifo-sum",
  targetEnvironments: ["Chrome Stable 148.0.7778.217"],
  stateBits: 128,
  outputBits: 53,
  lostBitsPerRawObservation: 11,
  cacheSize: CACHE_SIZE,
  outputTransform: "ToDouble(state0 + state1)",
  outputOrder: "64個のcacheを生成順とは逆順に観測する",
  references: [
    "https://github.com/v8/v8/blob/main/src/base/utils/random-number-generator.h",
    "https://github.com/v8/v8/blob/main/src/numbers/math-random.cc",
  ],
};

export const V8_DIRECT_MODEL: V8ModelMetadata = {
  id: "v8-main-direct",
  displayName: "V8 main 64-bit direct path",
  targetEnvironments: ["Chromium/V8 main 64-bit direct path"],
  stateBits: 128,
  outputBits: 53,
  lostBitsPerRawObservation: 11,
  cacheSize: 0,
  outputTransform: "ToDouble(state0 + state1)",
  outputOrder: "xorshift128+ の生成順をそのまま観測する",
  references: [
    "https://github.com/v8/v8/blob/main/src/builtins/math.tq",
    "https://github.com/v8/v8/blob/main/src/base/utils/random-number-generator.h",
  ],
};

export const MATH_RANDOM_MODELS = [
  V8_CURRENT_MODEL,
  V8_CHROME_148_MODEL,
  V8_DIRECT_MODEL,
] as const;

/**
 * BigInt を 64bit unsigned 整数として扱うため、上位 bit を切り落とす。
 */
const toUint64 = (value: bigint) => value & MASK_64;

/**
 * V8 が seed 初期化に使う MurmurHash3 系の 64bit mix 関数を再現する。
 */
export const murmurHash3 = (value: bigint): bigint => {
  let hash = toUint64(value);
  hash ^= hash >> 33n;
  hash = toUint64(hash * 0xff51afd7ed558ccdn);
  hash ^= hash >> 33n;
  hash = toUint64(hash * 0xc4ceb9fe1a85ec53n);
  hash ^= hash >> 33n;
  return toUint64(hash);
};

/**
 * 数値 seed から V8 `RandomNumberGenerator` 相当の xorshift128+ state を初期化する。
 */
export const initializeV8StateFromSeed = (seed: bigint): V8State => {
  const normalizedSeed = toUint64(seed);
  return {
    s0: murmurHash3(normalizedSeed),
    s1: murmurHash3(toUint64(~normalizedSeed)),
  };
};

export type XorShift128Step = {
  readonly state: V8State;
  readonly random: bigint;
};

/**
 * V8 の xorshift128+ を 1 step 進め、次 state と `state0 + state1` の 64bit 出力を返す。
 */
export const nextXorShift128Plus = (state: V8State): XorShift128Step => {
  let s1 = state.s0;
  const s0 = state.s1;
  s1 = toUint64(s1 ^ toUint64(s1 << 23n));
  s1 = toUint64(s1 ^ (s1 >> 17n));
  s1 = toUint64(s1 ^ s0);
  s1 = toUint64(s1 ^ (s0 >> 26n));
  const nextState = { s0, s1 };
  return {
    state: nextState,
    random: toUint64(nextState.s0 + nextState.s1),
  };
};

/**
 * xorshift128+ state を指定 step 数だけ進める。
 */
export const advanceV8State = (state: V8State, steps: number): V8State => {
  if (!Number.isInteger(steps) || steps < 0) {
    throw new Error("steps は 0 以上の整数である必要があります。");
  }
  let current = state;
  for (let i = 0; i < steps; i++) {
    current = nextXorShift128Plus(current).state;
  }
  return current;
};

/**
 * 64bit 乱数値を V8 の `ToDouble` 形式で `[0, 1)` の `Math.random()` 値に変換する。
 */
export const randomToMathRandomNumber = (random: bigint): number => {
  return Number(toUint64(random) >> 11n) / TWO_POW_53;
};

/**
 * Node.js 24 系の cache/LIFO 経路と同じく、state0 を直接 `Math.random()` 値へ変換する。
 */
export const state0ToMathRandomNumber = (state0: bigint): number => {
  return randomToMathRandomNumber(state0);
};

/**
 * Node.js 24 系で確認した cache/LIFO + `ToDouble(state.s0)` モデルの generator。
 */
export class V8CurrentGenerator {
  private state: V8State;
  private readonly cache: number[] = [];

  /**
   * 初期 state を受け取り、空の cache から生成を開始する。
   */
  constructor(initialState: V8State) {
    this.state = initialState;
  }

  /**
   * V8 cache から次の `Math.random()` 値を取り出す。
   */
  next(): number {
    if (this.cache.length === 0) {
      this.refillCache();
    }
    const value = this.cache.pop();
    if (value === undefined) {
      throw new Error("V8 random cache の読み出しに失敗しました。");
    }
    return value;
  }

  /**
   * 現在の内部 state を返す。cache 内の未消費値は含まない。
   */
  getState(): V8State {
    return this.state;
  }

  /**
   * V8 と同じく 64 件の乱数値を生成順に cache へ詰める。
   */
  private refillCache() {
    for (let i = 0; i < CACHE_SIZE; i++) {
      const result = nextXorShift128Plus(this.state);
      this.state = result.state;
      this.cache.push(state0ToMathRandomNumber(this.state.s0));
    }
  }
}

/**
 * cache を使わず、xorshift128+ の生成順をそのまま返す direct path 用 generator。
 */
export class V8DirectGenerator {
  private state: V8State;

  /**
   * 初期 state から direct path の生成を開始する。
   */
  constructor(initialState: V8State) {
    this.state = initialState;
  }

  /**
   * state を 1 step 進め、`state0 + state1` を `Math.random()` 値へ変換して返す。
   */
  next(): number {
    const result = nextXorShift128Plus(this.state);
    this.state = result.state;
    return randomToMathRandomNumber(result.random);
  }

  /**
   * 現在の内部 state を返す。
   */
  getState(): V8State {
    return this.state;
  }
}

/**
 * seed から Node.js 24 系の current モデル generator を作成する。
 */
export const createV8CurrentGeneratorFromSeed = (seed: bigint) => {
  return new V8CurrentGenerator(initializeV8StateFromSeed(seed));
};

/**
 * seed から direct path モデル generator を作成する。
 */
export const createV8DirectGeneratorFromSeed = (seed: bigint) => {
  return new V8DirectGenerator(initializeV8StateFromSeed(seed));
};

/**
 * `Math.floor(Math.random() * N)` の観測値を再現するための helper。
 */
export const floorRandom = (value: number, n: number): number => {
  if (!Number.isInteger(n) || n < 2) {
    throw new Error("N は 2 以上の整数が必要です。");
  }
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new Error("乱数値は [0, 1) の範囲である必要があります。");
  }
  return Math.floor(value * n);
};
