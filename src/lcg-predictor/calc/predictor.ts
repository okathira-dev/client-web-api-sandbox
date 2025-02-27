// 線形合同法乱数予測

// ref: https://msm.lt/posts/cracking-rngs-lcgs
// ref: https://satto.hatenadiary.com/entry/solve-LCG

import { calcNextLCG } from "./lcg";

// multiplier, increment, modulus が分かっている場合
/**
 * 既知のLCGパラメータと現在の乱数値から次の乱数値を予測する
 * @param currentValue 現在の乱数値
 * @param multiplier 乗数 (a)
 * @param increment 増分 (c)
 * @param modulus 法 (m)
 * @returns 次の乱数値
 */
export const predictNextValueWithKnownParams = (
  currentValue: bigint,
  multiplier: bigint,
  increment: bigint,
  modulus: bigint,
): bigint => {
  // ただLCGの計算をするだけ
  return calcNextLCG(currentValue, multiplier, increment, modulus);
};

/**
 * 既知のLCGパラメータと乱数列から次の乱数値を予測する
 * @param sequence 既知の乱数値の配列
 * @param multiplier 乗数 (a)
 * @param increment 増分 (c)
 * @param modulus 法 (m)
 * @returns 次の乱数値
 */
export const predictNextValueFromSequenceWithKnownParams = (
  sequence: bigint[],
  multiplier: bigint,
  increment: bigint,
  modulus: bigint,
): bigint => {
  // 配列の最後の値を使用して次の値を予測
  const lastValue = sequence.at(-1);
  if (lastValue === undefined) {
    throw new Error("乱数列が空です。少なくとも1つの値が必要です。");
  }

  return predictNextValueWithKnownParams(
    lastValue,
    multiplier,
    increment,
    modulus,
  );
};

/**
 * increment (増分) が未知の場合にそれを求める
 * X_1 = (multiplier * X_0 + increment) % modulus
 * increment = (X_1 - multiplier * X_0) % modulus
 *
 * @param sequence 連続した2つ以上の乱数値の配列
 * @param multiplier 既知の乗数
 * @param modulus 既知の法
 * @returns 求められた増分値
 */
export const calculateUnknownIncrement = (
  sequence: bigint[],
  multiplier: bigint,
  modulus: bigint,
): bigint => {
  if (sequence.length < 2) {
    throw new Error(
      "増分を計算するには少なくとも連続した2つの乱数値が必要です。",
    );
  }

  // X_1 = (multiplier * X_0 + increment) % modulus より
  // increment = (X_1 - multiplier * X_0) % modulus
  const X0 = sequence[0];
  const X1 = sequence[1];

  // 配列要素が存在することを確認
  if (X0 === undefined || X1 === undefined) {
    throw new Error("乱数列のインデックスが無効です。");
  }

  // 負の数にならないように modulus を足してから modulus で割る
  let increment = (X1 - multiplier * X0) % modulus;
  if (increment < 0n) {
    increment = (increment + modulus) % modulus;
  }

  return increment;
};

/**
 * multiplier (乗数) と increment (増分) が未知の場合に、それらを求める
 * X_1 = (multiplier * X_0 + increment) % modulus
 * X_2 = (multiplier * X_1 + increment) % modulus
 *
 * 式の差分を取る:
 * X_2 - X_1 = (multiplier * (X_1 - X_0)) % modulus
 *
 * @param sequence 連続した3つ以上の乱数値の配列
 * @param modulus 既知の法
 * @returns [乗数, 増分] のタプル
 */
export const calculateUnknownMultiplierAndIncrement = (
  sequence: bigint[],
  modulus: bigint,
): [bigint, bigint] => {
  if (sequence.length < 3) {
    throw new Error(
      "乗数と増分を計算するには少なくとも連続した3つの乱数値が必要です。",
    );
  }

  const X0 = sequence[0];
  const X1 = sequence[1];
  const X2 = sequence[2];

  // 配列要素が存在することを確認
  if (X0 === undefined || X1 === undefined || X2 === undefined) {
    throw new Error("乱数列のインデックスが無効です。");
  }

  // 逆元を計算する関数
  const modInverse = (a: bigint, m: bigint): bigint => {
    // 拡張ユークリッドアルゴリズムを使って逆元を計算
    let [old_r, r] = [a, m];
    let [old_s, s] = [1n, 0n];

    while (r !== 0n) {
      const quotient = old_r / r;
      [old_r, r] = [r, old_r - quotient * r];
      [old_s, s] = [s, old_s - quotient * s];
    }

    // GCD(a, m) != 1 なら逆元は存在しない
    if (old_r !== 1n) {
      throw new Error(`${a}と${m}は互いに素ではないため、逆元が存在しません。`);
    }

    return ((old_s % m) + m) % m;
  };

  // 差分を計算
  let diff1 = (X1 - X0) % modulus;
  if (diff1 < 0n) diff1 = (diff1 + modulus) % modulus;

  let diff2 = (X2 - X1) % modulus;
  if (diff2 < 0n) diff2 = (diff2 + modulus) % modulus;

  // 乗数を計算: multiplier = (X_2 - X_1) * (X_1 - X_0)^(-1) % modulus
  const multiplier = (diff2 * modInverse(diff1, modulus)) % modulus;

  // 増分を計算: increment = (X_1 - multiplier * X_0) % modulus
  let increment = (X1 - multiplier * X0) % modulus;
  if (increment < 0n) increment = (increment + modulus) % modulus;

  return [multiplier, increment];
};

