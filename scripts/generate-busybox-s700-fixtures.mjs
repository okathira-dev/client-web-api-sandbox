import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import jsQR from "jsqr";

const runFile = promisify(execFile);
const ffmpeg = process.env.BUSYBOX_FFMPEG_PATH;
if (!ffmpeg)
  throw new Error("Set BUSYBOX_FFMPEG_PATH to a trusted FFmpeg executable.");

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const assetRoot = resolve(root, "src/busybox/fixtures/s700/assets");
const temporaryRoot = await mkdtemp(resolve(tmpdir(), "busybox-s700-"));
const width = 640;
const height = 360;
const qrSize = 25;
const dataCodewords = 34;
const errorCorrectionCodewords = 10;
const slots = [
  { id: "a", key: "silver orbit", token: "bbx-rp-a-7k3m2q" },
  { id: "b", key: "quiet prism", token: "bbx-rp-b-9x4v6n" },
  { id: "c", key: "amber signal", token: "bbx-rp-c-2h8w5r" },
  { id: "d", key: "violet harbor", token: "bbx-rp-d-6p3y9t" },
];

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

function generatorPolynomial(degree) {
  let polynomial = [1];
  let rootValue = 1;
  for (let index = 0; index < degree; index += 1) {
    const next = new Array(polynomial.length + 1).fill(0);
    for (
      let coefficient = 0;
      coefficient < polynomial.length;
      coefficient += 1
    ) {
      next[coefficient] ^= polynomial[coefficient];
      next[coefficient + 1] ^= multiply(polynomial[coefficient], rootValue);
    }
    polynomial = next;
    rootValue = multiply(rootValue, 2);
  }
  return polynomial;
}

function errorCorrection(data) {
  const generator = generatorPolynomial(errorCorrectionCodewords);
  const remainder = new Array(errorCorrectionCodewords).fill(0);
  for (const byte of data) {
    const factor = byte ^ remainder.shift();
    remainder.push(0);
    for (let index = 0; index < errorCorrectionCodewords; index += 1)
      remainder[index] ^= multiply(generator[index + 1], factor);
  }
  return remainder;
}

function byteModeCodewords(text) {
  const bytes = [...Buffer.from(text, "utf8")];
  if (bytes.length > 31) throw new Error(`QR payload too long: ${text}`);
  const bits = [0, 1, 0, 0];
  for (let bit = 7; bit >= 0; bit -= 1) bits.push((bytes.length >>> bit) & 1);
  for (const byte of bytes)
    for (let bit = 7; bit >= 0; bit -= 1) bits.push((byte >>> bit) & 1);
  const capacity = dataCodewords * 8;
  for (let index = 0; index < Math.min(4, capacity - bits.length); index += 1)
    bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);
  const result = [];
  for (let index = 0; index < bits.length; index += 8)
    result.push(
      bits
        .slice(index, index + 8)
        .reduce((value, bit) => (value << 1) | bit, 0),
    );
  let padIndex = 0;
  while (result.length < dataCodewords) {
    result.push([0xec, 0x11][padIndex % 2]);
    padIndex += 1;
  }
  return result;
}

function blankMatrix() {
  return Array.from({ length: qrSize }, () => Array(qrSize).fill(undefined));
}

function placeFinder(matrix, left, top) {
  for (let y = -1; y <= 7; y += 1) {
    for (let x = -1; x <= 7; x += 1) {
      const row = top + y;
      const column = left + x;
      if (row < 0 || row >= qrSize || column < 0 || column >= qrSize) continue;
      matrix[row][column] =
        x >= 0 &&
        x <= 6 &&
        y >= 0 &&
        y <= 6 &&
        (x === 0 ||
          x === 6 ||
          y === 0 ||
          y === 6 ||
          (x >= 2 && x <= 4 && y >= 2 && y <= 4));
    }
  }
}

