export type UnicodeFixtureLayout = "inline" | "mayan";
export type UnicodeFixtureDirection = "ltr" | "rtl";

type NumeralSystem =
  | {
      kind: "decimal-digits";
      zeroCodePoint: number;
    }
  | {
      kind: "han";
    }
  | {
      kind: "counting-rods";
    }
  | {
      kind: "base20";
      zeroCodePoint: number;
    };

export type UnicodeFixture = {
  id: `B${string}`;
  systemName: string;
  unicodeVersion: string;
  direction: UnicodeFixtureDirection;
  layout: UnicodeFixtureLayout;
  radix: 10 | 20;
  leftValue: number;
  rightValue: number;
  leftText: string;
  rightText: string;
  operator: string;
  answer: number;
  system: NumeralSystem;
};

const HAN_DIGITS = "〇一二三四五六七八九";
const COUNTING_ROD_UNIT_ONE = 0x1d360;
const COUNTING_ROD_TENS_ONE = 0x1d369;

function codePointOf(glyph: string): number {
  const codePoint = glyph.codePointAt(0);
  if (codePoint === undefined) {
    throw new RangeError("Expected one Unicode glyph.");
  }
  return codePoint;
}

function fixedDigits(value: number, radix: 10 | 20): [number, number, number] {
  const highestPlace = radix * radix;
  if (
    !Number.isInteger(value) ||
    value < highestPlace ||
    value >= highestPlace * radix
  ) {
    throw new RangeError(`${value} is not a three-digit base-${radix} value.`);
  }
  return [
    Math.floor(value / highestPlace),
    Math.floor(value / radix) % radix,
    value % radix,
  ];
}

function formatContiguousDigits(
  value: number,
  radix: 10 | 20,
  zeroCodePoint: number,
): string {
  return fixedDigits(value, radix)
    .map((digit) => String.fromCodePoint(zeroCodePoint + digit))
    .join("");
}

function parseContiguousDigits(
  text: string,
  radix: 10 | 20,
  zeroCodePoint: number,
): number {
  const digits = [...text].map((glyph) => codePointOf(glyph) - zeroCodePoint);
  if (
    digits.length !== 3 ||
    digits.some((digit) => digit < 0 || digit >= radix)
  ) {
    throw new RangeError(`Invalid three-digit base-${radix} numeral.`);
  }
  return digits.reduce((value, digit) => value * radix + digit, 0);
}

function formatHan(value: number): string {
  const [hundreds, tens, ones] = fixedDigits(value, 10);
  return [
    hundreds === 1 ? "" : HAN_DIGITS[hundreds],
    "百",
    tens === 0 ? "" : `${tens === 1 ? "" : HAN_DIGITS[tens]}十`,
    ones === 0 ? "" : HAN_DIGITS[ones],
  ].join("");
}

function parseHan(text: string): number {
  let pendingDigit: number | undefined;
  let value = 0;
  for (const glyph of text) {
    const digit = HAN_DIGITS.indexOf(glyph);
    if (digit >= 0) {
      pendingDigit = digit;
      continue;
    }
    if (glyph === "百") {
      value += (pendingDigit ?? 1) * 100;
      pendingDigit = undefined;
      continue;
    }
    if (glyph === "十") {
      value += (pendingDigit ?? 1) * 10;
      pendingDigit = undefined;
      continue;
    }
    throw new RangeError("Invalid Han numeral glyph.");
  }
  return value + (pendingDigit ?? 0);
}

function formatCountingRods(value: number): string {
  const digits = fixedDigits(value, 10);
  if (digits.includes(0)) {
    throw new RangeError("The counting-rod fixture does not use zero.");
  }
  return digits
    .map((digit, index) =>
      String.fromCodePoint(
        (index === 1 ? COUNTING_ROD_TENS_ONE : COUNTING_ROD_UNIT_ONE) +
          digit -
          1,
      ),
    )
    .join("");
}

function parseCountingRods(text: string): number {
  const glyphs = [...text];
  if (glyphs.length !== 3) {
    throw new RangeError("Invalid three-digit counting-rod numeral.");
  }
  const digits = glyphs.map((glyph, index) => {
    const base = index === 1 ? COUNTING_ROD_TENS_ONE : COUNTING_ROD_UNIT_ONE;
    return codePointOf(glyph) - base + 1;
  });
  if (digits.some((digit) => digit < 1 || digit > 9)) {
    throw new RangeError("Invalid counting-rod place form.");
  }
  return digits.reduce((value, digit) => value * 10 + digit, 0);
}

function formatOperand(system: NumeralSystem, value: number): string {
  switch (system.kind) {
    case "decimal-digits":
      return formatContiguousDigits(value, 10, system.zeroCodePoint);
    case "han":
      return formatHan(value);
    case "counting-rods":
      return formatCountingRods(value);
    case "base20":
      return formatContiguousDigits(value, 20, system.zeroCodePoint);
  }
}

export function parseUnicodeOperand(
  fixture: UnicodeFixture,
  text: string,
): number {
  switch (fixture.system.kind) {
    case "decimal-digits":
      return parseContiguousDigits(text, 10, fixture.system.zeroCodePoint);
    case "han":
      return parseHan(text);
    case "counting-rods":
      return parseCountingRods(text);
    case "base20":
      return parseContiguousDigits(text, 20, fixture.system.zeroCodePoint);
  }
}

type FixtureInput = Omit<
  UnicodeFixture,
  "answer" | "leftText" | "rightText" | "unicodeVersion"
>;

function fixture(input: FixtureInput): UnicodeFixture {
  return {
    ...input,
    unicodeVersion: "17.0",
    leftText: formatOperand(input.system, input.leftValue),
    rightText: formatOperand(input.system, input.rightValue),
    answer: input.leftValue + input.rightValue,
  };
}

