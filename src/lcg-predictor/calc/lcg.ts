// LCG

// ref: https://tailcall.net/blog/cracking-randomness-lcgs/ (archived: https://web.archive.org/web/20190412090429/https://tailcall.net/blog/cracking-randomness-lcgs/)
// ref: https://satto.hatenadiary.com/entry/solve-LCG
// ref: https://ja.wikipedia.org/wiki/%E7%B7%9A%E5%BD%A2%E5%90%88%E5%90%8C%E6%B3%95

export const calcNextLCG = (
  state: bigint,
  multiplier: bigint,
  increment: bigint,
  modulus: bigint,
) => {
  return (multiplier * state + increment) % modulus;
};

export class LCG {
  private state: bigint;
  private readonly multiplier: bigint;
  private readonly increment: bigint;
  private readonly modulus: bigint;

  constructor(
    seed: bigint,
    multiplier: bigint,
    increment: bigint,
    modulus: bigint,
  ) {
    this.state = seed;
    this.multiplier = multiplier;
    this.increment = increment;
    this.modulus = modulus;
  }

  next() {
    this.state = calcNextLCG(
      this.state,
      this.multiplier,
      this.increment,
      this.modulus,
    );
    return this.state;
  }

  getValue() {
    return this.state;
  }

  getMultiplier() {
    return this.multiplier;
  }

  getIncrement() {
    return this.increment;
  }

  getModulus() {
    return this.modulus;
  }
}
