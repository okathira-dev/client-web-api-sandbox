import { execFile } from "node:child_process";
import { copyFile, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const runFile = promisify(execFile);
const ffmpeg = process.env.BUSYBOX_FFMPEG_PATH;
if (!ffmpeg) {
  throw new Error(
    "Set BUSYBOX_FFMPEG_PATH to a trusted local FFmpeg executable.",
  );
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const assetRoot = resolve(root, "src/busybox/fixtures/video-recovery/assets");
const temporaryRoot = await mkdtemp(join(tmpdir(), "busybox-poc-022-"));
const frameRate = 12;
const frameCount = 24;
const qrVersion = 2;
const qrSize = 25;
const dataCodewords = 34;
const errorCorrectionCodewords = 10;
const qrTexts = {
  t1: "BUSYBOX{swap_halves}",
  t2: "BUSYBOX{merge_frames}",
  alpha: "BUSYBOX{odd_even_alpha}",
  beta: "BUSYBOX{swap_route_beta}",
};

async function run(executable, args) {
  const { stdout, stderr } = await runFile(executable, args, {
    windowsHide: true,
    maxBuffer: 16 * 1024 * 1024,
  });
  return { stdout, stderr };
}

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
  let root = 1;
  for (let index = 0; index < degree; index += 1) {
    const next = new Array(polynomial.length + 1).fill(0);
    for (
      let coefficient = 0;
      coefficient < polynomial.length;
      coefficient += 1
    ) {
      next[coefficient] ^= polynomial[coefficient];
      next[coefficient + 1] ^= multiply(polynomial[coefficient], root);
    }
    polynomial = next;
    root = multiply(root, 2);
  }
  return polynomial;
}

function errorCorrection(data) {
  const generator = generatorPolynomial(errorCorrectionCodewords);
  const remainder = new Array(errorCorrectionCodewords).fill(0);
  for (const byte of data) {
    const factor = byte ^ remainder.shift();
    remainder.push(0);
    for (let index = 0; index < errorCorrectionCodewords; index += 1) {
      remainder[index] ^= multiply(generator[index + 1], factor);
    }
  }
  return remainder;
}

function byteModeCodewords(text) {
  const bytes = [...Buffer.from(text, "utf8")];
  if (bytes.length > 31) {
    throw new Error(`Version ${qrVersion}-L byte capacity exceeded: ${text}`);
  }
  const bits = [0, 1, 0, 0];
  for (let bit = 7; bit >= 0; bit -= 1) bits.push((bytes.length >>> bit) & 1);
  for (const byte of bytes) {
    for (let bit = 7; bit >= 0; bit -= 1) bits.push((byte >>> bit) & 1);
  }
  const capacity = dataCodewords * 8;
  for (let index = 0; index < Math.min(4, capacity - bits.length); index += 1) {
    bits.push(0);
  }
  while (bits.length % 8 !== 0) bits.push(0);
  const result = [];
  for (let index = 0; index < bits.length; index += 8) {
    result.push(
      bits
        .slice(index, index + 8)
        .reduce((value, bit) => (value << 1) | bit, 0),
    );
  }
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
      matrix[row][column] = dark;
    }
  }
}

function placeAlignment(matrix, centerX, centerY) {
  for (let y = -2; y <= 2; y += 1) {
    for (let x = -2; x <= 2; x += 1) {
      matrix[centerY + y][centerX + x] =
        Math.abs(x) === 2 || Math.abs(y) === 2 || (x === 0 && y === 0);
    }
  }
}

function reserveFormat(matrix) {
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

function placeBasePatterns(matrix) {
  placeFinder(matrix, 0, 0);
  placeFinder(matrix, qrSize - 7, 0);
  placeFinder(matrix, 0, qrSize - 7);
  for (let index = 8; index < qrSize - 8; index += 1) {
    matrix[6][index] = index % 2 === 0;
    matrix[index][6] = index % 2 === 0;
  }
  placeAlignment(matrix, 18, 18);
  reserveFormat(matrix);
}

function applyFormat(matrix, mask) {
  const data = 0x08 | mask;
  let remainder = data << 10;
  while (remainder.toString(2).length >= 11) {
    remainder ^= 0x537 << (remainder.toString(2).length - 11);
  }
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
  const bytes = [
    ...byteModeCodewords(text),
    ...errorCorrection(byteModeCodewords(text)),
  ];
  const bits = bytes.flatMap((byte) =>
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
        const bit = bits[bitIndex] ?? 0;
        const raw = bit === 1;
        matrix[row][targetColumn] = (row + targetColumn) % 2 === 0 ? !raw : raw;
        bitIndex += 1;
      }
    }
    upward = !upward;
  }
  applyFormat(matrix, 0);
  return matrix;
}

function rasterize(matrix) {
  const modulePixels = 12;
  const quietZone = 4;
  const imageSize = 360;
  const offset = (imageSize - (qrSize + quietZone * 2) * modulePixels) / 2;
  const pixels = new Uint8Array(imageSize * imageSize).fill(255);
  for (let row = 0; row < qrSize; row += 1) {
    for (let column = 0; column < qrSize; column += 1) {
      if (!matrix[row][column]) continue;
      const left = offset + (column + quietZone) * modulePixels;
      const top = offset + (row + quietZone) * modulePixels;
      for (let y = 0; y < modulePixels; y += 1) {
        for (let x = 0; x < modulePixels; x += 1) {
          pixels[(top + y) * imageSize + left + x] = 0;
        }
      }
    }
  }
  return pixels;
}

function swapHalves(pixels) {
  const result = new Uint8Array(pixels.length);
  const width = 360;
  for (let row = 0; row < width; row += 1) {
    for (let column = 0; column < width; column += 1) {
      const sourceColumn =
        column < width / 2 ? column + width / 2 : column - width / 2;
      result[row * width + column] = pixels[row * width + sourceColumn];
    }
  }
  return result;
}

