import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const root = dirname(fileURLToPath(import.meta.url));
const output = join(root, "..", "src", "public", "busybox");
const width = 240;
const height = 120;

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1)
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type);
  const body = Buffer.concat([typeBytes, data]);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(body), 0);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  return Buffer.concat([length, body, checksum]);
}

function png(r, g, b) {
  const rows = [];
  for (let y = 0; y < height; y += 1) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0;
    for (let x = 0; x < width; x += 1) {
      const offset = 1 + x * 4;
      const inside = x > 20 && x < width - 20 && y > 20 && y < height - 20;
      row[offset] = inside ? r : 0;
      row[offset + 1] = inside ? g : 0;
      row[offset + 2] = inside ? b : 0;
      row[offset + 3] = inside ? 220 : 0;
    }
    rows.push(row);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;
  return Buffer.concat([
    Buffer.from("89504e470d0a1a0a", "hex"),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(Buffer.concat(rows))),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

await mkdir(output, { recursive: true });
const assets = [
  ["drag-layer-a.png", png(239, 68, 68), "legacy layer fixture"],
  ["drag-layer-b.png", png(34, 197, 94), "legacy layer fixture"],
  ["drag-layer-c.png", png(59, 130, 246), "legacy layer fixture"],
  ["drag-page.png", png(245, 158, 11), "native in-page image drag"],
  ["drag-file.png", png(16, 185, 129), "OS file drag after download"],
  ["drag-window.png", png(99, 102, 241), "separate-window image drag"],
];
await Promise.all(
  assets.map(async ([name, bytes]) => writeFile(join(output, name), bytes)),
);
const manifest = {
  width,
  height,
  assets: assets.map(([name, bytes, purpose]) => ({
    name,
    purpose,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  })),
};
await writeFile(
  join(output, "drag-fixtures-manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
