/**
 * mantissa 半開区間 `[lowerInclusive, upperExclusive)` から、
 * 区間内のすべての値で共通する bit を抽出する。
 */
export type FixedMantissaBit = {
  /** mantissa の LSB から数えた bit 位置（0..outputBits-1）。 */
  readonly bit: number;
  readonly value: 0 | 1;
};

/**
 * `[lowerInclusive, upperExclusive)` 内で値が一意に定まる mantissa bit を MSB 側から列挙する。
 *
 * `lowerInclusive` と `upperExclusive - 1` が MSB 側で一致するプレフィックス長だけが確定する。
 */
export const extractFixedMantissaBitsFromInterval = (
  lowerInclusive: bigint,
  upperExclusive: bigint,
  outputBits: number,
): readonly FixedMantissaBit[] => {
  if (lowerInclusive >= upperExclusive) {
    return [];
  }
  if (!Number.isInteger(outputBits) || outputBits < 1) {
    throw new Error("outputBits は 1 以上の整数である必要があります。");
  }

  const upperLast = upperExclusive - 1n;
  const fixed: FixedMantissaBit[] = [];

  for (let bit = outputBits - 1; bit >= 0; bit--) {
    const mask = 1n << BigInt(bit);
    const lowerBit = ((lowerInclusive & mask) === 0n ? 0 : 1) as 0 | 1;
    const upperBit = ((upperLast & mask) === 0n ? 0 : 1) as 0 | 1;
    if (lowerBit !== upperBit) {
      break;
    }
    fixed.push({ bit, value: lowerBit });
  }

  return fixed;
};
