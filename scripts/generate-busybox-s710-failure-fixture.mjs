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
  B: ["11110", "10001", "11110", "10001", "10001", "10001", "11110"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  N: ["10001", "11001", "11001", "10101", "10011", "10011", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
};

function brokenFrame() {
  const width = 640;
  const height = 360;
  const pixels = new Uint8Array(width * height);
  const text = "BROKEN INPUT";
  const scale = 10;
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
      "-b:v",
      "384k",
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
