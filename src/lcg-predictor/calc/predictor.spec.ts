import { LCG } from "./lcg";
import {
  predictNextValueWithKnownParams,
  predictNextValueFromSequenceWithKnownParams,
  calculateUnknownIncrement,
  calculateUnknownMultiplierAndIncrement,
  calculateUnknownParams,
  predictNextValueFromSequence,
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

  describe("パラメータが未知の場合の予測", () => {
    // increment が未知の場合のテスト
    describe("increment が未知の場合", () => {
      it("既知の乱数列からincrementを正しく計算できること", () => {
        // LCGを使って乱数列を生成
        const multiplier = 5n;
        const increment = 3n;
        const modulus = 16n;
        const seed = 7n;

        const lcg = new LCG(seed, multiplier, increment, modulus);
        const x1 = lcg.next(); // 最初の乱数

        const sequence = [seed, x1];
        expect(calculateUnknownIncrement(sequence, multiplier, modulus)).toBe(
          increment,
        );
      });

      it("乱数列の長さが不足している場合はエラーをスローすること", () => {
        expect(() => {
          calculateUnknownIncrement([7n], 5n, 16n);
        }).toThrow(
          "増分を計算するには少なくとも連続した2つの乱数値が必要です。",
        );
      });
    });

    // multiplier と increment が未知の場合のテスト
    describe("multiplier と increment が未知の場合", () => {
      it("既知の乱数列からmultiplierとincrementを正しく計算できること", () => {
        // LCGを使って乱数列を生成
        const multiplier = 9n;
        const increment = 5n;
        const modulus = 16n;
        const seed = 7n;

        const lcg = new LCG(seed, multiplier, increment, modulus);
        const x1 = lcg.next(); // 1回目の乱数
        const x2 = lcg.next(); // 2回目の乱数

        const sequence = [seed, x1, x2];

        // 実装された関数で計算した値をチェック
        const [calculatedMultiplier, calculatedIncrement] =
          calculateUnknownMultiplierAndIncrement(sequence, modulus);

        expect(calculatedMultiplier).toBe(multiplier);
        expect(calculatedIncrement).toBe(increment);

        // 計算された値で次の値も正しく予測できることを確認
        const expectedNextValue = lcg.next(); // 3回目の乱数
        const predictedValue =
          (calculatedMultiplier * x2 + calculatedIncrement) % modulus;

        expect(predictedValue).toBe(expectedNextValue);
      });

      it("実際のLCGパラメータでも正しく計算できること", () => {
        // C/C++ (glibc) のパラメータ
        const multiplier = 1103515245n;
        const increment = 12345n;
        const modulus = 2147483648n; // 2^31
        const seed = 42n;

        const lcg = new LCG(seed, multiplier, increment, modulus);
        const x1 = lcg.next(); // 1回目の乱数
        const x2 = lcg.next(); // 2回目の乱数

        const sequence = [seed, x1, x2];

        const [calculatedMultiplier, calculatedIncrement] =
          calculateUnknownMultiplierAndIncrement(sequence, modulus);

        expect(calculatedMultiplier).toBe(multiplier);
        expect(calculatedIncrement).toBe(increment);
      });

      it("乱数列の長さが不足している場合はエラーをスローすること", () => {
        expect(() => {
          calculateUnknownMultiplierAndIncrement([7n, 6n], 16n);
        }).toThrow(
          "乗数と増分を計算するには少なくとも連続した3つの乱数値が必要です。",
        );
      });
    });

    // すべてのパラメータが未知の場合のテスト
    describe("multiplier, increment, modulus がすべて未知の場合", () => {
      it("既知の乱数列からすべてのパラメータを正しく計算できること", () => {
        // 乱数列を生成するLCGパラメータを定義
        const multiplier = 9n;
        const increment = 5n;
        const modulus = 16n;
        const seed = 7n;

        // LCGを使って乱数列を生成
        const lcg = new LCG(seed, multiplier, increment, modulus);
        const sequence: bigint[] = [seed];

        // 少なくとも7つの乱数を生成
        for (let i = 0; i < 7; i++) {
          sequence.push(lcg.next());
        }

        // パラメータを計算
        const [calculatedMultiplier, calculatedIncrement, calculatedModulus] =
          calculateUnknownParams(sequence);

        // 計算されたパラメータで各遷移が正しいことを検証
        for (let i = 0; i < sequence.length - 1; i++) {
          const current = sequence[i];
          const next = sequence[i + 1];

          if (current === undefined || next === undefined) {
            throw new Error(`配列のインデックス ${i} の要素が存在しません`);
          }

          const nextValue =
            (calculatedMultiplier * current + calculatedIncrement) %
            calculatedModulus;
          expect(nextValue).toBe(next);
        }
      });

      it("乱数列の長さが不足している場合はエラーをスローすること", () => {
        expect(() => {
          calculateUnknownParams([7n, 6n, 13n, 8n, 11n]);
        }).toThrow(
          "全てのパラメータを計算するには少なくとも連続した6つの乱数値が必要です。",
        );
      });
    });

    // 総合的なテスト - 既知の乱数列から次の値を予測
    // TODO: 予測しきれない場合の検知・対応のテスト
    describe("パラメータが全て未知の場合の予測", () => {
      it("既知の乱数列から次の値を正しく予測できること", () => {
        // LCGを使って乱数列を生成
        const multiplier = 9n;
        const increment = 5n;
        const modulus = 16n;
        const seed = 7n;

        const lcg = new LCG(seed, multiplier, increment, modulus);
        const sequence: bigint[] = [seed];

        // 6つの乱数を生成（シードを含めて7つの値）
        for (let i = 0; i < 6; i++) {
          sequence.push(lcg.next());
        }

        // 次の乱数を予測対象とする
        const expectedNextValue = lcg.next();

        // 予測値を計算
        const predictedValue = predictNextValueFromSequence(sequence);

        expect(predictedValue).toBe(expectedNextValue);
      });

      it("実際のLCGパラメータでも次の値を正しく予測できること", () => {
        // より実際的なLCG
        const multiplier = 1103515245n;
        const increment = 12345n;
        const modulus = 2147483648n; // 2^31
        const seed = 42n;

        // LCGを使って乱数列を生成
        const lcg = new LCG(seed, multiplier, increment, modulus);
        const sequence: bigint[] = [seed];

        // 10個の乱数を生成
        for (let i = 0; i < 10; i++) {
          sequence.push(lcg.next());
        }

        // 生成した乱数列から次の値を予測（最後の値は除く）
        const withoutLast = sequence.slice(0, -1);
        const expectedNextValue = sequence[sequence.length - 1];

        expect(predictNextValueFromSequence(withoutLast)).toBe(
          expectedNextValue,
        );
      });

      it("乱数列の長さが不足している場合はエラーをスローすること", () => {
        expect(() => {
          predictNextValueFromSequence([7n, 6n, 13n, 8n, 11n]);
        }).toThrow(
          "次の値を予測するには少なくとも連続した6つの乱数値が必要です。",
        );
      });
    });
  });
});
