/**
 * CLI や UI から受け取った観測値文字列を、空白・カンマ区切りの token に分割する。
 */
const tokenize = (input: string): string[] => {
  return input
    .split(/[\s,]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
};

/**
 * 観測値入力を token 化し、空入力なら利用者向けのエラーに変換する。
 */
const ensureTokens = (input: string): string[] => {
  const tokens = tokenize(input);
  if (tokens.length === 0) {
    throw new Error("観測値が空です。");
  }
  return tokens;
};

/**
 * `Math.random()` の生値を表す文字列を `[0, 1)` の数値配列へ変換する。
 *
 * 空白・カンマ区切りの入力を許可し、不正な token や範囲外の値は
 * 何番目の観測値か分かる形でエラーにする。
 */
export const parseRawObservations = (input: string): number[] => {
  return ensureTokens(input).map((token, index) => {
    const value = Number(token);
    if (!Number.isFinite(value)) {
      throw new Error(`観測値 ${index + 1} が数値ではありません: ${token}`);
    }
    if (value < 0 || value >= 1) {
      throw new Error(
        `観測値 ${index + 1} は [0, 1) の範囲である必要があります: ${token}`,
      );
    }
    return value;
  });
};

/**
 * `Math.random()` の生値を、V8 の `ToDouble` が公開する上位 mantissa bit に変換する。
 *
 * V8 current の raw 観測では 53bit を既知の制約として扱い、
 * 失われた下位 bit は solver 側で未知変数として扱う。
 */
export const rawObservationToMantissa = (
  value: number,
  outputBits = 53,
): bigint => {
  if (!Number.isInteger(outputBits) || outputBits < 1 || outputBits > 53) {
    throw new Error("outputBits は 1..53 の整数である必要があります。");
  }
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new Error("観測値は [0, 1) の範囲である必要があります。");
  }
  return BigInt(Math.trunc(value * 2 ** outputBits));
};

/**
 * `Math.floor(Math.random() * N)` の観測値文字列を整数配列へ変換する。
 *
 * まだ solver 本体は converted observation を扱わないが、
 * CLI/UI で同じ入力検証を使えるよう domain 層に置いている。
 */
export const parseConvertedObservations = (
  input: string,
  n: number,
): number[] => {
  if (!Number.isInteger(n) || n < 2) {
    throw new Error("N は 2 以上の整数が必要です。");
  }
  return ensureTokens(input).map((token, index) => {
    const value = Number(token);
    if (!Number.isInteger(value) || value < 0 || value >= n) {
      throw new Error(
        `観測値 ${index + 1} は 0..${n - 1} の整数である必要があります: ${token}`,
      );
    }
    return value;
  });
};
