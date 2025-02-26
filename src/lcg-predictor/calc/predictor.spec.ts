import {
  predictNextValueWithKnownParams,
  predictNextValueFromSequenceWithKnownParams,
} from "./predictor";

/**
 * 線形合同法乱数予測のテスト
 */
describe("線形合同法乱数予測のテスト", () => {
  // 既知のパラメータでの予測に関するテスト
  describe("既知のパラメータでの予測", () => {
    it("基本的な計算が正しく行われること", () => {
      // 簡単なテストケース
      // 引数順: (currentValue, multiplier, increment, modulus)
      expect(predictNextValueWithKnownParams(7n, 5n, 3n, 16n)).toBe(6n); // (5 * 7 + 3) % 16 = 38 % 16 = 6
      expect(predictNextValueWithKnownParams(4n, 3n, 5n, 11n)).toBe(6n); // (3 * 4 + 5) % 11 = 17 % 11 = 6
    });

    it("大きな数値でも正しく計算されること", () => {
      // 大きな数値を使った計算
      const value = 42n;
      const multiplier = 1103515245n;
      const increment = 12345n;
      const modulus = 2147483648n; // 2^31

      // 実際の計算: (1103515245 * 42 + 12345) % 2147483648 = 1250496027
      const expectedNextValue = 1250496027n;
      expect(
        predictNextValueWithKnownParams(value, multiplier, increment, modulus),
      ).toBe(expectedNextValue);
    });

    it("一般的なLCGパラメータセットで正しく予測できること", () => {
      // C/C++ (glibc) のパラメータ
      expect(
        predictNextValueWithKnownParams(42n, 1103515245n, 12345n, 2147483648n),
      ).toBe(1250496027n);

      // Java のパラメータ
      expect(
        predictNextValueWithKnownParams(
          42n,
          25214903917n,
          11n,
          281474976710656n,
        ),
      ).toBe(1059025964525n);

      // ANSI C のパラメータ
      expect(
        predictNextValueWithKnownParams(42n, 1103515245n, 12345n, 32768n),
      ).toBe(3611n);
    });
  });

  describe("乱数列からの予測", () => {
    it("乱数列から次の値を正しく予測できること", () => {
      // 簡単なテストケース
      // 引数順: (sequence, multiplier, increment, modulus)
      expect(
        predictNextValueFromSequenceWithKnownParams([7n], 5n, 3n, 16n),
      ).toBe(6n); // (5 * 7 + 3) % 16 = 38 % 16 = 6
      expect(
        predictNextValueFromSequenceWithKnownParams([1n, 4n], 3n, 5n, 11n),
      ).toBe(6n); // 最後の値4から: (3 * 4 + 5) % 11 = 17 % 11 = 6
    });

    it("複数の値を含む乱数列から次の値を予測できること", () => {
      // C/C++ (glibc) のパラメータ
      const sequence = [
        42n, // 初期値
        1250496027n, // 1回目の乱数
        1116302264n, // 2回目の乱数
      ];
      const multiplier = 1103515245n;
      const increment = 12345n;
      const modulus = 2147483648n; // 2^31

      // 次の値 (3回目の乱数) を予測
      const expectedNextValue = 1000676753n;

      expect(
        predictNextValueFromSequenceWithKnownParams(
          sequence,
          multiplier,
          increment,
          modulus,
        ),
      ).toBe(expectedNextValue);
    });

    it("空の乱数列の場合はエラーをスローすること", () => {
      expect(() => {
        predictNextValueFromSequenceWithKnownParams(
          [],
          1103515245n,
          12345n,
          2147483648n,
        );
      }).toThrow("乱数列が空です。少なくとも1つの値が必要です。");
    });
  });
});
