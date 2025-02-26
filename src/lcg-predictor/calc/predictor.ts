// 線形合同法乱数予測

// ref: https://tailcall.net/blog/cracking-randomness-lcgs/ (archived: https://web.archive.org/web/20190412090429/https://tailcall.net/blog/cracking-randomness-lcgs/)
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
