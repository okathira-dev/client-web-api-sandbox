import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const assetRoot = resolve(root, "src/busybox/fixtures/s790/assets");
const outputPath = resolve(assetRoot, "busybox-key.ttf");

function u16(value) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16BE(value & 0xffff);
  return buffer;
}

function i16(value) {
  const buffer = Buffer.alloc(2);
  buffer.writeInt16BE(value);
  return buffer;
}

function u32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32BE(value >>> 0);
  return buffer;
}

function fixed(value) {
  return u32(Math.round(value * 65536));
}

function pad4(buffer) {
  const padding = (4 - (buffer.length % 4)) % 4;
  return padding === 0
    ? buffer
    : Buffer.concat([buffer, Buffer.alloc(padding)]);
}

function checksum(buffer) {
  const padded = pad4(buffer);
  let sum = 0;
  for (let offset = 0; offset < padded.length; offset += 4) {
    sum = (sum + padded.readUInt32BE(offset)) >>> 0;
  }
  return sum;
}

function makeNameTable() {
  const names = [
    [1, "Busybox Key"],
    [2, "Regular"],
    [3, "Busybox Key 1.0"],
    [4, "Busybox Key Regular"],
    [5, "Version 1.000"],
    [6, "BusyboxKey-Regular"],
  ];
  const strings = names.map(([, value]) =>
    Buffer.from(value, "utf16le").swap16(),
  );
  const records = [];
  let offset = 0;
  for (const [[nameId], string] of names.map((item, index) => [
    item,
    strings[index],
  ])) {
    records.push(
      Buffer.concat([
        u16(3),
        u16(1),
        u16(0x0409),
        u16(nameId),
        u16(string.length),
        u16(offset),
      ]),
    );
    offset += string.length;
  }
  return Buffer.concat([
    u16(0),
    u16(records.length),
    u16(6 + records.length * 12),
    ...records,
    ...strings,
  ]);
}

function makeCmapTable() {
  const endCodes = [0x0020, 0xe000, 0xffff];
  const startCodes = [...endCodes];
  const deltas = [1 - 0x0020, 2 - 0xe000, 1];
  const format4 = Buffer.concat([
    u16(4),
    u16(40),
    u16(0),
    u16(6),
    u16(4),
    u16(1),
    u16(2),
    ...endCodes.map(u16),
    u16(0),
    ...startCodes.map(u16),
    ...deltas.map(u16),
    u16(0),
    u16(0),
    u16(0),
  ]);
  return Buffer.concat([u16(0), u16(1), u16(3), u16(1), u32(12), format4]);
}

function makeGlyph() {
  const points = [
    [100, 350],
    [430, 350],
    [430, 250],
    [850, 250],
    [850, 400],
    [700, 400],
    [700, 550],
    [850, 550],
    [850, 700],
    [430, 700],
    [430, 600],
    [100, 600],
  ];
  const xDeltas = points.map(([x], index) => x - (points[index - 1]?.[0] ?? 0));
  const yDeltas = points.map(
    ([, y], index) => y - (points[index - 1]?.[1] ?? 0),
  );
  return Buffer.concat([
    i16(1),
    i16(100),
    i16(250),
    i16(850),
    i16(700),
    u16(points.length - 1),
    u16(0),
    Buffer.alloc(points.length, 0x01),
    ...xDeltas.map(i16),
    ...yDeltas.map(i16),
  ]);
}

function makeOs2Table() {
  const panose = Buffer.from([2, 0, 5, 3, 0, 0, 0, 0, 0, 0]);
  return Buffer.concat([
    u16(0),
    i16(833),
    u16(400),
    u16(5),
    u16(0),
    i16(650),
    i16(600),
    i16(0),
    i16(75),
    i16(650),
    i16(600),
    i16(0),
    i16(350),
    i16(50),
    i16(250),
    i16(0),
    panose,
    u32(1),
    u32(0x10000000),
    u32(0),
    u32(0),
    Buffer.from("BBKY", "ascii"),
    u16(0x0040),
    u16(0x0020),
    u16(0xe000),
    i16(850),
    i16(-150),
    i16(0),
    u16(850),
    u16(150),
  ]);
}

