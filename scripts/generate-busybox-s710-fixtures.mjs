import { execFile } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const runFile = promisify(execFile);
const ffmpeg = process.env.BUSYBOX_FFMPEG_PATH;
if (!ffmpeg)
  throw new Error(
    "Set BUSYBOX_FFMPEG_PATH to a trusted local FFmpeg executable.",
  );

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const assetRoot = resolve(root, "src/busybox/fixtures/s710/assets");
const temporaryRoot = await mkdtemp(join(tmpdir(), "busybox-s710-fixtures-"));

function multiply(left, right) {
  if (left === 0 || right === 0) return 0;
  let value = 0;
  let a = left;
  let b = right;
  while (b > 0) {
    if (b & 1) value ^= a;
    a <<= 1;
    if (a & 0x100) a ^= 0x11d;
    b >>= 1;
  }
  return value;
}

function generator(degree) {
  let polynomial = [1];
  let rootValue = 1;
  for (let index = 0; index < degree; index += 1) {
    const next = new Array(polynomial.length + 1).fill(0);
    polynomial.forEach((coefficient, coefficientIndex) => {
      next[coefficientIndex] ^= coefficient;
      next[coefficientIndex + 1] ^= multiply(coefficient, rootValue);
    });
    polynomial = next;
    rootValue = multiply(rootValue, 2);
  }
  return polynomial;
}

function errorCorrection(data) {
  const polynomial = generator(10);
  const remainder = new Array(10).fill(0);
  for (const byte of data) {
    const factor = byte ^ remainder.shift();
    remainder.push(0);
    for (let index = 0; index < 10; index += 1)
      remainder[index] ^= multiply(polynomial[index + 1], factor);
  }
  return remainder;
}

function qrMatrix(text) {
  const size = 25;
  const matrix = Array.from({ length: size }, () =>
    Array(size).fill(undefined),
  );
  const set = (row, column, value) => {
    if (row >= 0 && row < size && column >= 0 && column < size)
      matrix[row][column] = value;
  };
  const finder = (left, top) => {
    for (let y = -1; y <= 7; y += 1)
      for (let x = -1; x <= 7; x += 1) {
        const dark =
          x >= 0 &&
          x <= 6 &&
          y >= 0 &&
          y <= 6 &&
          (x === 0 ||
            x === 6 ||
            y === 0 ||
            y === 6 ||
            (x >= 2 && x <= 4 && y >= 2 && y <= 4));
        set(top + y, left + x, dark);
      }
  };
  finder(0, 0);
  finder(size - 7, 0);
  finder(0, size - 7);
  for (let index = 8; index < size - 8; index += 1) {
    set(6, index, index % 2 === 0);
    set(index, 6, index % 2 === 0);
  }
  for (let y = -2; y <= 2; y += 1)
    for (let x = -2; x <= 2; x += 1)
      set(
        18 + y,
        18 + x,
        Math.abs(x) === 2 || Math.abs(y) === 2 || (x === 0 && y === 0),
      );
  for (let index = 0; index < 9; index += 1)
    if (index !== 6) {
      set(index, 8, false);
      set(8, index, false);
    }
  for (let index = 0; index < 8; index += 1) set(8, size - 1 - index, false);
  for (let index = 0; index < 7; index += 1) set(size - 1 - index, 8, false);
  set(size - 8, 8, true);
  const bytes = [...Buffer.from(text, "utf8")];
  const bits = [0, 1, 0, 0];
  for (let bit = 7; bit >= 0; bit -= 1) bits.push((bytes.length >>> bit) & 1);
  for (const byte of bytes)
    for (let bit = 7; bit >= 0; bit -= 1) bits.push((byte >>> bit) & 1);
  for (let index = 0; index < Math.min(4, 34 * 8 - bits.length); index += 1)
    bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);
  const data = [];
  for (let index = 0; index < bits.length; index += 8)
    data.push(
      bits
        .slice(index, index + 8)
        .reduce((value, bit) => (value << 1) | bit, 0),
    );
  while (data.length < 34) data.push([0xec, 0x11][data.length % 2]);
  const payload = [...data, ...errorCorrection(data)];
  const payloadBits = payload.flatMap((byte) =>
    Array.from({ length: 8 }, (_, index) => (byte >>> (7 - index)) & 1),
  );
  let bitIndex = 0;
  let upward = true;
  for (let column = size - 1; column > 0; column -= 2) {
    if (column === 6) column -= 1;
    for (let offset = 0; offset < size; offset += 1) {
      const row = upward ? size - 1 - offset : offset;
      for (const targetColumn of [column, column - 1]) {
        if (matrix[row][targetColumn] !== undefined) continue;
        const raw = (payloadBits[bitIndex] ?? 0) === 1;
        matrix[row][targetColumn] = (row + targetColumn) % 2 === 0 ? !raw : raw;
        bitIndex += 1;
      }
    }
    upward = !upward;
  }
  let remainder = 0x08 << 10;
  while (remainder.toString(2).length >= 11)
    remainder ^= 0x537 << (remainder.toString(2).length - 11);
  const formatBits = ((0x08 << 10) | remainder) ^ 0x5412;
  for (let index = 0; index < 15; index += 1) {
    const dark = ((formatBits >>> index) & 1) === 1;
    if (index < 6) set(index, 8, dark);
    else if (index < 8) set(index + 1, 8, dark);
    else set(size - 15 + index, 8, dark);
    if (index < 8) set(8, size - index - 1, dark);
    else if (index < 9) set(8, 15 - index, dark);
    else set(8, 14 - index, dark);
  }
  return matrix;
}

