import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateRawSync, deflateSync, gzipSync } from "node:zlib";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const assetRoot = resolve(root, "src/busybox/fixtures/s880/assets");

const parcels = [
  {
    asset: "parcel-a.gz",
    format: "gzip",
    marker: "pocket compass",
    compress: gzipSync,
  },
  {
    asset: "parcel-b.deflate",
    format: "deflate",
    marker: "violet ledger",
    compress: deflateSync,
  },
  {
    asset: "parcel-c.raw",
    format: "deflate-raw",
    marker: "ember receipt",
    compress: deflateRawSync,
  },
];

function payload(marker) {
  const header = `busybox parcel manifest\nmarker=${marker}\n`;
  const body = "abcdefghijklmnopqrstuvwxyz0123456789\n";
  return Buffer.from((header + body.repeat(2048)).slice(0, 65_536), "utf8");
}

await mkdir(assetRoot, { recursive: true });
const manifest = [];
for (const parcel of parcels) {
  const bytes = payload(parcel.marker);
  const compressed = parcel.compress(bytes, { level: 9, mtime: 0 });
  await writeFile(resolve(assetRoot, parcel.asset), compressed);
  manifest.push({
    asset: parcel.asset,
    format: parcel.format,
    marker: parcel.marker,
    uncompressedBytes: bytes.byteLength,
    compressedBytes: compressed.byteLength,
  });
}
await writeFile(
  resolve(assetRoot, "generation-manifest.json"),
  `${JSON.stringify({ schemaVersion: 1, parcels: manifest }, null, 2)}\n`,
  "utf8",
);