function placeBasePatterns(matrix) {
  placeFinder(matrix, 0, 0);
  placeFinder(matrix, qrSize - 7, 0);
  placeFinder(matrix, 0, qrSize - 7);
  for (let index = 8; index < qrSize - 8; index += 1) {
    matrix[6][index] = index % 2 === 0;
    matrix[index][6] = index % 2 === 0;
  }
  for (let y = -2; y <= 2; y += 1)
    for (let x = -2; x <= 2; x += 1)
      matrix[18 + y][18 + x] =
        Math.abs(x) === 2 || Math.abs(y) === 2 || (x === 0 && y === 0);
  for (let index = 0; index < 9; index += 1) {
    if (index !== 6) {
      matrix[index][8] = false;
      matrix[8][index] = false;
    }
  }
  for (let index = 0; index < 8; index += 1)
    matrix[8][qrSize - 1 - index] = false;
  for (let index = 0; index < 7; index += 1)
    matrix[qrSize - 1 - index][8] = false;
  matrix[qrSize - 8][8] = true;
}

function applyFormat(matrix) {
  const data = 0x08;
  let remainder = data << 10;
  while (remainder.toString(2).length >= 11)
    remainder ^= 0x537 << (remainder.toString(2).length - 11);
  const bits = ((data << 10) | remainder) ^ 0x5412;
  for (let index = 0; index < 15; index += 1) {
    const dark = ((bits >>> index) & 1) === 1;
    if (index < 6) matrix[index][8] = dark;
    else if (index < 8) matrix[index + 1][8] = dark;
    else matrix[qrSize - 15 + index][8] = dark;
    if (index < 8) matrix[8][qrSize - index - 1] = dark;
    else if (index < 9) matrix[8][15 - index] = dark;
    else matrix[8][15 - index - 1] = dark;
  }
  matrix[qrSize - 8][8] = true;
}

function makeQrMatrix(text) {
  const matrix = blankMatrix();
  placeBasePatterns(matrix);
  const data = byteModeCodewords(text);
  const bits = [...data, ...errorCorrection(data)].flatMap((byte) =>
    Array.from({ length: 8 }, (_unused, offset) => (byte >>> (7 - offset)) & 1),
  );
  let bitIndex = 0;
  let upward = true;
  for (let column = qrSize - 1; column > 0; column -= 2) {
    if (column === 6) column -= 1;
    for (let offset = 0; offset < qrSize; offset += 1) {
      const row = upward ? qrSize - 1 - offset : offset;
      for (const targetColumn of [column, column - 1]) {
        if (matrix[row][targetColumn] !== undefined) continue;
        const raw = (bits[bitIndex] ?? 0) === 1;
        matrix[row][targetColumn] = (row + targetColumn) % 2 === 0 ? !raw : raw;
        bitIndex += 1;
      }
    }
    upward = !upward;
  }
  applyFormat(matrix);
  return matrix;
}

const alphabet = {
  a: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  b: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  d: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  e: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  g: ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
  h: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  i: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  l: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  m: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  n: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  o: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  p: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  r: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  s: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  t: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  u: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  v: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
};

function blankFrame(value) {
  return new Uint8Array(width * height * 3).fill(value);
}

function setPixel(frame, x, y, value) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  const offset = (y * width + x) * 3;
  frame[offset] = value;
  frame[offset + 1] = value;
  frame[offset + 2] = value;
}

function textFrame(text) {
  const frame = blankFrame(8);
  const scale = 10;
  const characterWidth = 6 * scale;
  const left = Math.floor((width - (text.length * characterWidth - scale)) / 2);
  const top = Math.floor((height - 7 * scale) / 2);
  for (const [characterIndex, character] of [...text].entries()) {
    const pattern = character === " " ? undefined : alphabet[character];
    if (!pattern) continue;
    for (const [row, line] of pattern.entries()) {
      for (const [column, bit] of [...line].entries()) {
        if (bit !== "1") continue;
        for (let y = 0; y < scale; y += 1)
          for (let x = 0; x < scale; x += 1)
            setPixel(
              frame,
              left + characterIndex * characterWidth + column * scale + x,
              top + row * scale + y,
              248,
            );
      }
    }
  }
  return frame;
}