/**
 * 最大公約数(GCD)を計算する
 * @param a 整数
 * @param b 整数
 * @returns 最大公約数
 */
const gcd = (a: bigint, b: bigint): bigint => {
  while (b !== 0n) {
    [a, b] = [b, a % b];
  }
  return a;
};

/**
 * 複数の数値の最大公約数を計算する
 * @param numbers 整数の配列
 * @returns 最大公約数
 */
const multiGcd = (numbers: bigint[]): bigint => {
  if (numbers.length === 0) {
    throw new Error("GCDを計算するには少なくとも1つの数値が必要です。");
  }

  const firstNumber = numbers[0];
  if (firstNumber === undefined) {
    throw new Error("配列の最初の要素が未定義です。");
  }

  let result = firstNumber;
  for (let i = 1; i < numbers.length; i++) {
    const currentNumber = numbers[i];
    if (currentNumber === undefined) {
      throw new Error(`配列のインデックス ${i} の要素が未定義です。`);
    }
    result = gcd(result, currentNumber);
    if (result === 1n) break; // 最大公約数が1ならそれ以上計算しても変わらない
  }

  return result;
};

/**
 * multiplier (乗数), increment (増分), modulus (法) が全て未知の場合に、それらを求める
 *
 * @param sequence 連続した少なくとも6つの乱数値の配列
 * @returns [乗数, 増分, 法] のタプル
 */
export const calculateUnknownParams = (
  sequence: bigint[],
): [bigint, bigint, bigint] => {
  if (sequence.length < 6) {
    throw new Error(
      "全てのパラメータを計算するには少なくとも連続した6つの乱数値が必要です。",
    );
  }

  // 連続する値の差分を計算
  const diffs: bigint[] = [];
  for (let i = 0; i < sequence.length - 1; i++) {
    const current = sequence[i];
    const next = sequence[i + 1];

    if (current === undefined || next === undefined) {
      throw new Error("乱数列のインデックスが無効です。");
    }

    diffs.push(next - current);
  }

  // 二次差分を計算して modulus の倍数を見つける
  const modulusMultiples: bigint[] = [];
  for (let i = 0; i < diffs.length - 2; i++) {
    const diff0 = diffs[i];
    const diff1 = diffs[i + 1];
    const diff2 = diffs[i + 2];

    if (diff0 === undefined || diff1 === undefined || diff2 === undefined) {
      throw new Error("差分列のインデックスが無効です。");
    }

    // T_2 * T_0 - T_1^2 は modulus の倍数
    const multiple = diff2 * diff0 - diff1 * diff1;
    modulusMultiples.push(multiple < 0n ? -multiple : multiple);
  }

  // modulus の倍数の最大公約数を計算
  // 十分な数の modulusMultiples があるとき、その最大公約数は modulus と一致するという考え。このときの最大公約数を真の最大公約数とする。
  // modulusMultiples が多ければ多いほど、その最大公約数が真の最大公約数 (=modulus) となる確率が高くなる。
  // 言い換えると、得られた modulusMultiples での最大公約数が真の最大公約数ではなくただの公約数の可能性がある。（modulusMultiplesが互いに素ではないとき？）
  // TODO: 求められない場合の検知・対応 https://prng.var.tailcall.net/lcg4_total このパターンとか？
  const modulus = multiGcd(modulusMultiples);

  // 乗数と増分を計算
  const [multiplier, increment] = calculateUnknownMultiplierAndIncrement(
    sequence,
    modulus,
  );

  return [multiplier, increment, modulus];
};

/**
 * 既知の乱数列から各種パラメータを予測し、次の値を予測する
 * @param sequence 既知の乱数値の配列
 * @returns 次の乱数値
 */
export const predictNextValueFromSequence = (sequence: bigint[]): bigint => {
  if (sequence.length < 6) {
    throw new Error(
      "次の値を予測するには少なくとも連続した6つの乱数値が必要です。",
    );
  }

  // パラメータを計算
  const [multiplier, increment, modulus] = calculateUnknownParams(sequence);

  // 次の値を予測
  const lastValue = sequence.at(-1);
  if (lastValue === undefined) {
    throw new Error("乱数列が空です。");
  }

  return predictNextValueWithKnownParams(
    lastValue,
    multiplier,
    increment,
    modulus,
  );
};
