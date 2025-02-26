// 線形合同法 (LCG) の一般的なパラメータのプリセット

export type LcgParams = {
  a: bigint; // 乗数
  c: bigint; // 増分
  m: bigint; // 法
};

// プリセット名を列挙型として定義
export type LcgPresetName = "C/C++ (glibc)" | "Java" | "ANSI C" | "Custom";

/**
 * TODO: ソースを確認する
 * 一般的なLCGパラメータのプリセット
 * - C/C++ (glibc): C言語の標準ライブラリで使用されているパラメータ
 * - Java: Javaの乱数生成器で使用されているパラメータ
 * - ANSI C: ANSI Cで定義されているパラメータ
 * - Custom: カスタムパラメータ用の初期値
 */
export const LCG_PRESETS: Record<LcgPresetName, LcgParams> = {
  "C/C++ (glibc)": {
    a: 1103515245n,
    c: 12345n,
    m: 2147483648n, // 2^31
  },
  Java: {
    a: 25214903917n,
    c: 11n,
    m: 281474976710656n, // 2^48
  },
  "ANSI C": {
    a: 1103515245n,
    c: 12345n,
    m: 32768n, // 2^15
  },
  Custom: {
    a: 0n,
    c: 0n,
    m: 0n,
  },
};