function chooseHalves(left, right) {
  const result = new Uint8Array(left.length);
  const width = 360;
  for (let row = 0; row < width; row += 1) {
    for (let column = 0; column < width; column += 1) {
      result[row * width + column] =
        column < width / 2
          ? left[row * width + column]
          : right[row * width + column];
    }
  }
  return result;
}

function onlyHalf(pixels, side) {
  const result = new Uint8Array(pixels.length).fill(255);
  const width = 360;
  const start = side === "left" ? 0 : width / 2;
  const end = side === "left" ? width / 2 : width;
  for (let row = 0; row < width; row += 1) {
    result.set(
      pixels.slice(row * width + start, row * width + end),
      row * width + start,
    );
  }
  return result;
}

function partialFrames(matrix) {
  const results = Array.from({ length: 8 }, () => blankMatrix());
  for (let row = 0; row < qrSize; row += 1) {
    for (let column = 0; column < qrSize; column += 1) {
      if (!matrix[row][column]) continue;
      const index = (row * qrSize + column) % results.length;
      results[index][row][column] = true;
    }
  }
  return results.map((frame) =>
    rasterize(frame.map((row) => row.map((cell) => cell === true))),
  );
}

async function writePgm(path, pixels) {
  const header = Buffer.from("P5\n360 360\n255\n", "ascii");
  await writeFile(path, Buffer.concat([header, Buffer.from(pixels)]));
}

async function makeVideo(name, frames) {
  const directory = join(temporaryRoot, name);
  await mkdir(directory, { recursive: true });
  for (let index = 0; index < frames.length; index += 1) {
    await writePgm(
      join(directory, `${String(index).padStart(3, "0")}.pgm`),
      frames[index],
    );
  }
  const output = join(temporaryRoot, `${name}.webm`);
  await run(ffmpeg, [
    "-loglevel",
    "error",
    "-r",
    String(frameRate),
    "-i",
    join(directory, "%03d.pgm"),
    "-an",
    "-c:v",
    "libvpx",
    "-pix_fmt",
    "yuv420p",
    "-b:v",
    "600k",
    "-metadata",
    `title=Busybox S-720 ${name}`,
    "-y",
    output,
  ]);
  return output;
}

try {
  await mkdir(assetRoot, { recursive: true });
  const t1 = rasterize(makeQrMatrix(qrTexts.t1));
  const t2 = rasterize(makeQrMatrix(qrTexts.t2));
  const alpha = rasterize(makeQrMatrix(qrTexts.alpha));
  const beta = rasterize(makeQrMatrix(qrTexts.beta));
  const t1Source = Array.from({ length: frameCount }, () => swapHalves(t1));
  const t2Source = Array.from(
    { length: frameCount },
    (_unused, index) => partialFrames(makeQrMatrix(qrTexts.t2))[index % 8],
  );
  const t3Source = Array.from({ length: frameCount }, (_unused, index) =>
    index % 2 === 0 ? chooseHalves(alpha, beta) : chooseHalves(beta, alpha),
  );
  const t3IntermediateAlpha = Array.from(
    { length: frameCount },
    (_unused, index) =>
      index % 2 === 0 ? onlyHalf(alpha, "left") : onlyHalf(alpha, "right"),
  );
  const t3IntermediateBeta = Array.from(
    { length: frameCount },
    (_unused, index) =>
      index % 2 === 0 ? onlyHalf(beta, "left") : onlyHalf(beta, "right"),
  );

  const generated = await Promise.all([
    makeVideo("source-t1", t1Source),
    makeVideo("source-t2", t2Source),
    makeVideo("source-t3", t3Source),
    makeVideo("t3-alpha-intermediate", t3IntermediateAlpha),
    makeVideo("t3-beta-intermediate", t3IntermediateBeta),
    makeVideo(
      "recovered-t1",
      Array.from({ length: frameCount }, () => t1),
    ),
    makeVideo(
      "recovered-t2",
      Array.from({ length: frameCount }, () => t2),
    ),
    makeVideo(
      "recovered-alpha",
      Array.from({ length: frameCount }, () => alpha),
    ),
    makeVideo(
      "recovered-beta",
      Array.from({ length: frameCount }, () => beta),
    ),
  ]);
  const manifest = {
    schemaVersion: 1,
    qrVersion,
    frameRate,
    frameCount,
    size: "360x360",
    answers: qrTexts,
    routes: {
      "source-t1": ["T1"],
      "source-t2": ["T2"],
      "source-t3": {
        alpha: ["T3", "T2"],
        beta: ["T1", "T3", "T2", "T1"],
      },
    },
    assets: [],
  };
  for (const generatedPath of generated) {
    const file = generatedPath
      .slice(temporaryRoot.length + 1)
      .replaceAll("\\", "/");
    const destination = join(assetRoot, file);
    await copyFile(generatedPath, destination);
    manifest.assets.push({ file });
  }
  await writeFile(
    join(assetRoot, "generation-manifest.json"),
    `${JSON.stringify(manifest, null, 2)
      .replaceAll('[\n      "T1"\n    ]', '["T1"]')
      .replaceAll('[\n      "T2"\n    ]', '["T2"]')
      .replaceAll('[\n        "T3",\n        "T2"\n      ]', '["T3", "T2"]')
      .replaceAll(
        '[\n        "T1",\n        "T3",\n        "T2",\n        "T1"\n      ]',
        '["T1", "T3", "T2", "T1"]',
      )}\n`,
    "utf8",
  );
} finally {
  try {
    await rm(temporaryRoot, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 200,
    });
  } catch {
    // A bundled FFmpeg may release frame files shortly after process exit.
  }
}
