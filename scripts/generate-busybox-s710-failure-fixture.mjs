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
const temporaryRoot = await mkdtemp(join(tmpdir(), "busybox-s710-"));

const glyphs = {
  b: ["10000", "10000", "10110", "11001", "10001", "10001", "11110"],
  e: ["00000", "00000", "01110", "10001", "11111", "10000", "01110"],
  i: ["00100", "00000", "01100", "00100", "00100", "00100", "01110"],
  k: ["10000", "10000", "10010", "10100", "11000", "10100", "10010"],
  n: ["00000", "00000", "10110", "11001", "10001", "10001", "10001"],
  o: ["00000", "00000", "01110", "10001", "10001", "10001", "01110"],
  p: ["00000", "00000", "11110", "10001", "11110", "10000", "10000"],
  r: ["00000", "00000", "10110", "11001", "10000", "10000", "10000"],
  s: ["00000", "00000", "01111", "10000", "01110", "00001", "11110"],
  t: ["00100", "00100", "11110", "00100", "00100", "00101", "00010"],
  u: ["00000", "00000", "10001", "10001", "10001", "10011", "01101"],
  x: ["00000", "00000", "10001", "01010", "00100", "01010", "10001"],
  y: ["00000", "00000", "10001", "10001", "01111", "00001", "01110"],
  "{": ["00110", "00100", "00100", "11000", "00100", "00100", "00110"],
  "}": ["01100", "00100", "00100", "00011", "00100", "00100", "01100"],
  _: ["00000", "00000", "00000", "00000", "00000", "00000", "11111"],
};

function brokenFrame() {
  const width = 640;
  const height = 360;
  const pixels = new Uint8Array(width * height);
  const text = "busybox{broken_input}";
  const scale = Math.max(
    1,
    Math.floor(
      Math.min((width - 20) / (text.length * 6 - 1), (height - 20) / 7),
    ),
  );
  const letterWidth = 6 * scale;
  const left = Math.floor((width - (text.length * letterWidth - scale)) / 2);
  const top = Math.floor((height - 7 * scale) / 2);
  for (
    let characterIndex = 0;
    characterIndex < text.length;
    characterIndex += 1
  ) {
    const glyph = glyphs[text[characterIndex]];
    if (!glyph) continue;
    for (let row = 0; row < glyph.length; row += 1)
      for (let column = 0; column < 5; column += 1)
        if (glyph[row]?.[column] === "1")
          for (let y = 0; y < scale; y += 1)
            for (let x = 0; x < scale; x += 1)
              pixels[
                (top + row * scale + y) * width +
                  left +
                  characterIndex * letterWidth +
                  column * scale +
                  x
              ] = 255;
  }
  return Buffer.concat([Buffer.from("P5\n640 360\n255\n", "ascii"), pixels]);
}

try {
  await mkdir(assetRoot, { recursive: true });
  const outputPath = join(assetRoot, "decode-failure-output.webm");
  const framePath = join(temporaryRoot, "broken-input.pgm");
  await writeFile(framePath, brokenFrame());
  await runFile(
    ffmpeg,
    [
      "-loglevel",
      "error",
      "-loop",
      "1",
      "-framerate",
      "1",
      "-i",
      framePath,
      "-t",
      "1",
      "-an",
      "-c:v",
      "libvpx",
      "-pix_fmt",
      "yuv420p",
      "-f",
      "webm",
      "-b:v",
      "160k",
      "-metadata",
      "title=ClipPress decode recovery",
      "-y",
      outputPath,
    ],
    { windowsHide: true },
  );
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