export const unicodeFixtures: readonly UnicodeFixture[] = [
  fixture({
    id: "B01",
    systemName: "ASCII / European digits",
    direction: "ltr",
    layout: "inline",
    radix: 10,
    leftValue: 123,
    rightValue: 456,
    operator: "+",
    system: { kind: "decimal-digits", zeroCodePoint: 0x30 },
  }),
  fixture({
    id: "B02",
    systemName: "Arabic-Indic digits",
    direction: "rtl",
    layout: "inline",
    radix: 10,
    leftValue: 234,
    rightValue: 567,
    operator: "+",
    system: { kind: "decimal-digits", zeroCodePoint: 0x660 },
  }),
  fixture({
    id: "B03",
    systemName: "Eastern Arabic-Indic digits",
    direction: "rtl",
    layout: "inline",
    radix: 10,
    leftValue: 345,
    rightValue: 678,
    operator: "+",
    system: { kind: "decimal-digits", zeroCodePoint: 0x6f0 },
  }),
  fixture({
    id: "B04",
    systemName: "Han numerals",
    direction: "ltr",
    layout: "inline",
    radix: 10,
    leftValue: 456,
    rightValue: 321,
    operator: "+",
    system: { kind: "han" },
  }),
  fixture({
    id: "B05",
    systemName: "Osmanya digits",
    direction: "ltr",
    layout: "inline",
    radix: 10,
    leftValue: 517,
    rightValue: 264,
    operator: "+",
    system: { kind: "decimal-digits", zeroCodePoint: 0x104a0 },
  }),
  fixture({
    id: "B06",
    systemName: "Adlam digits",
    direction: "rtl",
    layout: "inline",
    radix: 10,
    leftValue: 629,
    rightValue: 154,
    operator: "+",
    system: { kind: "decimal-digits", zeroCodePoint: 0x1e950 },
  }),
  fixture({
    id: "B07",
    systemName: "N'Ko digits",
    direction: "rtl",
    layout: "inline",
    radix: 10,
    leftValue: 731,
    rightValue: 168,
    operator: "+",
    system: { kind: "decimal-digits", zeroCodePoint: 0x7c0 },
  }),
  fixture({
    id: "B08",
    systemName: "Garay digits",
    direction: "rtl",
    layout: "inline",
    radix: 10,
    leftValue: 842,
    rightValue: 157,
    operator: "+",
    system: { kind: "decimal-digits", zeroCodePoint: 0x10d40 },
  }),
  fixture({
    id: "B09",
    systemName: "Ol Chiki digits",
    direction: "ltr",
    layout: "inline",
    radix: 10,
    leftValue: 913,
    rightValue: 286,
    operator: "+",
    system: { kind: "decimal-digits", zeroCodePoint: 0x1c50 },
  }),
  fixture({
    id: "B10",
    systemName: "Mro digits",
    direction: "ltr",
    layout: "inline",
    radix: 10,
    leftValue: 184,
    rightValue: 725,
    operator: "+",
    system: { kind: "decimal-digits", zeroCodePoint: 0x16a60 },
  }),
  fixture({
    id: "B11",
    systemName: "Wancho digits",
    direction: "ltr",
    layout: "inline",
    radix: 10,
    leftValue: 295,
    rightValue: 613,
    operator: "+",
    system: { kind: "decimal-digits", zeroCodePoint: 0x1e2f0 },
  }),
  fixture({
    id: "B12",
    systemName: "Nag Mundari digits",
    direction: "ltr",
    layout: "inline",
    radix: 10,
    leftValue: 376,
    rightValue: 522,
    operator: "+",
    system: { kind: "decimal-digits", zeroCodePoint: 0x1e4f0 },
  }),
  fixture({
    id: "B13",
    systemName: "Ol Onal digits",
    direction: "ltr",
    layout: "inline",
    radix: 10,
    leftValue: 487,
    rightValue: 410,
    operator: "+",
    system: { kind: "decimal-digits", zeroCodePoint: 0x1e5f1 },
  }),
  fixture({
    id: "B14",
    systemName: "Sora Sompeng digits",
    direction: "ltr",
    layout: "inline",
    radix: 10,
    leftValue: 598,
    rightValue: 307,
    operator: "+",
    system: { kind: "decimal-digits", zeroCodePoint: 0x110f0 },
  }),
  fixture({
    id: "B15",
    systemName: "Counting Rod Numerals",
    direction: "ltr",
    layout: "inline",
    radix: 10,
    leftValue: 619,
    rightValue: 274,
    operator: "+",
    system: { kind: "counting-rods" },
  }),
  fixture({
    id: "B16",
    systemName: "Kaktovik numerals",
    direction: "ltr",
    layout: "inline",
    radix: 20,
    leftValue: 1_352,
    rightValue: 1_781,
    operator: "+",
    system: { kind: "base20", zeroCodePoint: 0x1d2c0 },
  }),
  fixture({
    id: "B17",
    systemName: "Mayan numerals",
    direction: "ltr",
    layout: "mayan",
    radix: 20,
    leftValue: 2_056,
    rightValue: 1_023,
    operator: "+",
    system: { kind: "base20", zeroCodePoint: 0x1d2e0 },
  }),
] as const;

export function unicodeExpressionText(fixture: UnicodeFixture): string {
  return `${fixture.leftText} ${fixture.operator} ${fixture.rightText}`;
}

export const unicodeFixtureCodePoints = [
  ...new Set(
    unicodeFixtures.flatMap((item) =>
      [...unicodeExpressionText(item)].map(codePointOf),
    ),
  ),
].sort((left, right) => left - right);