async function writeQrPgm(path) {
  const imageWidth = 640;
  const imageHeight = 360;
  const modulePixels = Math.floor(Math.min(imageWidth, imageHeight) / 33);
  const quiet = 4;
  const matrix = qrMatrix("S710_QR_TEST");
  const offsetX = Math.floor(
    (imageWidth - (25 + quiet * 2) * modulePixels) / 2,
  );
  const offsetY = Math.floor(
    (imageHeight - (25 + quiet * 2) * modulePixels) / 2,
  );
  const pixels = Buffer.alloc(imageWidth * imageHeight, 255);
  for (let row = 0; row < 25; row += 1)
    for (let column = 0; column < 25; column += 1)
      if (matrix[row][column])
        for (let y = 0; y < modulePixels; y += 1)
          for (let x = 0; x < modulePixels; x += 1)
            pixels[
              (offsetY + (row + quiet) * modulePixels + y) * imageWidth +
                offsetX +
                (column + quiet) * modulePixels +
                x
            ] = 0;
  await writeFile(
    path,
    Buffer.concat([
      Buffer.from(`P5\n${imageWidth} ${imageHeight}\n255\n`),
      pixels,
    ]),
  );
}

async function run(args) {
  await runFile(ffmpeg, ["-loglevel", "error", ...args], {
    windowsHide: true,
    maxBuffer: 8 * 1024 * 1024,
  });
}

async function makeSegment(path, duration, filter, qrPath) {
  const input =
    filter === "black"
      ? ["-f", "lavfi", "-i", "color=c=black:s=640x360:r=15"]
      : ["-f", "lavfi", "-i", "testsrc=size=640x360:rate=15"];
  const extra =
    filter === "qr"
      ? [
          "-loop",
          "1",
          "-i",
          qrPath,
          "-filter_complex",
          "[0:v][1:v]overlay=(W-w)/2:(H-h)/2",
        ]
      : [];
  await run([
    ...input,
    ...extra,
    "-t",
    String(duration),
    "-an",
    "-c:v",
    "libvpx",
    "-pix_fmt",
    "yuv420p",
    "-b:v",
    "500k",
    "-y",
    path,
  ]);
}

async function concatSegments(paths, destination) {
  const listPath = join(
    temporaryRoot,
    `${destination.split(/[\\/]/).at(-1)}.txt`,
  );
  await writeFile(
    listPath,
    paths.map((path) => `file '${path.replaceAll("'", "'\\''")}'`).join("\n"),
  );
  await run([
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    listPath,
    "-c",
    "copy",
    "-y",
    destination,
  ]);
}

try {
  await mkdir(assetRoot, { recursive: true });
  const qrPath = join(temporaryRoot, "qr.pgm");
  await writeQrPgm(qrPath);
  const b01Segments = [
    join(temporaryRoot, "b01-1.webm"),
    join(temporaryRoot, "b01-black.webm"),
    join(temporaryRoot, "b01-2.webm"),
  ];
  await makeSegment(b01Segments[0], 4, "moving");
  await makeSegment(b01Segments[1], 1, "black");
  await makeSegment(b01Segments[2], 5, "moving");
  await concatSegments(b01Segments, join(assetRoot, "dark-frame-input.webm"));
  const b03Segments = [
    join(temporaryRoot, "b03-1.webm"),
    join(temporaryRoot, "b03-qr.webm"),
    join(temporaryRoot, "b03-2.webm"),
  ];
  await makeSegment(b03Segments[0], 4, "moving");
  await makeSegment(b03Segments[1], 1, "qr", qrPath);
  await makeSegment(b03Segments[2], 5, "moving");
  await concatSegments(b03Segments, join(assetRoot, "qr-frame-input.webm"));
  await writeFile(
    join(assetRoot, "generation-manifest.json"),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        durationSeconds: 10,
        blackWindow: [4, 5],
        qrWindow: [4, 5],
        qrPayload: "S710_QR_TEST",
        assets: ["dark-frame-input.webm", "qr-frame-input.webm"],
      },
      null,
      2,
    )
      .replaceAll("[\n    4,\n    5\n  ]", "[4, 5]")
      .replaceAll(
        '[\n    "dark-frame-input.webm",\n    "qr-frame-input.webm"\n  ]',
        '["dark-frame-input.webm", "qr-frame-input.webm"]',
      )}\n`,
  );
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