function qrFrame(token) {
  const frame = blankFrame(255);
  const matrix = makeQrMatrix(token);
  const moduleSize = 10;
  const quiet = 4;
  const size = (qrSize + quiet * 2) * moduleSize;
  const left = Math.floor((width - size) / 2);
  const top = Math.floor((height - size) / 2);
  for (let row = 0; row < qrSize; row += 1) {
    for (let column = 0; column < qrSize; column += 1) {
      if (!matrix[row][column]) continue;
      for (let y = 0; y < moduleSize; y += 1)
        for (let x = 0; x < moduleSize; x += 1)
          setPixel(
            frame,
            left + (column + quiet) * moduleSize + x,
            top + (row + quiet) * moduleSize + y,
            0,
          );
    }
  }
  return frame;
}

async function writePpm(path, pixels) {
  await writeFile(
    path,
    Buffer.concat([Buffer.from(`P6\n${width} ${height}\n255\n`), pixels]),
  );
}

try {
  await mkdir(assetRoot, { recursive: true });
  const assets = [];
  for (const slot of slots) {
    const keyFrame = resolve(temporaryRoot, `${slot.id}-key.ppm`);
    const qr = resolve(temporaryRoot, `${slot.id}-qr.ppm`);
    const output = resolve(assetRoot, `remote-slot-${slot.id}.webm`);
    await writePpm(keyFrame, textFrame(slot.key));
    await writePpm(qr, qrFrame(slot.token));
    await runFile(
      ffmpeg,
      [
        "-y",
        "-loop",
        "1",
        "-framerate",
        "12",
        "-t",
        "4",
        "-i",
        keyFrame,
        "-loop",
        "1",
        "-framerate",
        "12",
        "-t",
        "4",
        "-i",
        qr,
        "-filter_complex",
        "[0:v][1:v]concat=n=2:v=1:a=0,format=yuv420p[v]",
        "-map",
        "[v]",
        "-c:v",
        "libvpx-vp9",
        "-deadline",
        "good",
        "-b:v",
        "220k",
        "-an",
        output,
      ],
      { windowsHide: true, maxBuffer: 16 * 1024 * 1024 },
    );
    const { stdout: decodedFrame } = await runFile(
      ffmpeg,
      [
        "-v",
        "error",
        "-ss",
        "6",
        "-i",
        output,
        "-frames:v",
        "1",
        "-f",
        "rawvideo",
        "-pix_fmt",
        "rgba",
        "-",
      ],
      {
        windowsHide: true,
        maxBuffer: width * height * 4 + 1024,
        encoding: "buffer",
      },
    );
    const rgba = new Uint8ClampedArray(
      decodedFrame.buffer,
      decodedFrame.byteOffset,
      decodedFrame.byteLength,
    );
    const decoded = jsQR(rgba, width, height, {
      inversionAttempts: "dontInvert",
    });
    if (decoded?.data !== slot.token)
      throw new Error(
        `Generated QR did not survive VP9 encoding for slot ${slot.id}.`,
      );
    const bytes = await readFile(output);
    assets.push({
      ...slot,
      file: `remote-slot-${slot.id}.webm`,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      bytes: bytes.length,
      width,
      height,
      seconds: 8,
      textRange: [0, 4],
      qrRange: [4, 8],
    });
  }
  await writeFile(
    resolve(assetRoot, "generation-manifest.json"),
    `${JSON.stringify({ generator: "scripts/generate-busybox-s700-fixtures.mjs", assets }, null, 2)}\n`,
  );
  console.log(`Generated ${assets.length} S-700 Remote Playback fixtures.`);
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
