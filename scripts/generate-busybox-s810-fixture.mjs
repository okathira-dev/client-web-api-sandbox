import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
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
const assetRoot = resolve(root, "src/busybox/fixtures/s810/assets");
const temporaryRoot = await mkdtemp(join(tmpdir(), "busybox-s810-fixture-"));

async function run(args) {
  await runFile(ffmpeg, args, {
    windowsHide: true,
    maxBuffer: 8 * 1024 * 1024,
  });
}

function dimensionsForFrame(index) {
  const phase = Math.floor(index / 30);
  const offset = index % 30;
  const progress = offset / 29;
  const interpolate = (from, to) =>
    Math.max(144, Math.round((from + (to - from) * progress) / 8) * 8);
  if (phase === 0) {
    const size = interpolate(144, 1080);
    return [size, size];
  }
  if (phase === 1) {
    const size = interpolate(1080, 144);
    return [size, size];
  }
  if (phase === 2) return [interpolate(1080, 144), interpolate(144, 1080)];
  return [interpolate(144, 1080), interpolate(1080, 144)];
}

async function generateSegment(index) {
  const [width, height] = dimensionsForFrame(index);
  const output = join(
    temporaryRoot,
    `segment-${String(index).padStart(3, "0")}.webm`,
  );
  await run([
    "-loglevel",
    "error",
    "-f",
    "lavfi",
    "-i",
    `testsrc=size=${width}x${height}:rate=15`,
    "-frames:v",
    "1",
    "-an",
    "-c:v",
    "libvpx",
    "-deadline",
    "good",
    "-cpu-used",
    "8",
    "-b:v",
    "300k",
    "-g",
    "1",
    "-y",
    output,
  ]);
  return { index, width, height, bytes: await readFile(output) };
}

try {
  await mkdir(assetRoot, { recursive: true });
  const segments = [];
  for (let index = 0; index < 120; index += 1)
    segments.push(await generateSegment(index));

  let offset = 0;
  const manifestSegments = segments.map(({ bytes, ...segment }) => {
    const entry = { ...segment, offset, length: bytes.length };
    offset += bytes.length;
    return entry;
  });
  const packed = Buffer.concat(segments.map(({ bytes }) => bytes));
  await writeFile(join(assetRoot, "resolution-sweep.pack"), packed);
  await writeFile(
    join(assetRoot, "generation-manifest.json"),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        frameRate: 15,
        frameCount: segments.length,
        asset: "resolution-sweep.pack",
        segments: manifestSegments,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
