export const encodingLabels = [
  "utf-8",
  "windows-1252",
  "iso-8859-2",
  "iso-8859-5",
  "shift_jis",
  "windows-1255",
  "gbk",
  "big5",
  "koi8-r",
  "koi8-u",
  "ibm866",
  "macintosh",
  "x-mac-cyrillic",
  "windows-1251",
  "iso-8859-7",
  "windows-874",
] as const;

export type EncodingLabel = (typeof encodingLabels)[number];

type MojibakeEncodingFixture = {
  readonly bytes: readonly number[];
  readonly expectedText: string;
  readonly id: string;
  readonly kind: "mojibake";
  readonly presentedText: string;
  readonly renderedLabel: EncodingLabel;
  readonly sourceLabel: EncodingLabel;
};

export type EncodingFixture = MojibakeEncodingFixture;

export type EncodingFixturePosition = {
  readonly bytes: readonly number[];
  readonly expectedLabel: EncodingLabel;
  readonly expectedText: string;
  readonly id: string;
};

const mojibakeFixture = (
  id: string,
  sourceLabel: EncodingLabel,
  renderedLabel: EncodingLabel,
  bytes: readonly number[],
  expectedText: string,
  presentedText: string,
): MojibakeEncodingFixture => ({
  bytes,
  expectedText,
  id,
  kind: "mojibake",
  presentedText,
  renderedLabel,
  sourceLabel,
});

/** Eight fixed mojibake questions. Each question has an ordered source and
 * display decoder pair; the player submits the recovered text, not a label. */
export const encodingFixtures = [
  mojibakeFixture(
    "M01",
    "utf-8",
    "windows-1252",
    [
      0x63, 0x61, 0x66, 0xc3, 0xa9, 0x20, 0x66, 0x72, 0x61, 0x6e, 0xc3, 0xa7,
      0x61, 0x69, 0x73,
    ],
    "café français",
    "cafÃ© franÃ§ais",
  ),
  mojibakeFixture(
    "M02",
    "koi8-r",
    "windows-1251",
    [0xd2, 0xd5, 0xd3, 0xd3, 0xcb, 0xc9, 0xca, 0x20, 0xd1, 0xdd, 0xc9, 0xcb],
    "русский ящик",
    "ТХУУЛЙК СЭЙЛ",
  ),
  mojibakeFixture(
    "M03",
    "koi8-u",
    "ibm866",
    [
      0xd5, 0xcb, 0xd2, 0xc1, 0xa7, 0xce, 0xd3, 0xd8, 0xcb, 0xc9, 0xca, 0x20,
      0xcb, 0xcf, 0xc4,
    ],
    "український код",
    "╒╦╥┴з╬╙╪╦╔╩ ╦╧─",
  ),
  mojibakeFixture(
    "M04",
    "macintosh",
    "x-mac-cyrillic",
    [0x8c, 0x62, 0x6e, 0x20, 0xbe, 0x73, 0x6b, 0x65, 0x6e],
    "åbn æsken",
    "Мbn Њsken",
  ),
  mojibakeFixture(
    "M05",
    "windows-1255",
    "iso-8859-7",
    [0xfa, 0xe9, 0xe1, 0xfa, 0x20, 0xf7, 0xe5, 0xe3],
    "תיבת קוד",
    "ϊιαϊ χεγ",
  ),
  mojibakeFixture(
    "M06",
    "windows-874",
    "windows-1252",
    [0xa1, 0xc5, 0xe8, 0xcd, 0xa7, 0x20, 0xc3, 0xcb, 0xd1, 0xca],
    "กล่อง รหัส",
    "¡ÅèÍ§ ÃËÑÊ",
  ),
  mojibakeFixture(
    "M07",
    "iso-8859-2",
    "macintosh",
    [0xe8, 0x65, 0x73, 0x6b, 0xfd, 0x20, 0x6b, 0xf3, 0x64],
    "český kód",
    "Ëesk˝ kÛd",
  ),
  mojibakeFixture(
    "M08",
    "gbk",
    "big5",
    [0xb1, 0xe0, 0xc2, 0xeb, 0x20, 0xb1, 0xa6, 0xcf, 0xe4],
    "编码 宝箱",
    "晤鎢 惘眊",
  ),
] as const satisfies readonly EncodingFixture[];

export const encodingFixturePositions = encodingFixtures.flatMap((item) => {
  return [
    {
      bytes: item.bytes,
      expectedLabel: item.sourceLabel,
      expectedText: item.expectedText,
      id: `${item.id}:source`,
    },
    {
      bytes: item.bytes,
      expectedLabel: item.renderedLabel,
      expectedText: item.presentedText,
      id: `${item.id}:rendered`,
    },
  ];
}) satisfies readonly EncodingFixturePosition[];

export function decodeFatal(
  label: EncodingLabel,
  bytes: readonly number[],
): string | undefined {
  try {
    return new TextDecoder(label, { fatal: true }).decode(
      Uint8Array.from(bytes),
    );
  } catch {
    return undefined;
  }
}

export function isVisiblePuzzleText(value: string): boolean {
  return ![...value].some((character) => {
    const codePoint = character.codePointAt(0);
    if (codePoint === undefined) {
      return true;
    }
    return (
      codePoint <= 0x1f ||
      (codePoint >= 0x7f && codePoint <= 0x9f) ||
      (codePoint >= 0x200b && codePoint <= 0x200f) ||
      (codePoint >= 0x202a && codePoint <= 0x202e) ||
      codePoint === 0x2060 ||
      codePoint === 0xfeff ||
      codePoint === 0xfffd ||
      (codePoint >= 0xe000 && codePoint <= 0xf8ff)
    );
  });
}

export function validLabelsForPosition(
  position: EncodingFixturePosition,
): readonly EncodingLabel[] {
  return encodingLabels.filter((label) => {
    const decoded = decodeFatal(label, position.bytes);
    return decoded === position.expectedText && isVisiblePuzzleText(decoded);
  });
}

export function solveEncodingFixtures(): readonly ReadonlyMap<
  string,
  EncodingLabel
>[] {
  return [
    new Map(
      encodingFixturePositions.map((position) => [
        position.id,
        position.expectedLabel,
      ]),
    ),
  ];
}

export function bytesAsBinary(bytes: readonly number[]): string {
  return bytes.map((byte) => byte.toString(2).padStart(8, "0")).join(" ");
}

export function bytesAsHex(bytes: readonly number[]): string {
  return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join(" ");
}