function buildFont() {
  const glyph = makeGlyph();
  const head = Buffer.concat([
    fixed(1),
    fixed(1),
    u32(0),
    u32(0x5f0f3cf5),
    u16(0x000b),
    u16(1000),
    Buffer.alloc(16),
    i16(0),
    i16(0),
    i16(850),
    i16(850),
    u16(0),
    u16(8),
    i16(2),
    i16(0),
    i16(0),
  ]);
  const hhea = Buffer.concat([
    fixed(1),
    i16(850),
    i16(-150),
    i16(0),
    u16(1000),
    i16(0),
    i16(0),
    i16(850),
    i16(1),
    i16(0),
    i16(0),
    Buffer.alloc(8),
    i16(0),
    u16(3),
  ]);
  const maxp = Buffer.concat([
    fixed(1),
    u16(3),
    u16(12),
    u16(1),
    u16(0),
    u16(0),
    u16(2),
    u16(0),
    u16(0),
    u16(0),
    u16(0),
    u16(0),
    u16(0),
    u16(0),
    u16(0),
  ]);
  const post = Buffer.concat([
    fixed(3),
    fixed(0),
    i16(-100),
    i16(50),
    u32(0),
    u32(0),
    u32(0),
    u32(0),
    u32(0),
  ]);
  const tables = new Map([
    ["OS/2", makeOs2Table()],
    ["cmap", makeCmapTable()],
    ["glyf", glyph],
    ["head", head],
    ["hhea", hhea],
    [
      "hmtx",
      Buffer.concat([u16(1000), i16(0), u16(500), i16(0), u16(1000), i16(0)]),
    ],
    ["loca", Buffer.concat([u16(0), u16(0), u16(0), u16(glyph.length / 2)])],
    ["maxp", maxp],
    ["name", makeNameTable()],
    ["post", post],
  ]);
  const tags = [...tables.keys()].sort();
  const numTables = tags.length;
  const searchRange = 16 * 2 ** Math.floor(Math.log2(numTables));
  const entrySelector = Math.floor(Math.log2(numTables));
  const directoryLength = 12 + numTables * 16;
  let tableOffset = directoryLength;
  const records = [];
  const chunks = [];
  let headOffset = 0;
  for (const tag of tags) {
    const table = tables.get(tag);
    const padded = pad4(table);
    records.push(
      Buffer.concat([
        Buffer.from(tag, "ascii"),
        u32(checksum(table)),
        u32(tableOffset),
        u32(table.length),
      ]),
    );
    if (tag === "head") headOffset = tableOffset;
    chunks.push(padded);
    tableOffset += padded.length;
  }
  const font = Buffer.concat([
    u32(0x00010000),
    u16(numTables),
    u16(searchRange),
    u16(entrySelector),
    u16(numTables * 16 - searchRange),
    ...records,
    ...chunks,
  ]);
  const adjustment = (0xb1b0afba - checksum(font)) >>> 0;
  font.writeUInt32BE(adjustment, headOffset + 8);
  if (checksum(font) !== 0xb1b0afba)
    throw new Error("OpenType checksum adjustment failed");
  return font;
}

await mkdir(assetRoot, { recursive: true });
const font = buildFont();
await writeFile(outputPath, font);
const sha256 = createHash("sha256").update(font).digest("hex");
await writeFile(
  resolve(assetRoot, "generation-manifest.json"),
  `${JSON.stringify(
    {
      generator: "scripts/generate-busybox-s790-font.mjs",
      asset: "busybox-key.ttf",
      postscriptName: "BusyboxKey-Regular",
      family: "Busybox Key",
      glyph: "U+E000",
      sha256,
      bytes: font.length,
      derivedFromThirdPartyFont: false,
    },
    null,
    2,
  )}\n`,
);
console.log(`Generated Busybox Key font (${font.length} bytes, ${sha256}).`);
