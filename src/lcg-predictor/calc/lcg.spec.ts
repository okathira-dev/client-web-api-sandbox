import { calcNextLCG, LCG } from "./lcg";

/**
 * 線形合同法 (Linear Congruential Generator) のテスト
 *
 * 線形合同法は以下の式で表される擬似乱数生成アルゴリズム
 * X_{n+1} = (a * X_n + c) mod m
 *
 * X_0: 初期シード値 (seed)
 * a: 乗数 (multiplier)
 * c: 増分 (increment)
 * m: 法 (modulus)
 */
describe("線形合同法 (LCG) のテスト", () => {
  // calcNextLCG関数のテスト
  describe("calcNextLCG 関数", () => {
    it("基本的な計算が正しく行われること", () => {
      // 簡単なテストケース
      // 引数順: (value, multiplier, increment, modulus)
      expect(calcNextLCG(7n, 5n, 3n, 16n)).toBe(6n); // (5 * 7 + 3) % 16 = 38 % 16 = 6
      expect(calcNextLCG(4n, 3n, 5n, 11n)).toBe(6n); // (3 * 4 + 5) % 11 = 17 % 11 = 6
    });

    it("大きな数値でも正しく計算されること", () => {
      // 大きな数値を使った計算
      const value = 42n;
      const multiplier = 1103515245n;
      const increment = 12345n;
      const modulus = 2147483648n; // 2^31

      // 実際の計算: (1103515245 * 42 + 12345) % 2147483648 = 1250496027
      const expectedNextValue = 1250496027n;
      expect(calcNextLCG(value, multiplier, increment, modulus)).toBe(
        expectedNextValue,
      );
    });

    it("オーバーフローが発生しても正しく処理されること", () => {
      // 大きな数値で計算してもBigIntなので問題ない
      const value = 123456789n;
      const multiplier = 25214903917n;
      const increment = 11n;
      const modulus = 281474976710656n; // 2^48

      // 実際の計算: (25214903917 * 123456789 + 11) % 281474976710656 = 119305093197820
      const expectedValue = 119305093197820n;
      expect(calcNextLCG(value, multiplier, increment, modulus)).toBe(
        expectedValue,
      );
    });
  });

  // LCGクラスのテスト
  describe("LCGクラス", () => {
    it("インスタンス化と基本的な動作テスト", () => {
      // 小さな値でのテスト
      // 引数順: (seed, multiplier, increment, modulus)
      const lcg = new LCG(7n, 5n, 3n, 16n);

      // 初期シードの確認
      expect(lcg.getValue()).toBe(7n);

      // 次の値の計算
      const nextValue = lcg.next();
      expect(nextValue).toBe(6n); // (5 * 7 + 3) % 16 = 38 % 16 = 6

      // 内部状態の更新
      expect(lcg.getValue()).toBe(6n);

      // さらに次の値
      const nextNext = lcg.next();
      expect(nextNext).toBe(1n); // (5 * 6 + 3) % 16 = 33 % 16 = 1
    });

    it("連続した値の生成テスト", () => {
      // C/C++ (glibc) のパラメータを使用
      const seed = 42n;
      const multiplier = 1103515245n;
      const increment = 12345n;
      const modulus = 2147483648n; // 2^31

      // 引数順: (seed, multiplier, increment, modulus)
      const lcg = new LCG(seed, multiplier, increment, modulus);

      // 連続で値を生成（最初の3つだけテスト）
      const nextValue1 = lcg.next();
      const nextValue2 = lcg.next();
      const nextValue3 = lcg.next();

      // 各生成値の検証
      expect(nextValue1).toBe(1250496027n);
      expect(nextValue2).toBe(1116302264n);
      expect(nextValue3).toBe(1000676753n);
    });

    it("様々なプリセットパラメータのテスト", () => {
      // C/C++ (glibc) のパラメータ
      // 引数順: (seed, multiplier, increment, modulus)
      const lcg1 = new LCG(42n, 1103515245n, 12345n, 2147483648n);
      // 実際の計算: (1103515245 * 42 + 12345) % 2147483648 = 1250496027
      expect(lcg1.next()).toBe(1250496027n);

      // Java のパラメータ
      const lcg2 = new LCG(42n, 25214903917n, 11n, 281474976710656n);
      // 実際の計算: (25214903917 * 42 + 11) % 281474976710656 = 119305093197820
      expect(lcg2.next()).toBe(1059025964525n);

      // ANSI C のパラメータ
      const lcg3 = new LCG(42n, 1103515245n, 12345n, 32768n);
      // 実際の計算: (1103515245 * 42 + 12345) % 32768 = 3611
      expect(lcg3.next()).toBe(3611n);
    });
  });
});
