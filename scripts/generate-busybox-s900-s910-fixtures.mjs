import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const runFile = promisify(execFile);
const ffmpeg = process.env.BUSYBOX_FFMPEG_PATH;
const ffprobe = process.env.BUSYBOX_FFPROBE_PATH;
if (!ffmpeg || !ffprobe) {
  throw new Error(
    "Set BUSYBOX_FFMPEG_PATH and BUSYBOX_FFPROBE_PATH to trusted local executables.",
  );
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const s900Root = resolve(root, "src/busybox/fixtures/s900/assets");
const s910Root = resolve(root, "src/busybox/fixtures/s910/assets");
const temporaryRoot = await mkdtemp(
  join(tmpdir(), "busybox-s900-s910-fixture-"),
);
const width = 640;
const height = 360;
const frameRate = 15;

async function run(executable, args) {
  return runFile(executable, args, {
    windowsHide: true,
    maxBuffer: 8 * 1024 * 1024,
  });
}

function createFrame(background) {
  const pixels = new Uint8Array(width * height * 3);
  for (let offset = 0; offset < pixels.length; offset += 3) {
    pixels[offset] = background[0];
    pixels[offset + 1] = background[1];
    pixels[offset + 2] = background[2];
  }
  return pixels;
}

function setPixel(pixels, x, y, color) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const offset = (Math.floor(y) * width + Math.floor(x)) * 3;
  pixels[offset] = color[0];
  pixels[offset + 1] = color[1];
  pixels[offset + 2] = color[2];
}

function fillRect(pixels, x, y, rectWidth, rectHeight, color) {
  const fromX = Math.max(0, Math.floor(x));
  const fromY = Math.max(0, Math.floor(y));
  const toX = Math.min(width, Math.ceil(x + rectWidth));
  const toY = Math.min(height, Math.ceil(y + rectHeight));
  for (let row = fromY; row < toY; row += 1) {
    for (let column = fromX; column < toX; column += 1)
      setPixel(pixels, column, row, color);
  }
}

function fillCircle(pixels, centerX, centerY, radius, color) {
  const radiusSquared = radius * radius;
  for (let y = centerY - radius; y <= centerY + radius; y += 1) {
    for (let x = centerX - radius; x <= centerX + radius; x += 1) {
      const dx = x - centerX;
      const dy = y - centerY;
      if (dx * dx + dy * dy <= radiusSquared) setPixel(pixels, x, y, color);
    }
  }
}

function triangleSign(px, py, ax, ay, bx, by) {
  return (px - bx) * (ay - by) - (ax - bx) * (py - by);
}

function fillTriangle(pixels, points, color) {
  const [[ax, ay], [bx, by], [cx, cy]] = points;
  const minX = Math.floor(Math.min(ax, bx, cx));
  const maxX = Math.ceil(Math.max(ax, bx, cx));
  const minY = Math.floor(Math.min(ay, by, cy));
  const maxY = Math.ceil(Math.max(ay, by, cy));
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const d1 = triangleSign(x, y, ax, ay, bx, by);
      const d2 = triangleSign(x, y, bx, by, cx, cy);
      const d3 = triangleSign(x, y, cx, cy, ax, ay);
      const hasNegative = d1 < 0 || d2 < 0 || d3 < 0;
      const hasPositive = d1 > 0 || d2 > 0 || d3 > 0;
      if (!(hasNegative && hasPositive)) setPixel(pixels, x, y, color);
    }
  }
}

const sevenSegmentDigits = {
  0: ["a", "b", "c", "d", "e", "f"],
  1: ["b", "c"],
  2: ["a", "b", "d", "e", "g"],
  3: ["a", "b", "c", "d", "g"],
  4: ["b", "c", "f", "g"],
};

function drawDigit(pixels, digit, x, y, scale, color) {
  const thickness = 5 * scale;
  const length = 24 * scale;
  const segments = {
    a: [x + thickness, y, length, thickness],
    b: [x + thickness + length, y + thickness, thickness, length],
    c: [x + thickness + length, y + thickness * 2 + length, thickness, length],
    d: [x + thickness, y + thickness * 2 + length * 2, length, thickness],
    e: [x, y + thickness * 2 + length, thickness, length],
    f: [x, y + thickness, thickness, length],
    g: [x + thickness, y + thickness + length, length, thickness],
  };
  for (const segment of sevenSegmentDigits[digit] ?? [])
    fillRect(pixels, ...segments[segment], color);
}

function addFilmTexture(pixels, frameIndex) {
  for (let y = 12; y < height; y += 24) {
    const shade = (y + frameIndex) % 48 === 0 ? [24, 31, 49] : [18, 24, 40];
    fillRect(pixels, 0, y, width, 1, shade);
  }
  for (let x = -20 + ((frameIndex * 6) % 40); x < width; x += 40) {
    fillRect(pixels, x, 14, 18, 10, [55, 65, 86]);
    fillRect(pixels, x, height - 24, 18, 10, [55, 65, 86]);
  }
}

function createS900Frame(segmentId, frameIndex, frameCount) {
  const pixels = createFrame([10, 14, 27]);
  addFilmTexture(pixels, frameIndex);
  const milestones = [40, 100, 220, 340, 460, 600];
  fillRect(pixels, 40, 176, 560, 8, [58, 67, 88]);
  for (const marker of milestones) {
    fillRect(pixels, marker - 2, 145, 4, 70, [91, 103, 130]);
  }
  for (let digit = 1; digit <= 4; digit += 1) {
    drawDigit(pixels, digit, milestones[digit] - 18, 54, 1, [199, 208, 226]);
  }
  const ranges = {
    lead: [milestones[0], milestones[1]],
    A: [milestones[1], milestones[2]],
    B: [milestones[2], milestones[3]],
    C: [milestones[3], milestones[4]],
    D: [milestones[4], milestones[5]],
  };
  const [from, to] = ranges[segmentId];
  const progress = frameCount <= 1 ? 1 : frameIndex / (frameCount - 1);
  const beadX = Math.round(from + (to - from) * progress);
  fillRect(pixels, 40, 176, Math.max(0, beadX - 40), 8, [236, 171, 54]);
  fillCircle(pixels, beadX, 180, 18, [255, 218, 112]);
  fillCircle(pixels, beadX - 5, 174, 5, [255, 249, 219]);
  return pixels;
}

const s910Visuals = [
  { id: "circle", start: 0.4, end: 1.2 },
  { id: "triangle", start: 1.55, end: 2.35 },
  { id: "square", start: 2.7, end: 3.5 },
];

function createS910Frame(frameIndex) {
  const pixels = createFrame([8, 12, 22]);
  addFilmTexture(pixels, frameIndex);
  const time = frameIndex / frameRate;
  const active = s910Visuals.find(
    (visual) => time >= visual.start && time <= visual.end,
  )?.id;
  fillRect(pixels, 70, 298, 500, 4, [55, 65, 86]);
  fillRect(pixels, 70, 298, (500 * frameIndex) / 59, 4, [138, 180, 248]);
  if (active === "circle") fillCircle(pixels, 320, 175, 88, [225, 52, 74]);
  if (active === "triangle")
    fillTriangle(
      pixels,
      [
        [320, 72],
        [218, 260],
        [422, 260],
      ],
      [55, 125, 232],
    );
  if (active === "square") fillRect(pixels, 238, 93, 164, 164, [250, 204, 21]);
  return pixels;
}

async function writePpm(path, pixels) {
  const header = Buffer.from(`P6\n${width} ${height}\n255\n`, "ascii");
  await writeFile(path, Buffer.concat([header, pixels]));
}

async function normalizeWebmTrackUid(path) {
  const bytes = await readFile(path);
  const normalized = Buffer.from(bytes);
  const deterministicUid = Buffer.from([0, 0, 0, 0, 0, 0, 0, 1]);
  const elementIds = [
    [0x73, 0xc5],
    [0x63, 0xc5],
  ];
  const matches = new Map(elementIds.map((id) => [id.join("-"), 0]));
  for (let offset = 0; offset <= normalized.length - 11; offset += 1) {
    for (const id of elementIds) {
      if (
        normalized[offset] === id[0] &&
        normalized[offset + 1] === id[1] &&
        normalized[offset + 2] === 0x88
      ) {
        deterministicUid.copy(normalized, offset + 3);
        const key = id.join("-");
        matches.set(key, (matches.get(key) ?? 0) + 1);
      }
    }
  }
  if (elementIds.some((id) => matches.get(id.join("-")) !== 1))
    throw new Error(`Unexpected WebM TrackUID structure: ${path}`);
  await writeFile(path, normalized);
}

async function encodeVideo(name, frameCount, createPixels, destination) {
  const frameRoot = join(temporaryRoot, name);
  await mkdir(frameRoot, { recursive: true });
  for (let index = 0; index < frameCount; index += 1) {
    await writePpm(
      join(frameRoot, `frame-${String(index).padStart(3, "0")}.ppm`),
      createPixels(index, frameCount),
    );
  }
  await run(ffmpeg, [
    "-loglevel",
    "error",
    "-fflags",
    "+bitexact",
    "-framerate",
    String(frameRate),
    "-start_number",
    "0",
    "-i",
    join(frameRoot, "frame-%03d.ppm"),
    "-an",
    "-c:v",
    "libvpx",
    "-flags:v",
    "+bitexact",
    "-deadline",
    "good",
    "-cpu-used",
    "4",
    "-threads",
    "1",
    "-b:v",
    "500k",
    "-g",
    String(frameRate),
    "-pix_fmt",
    "yuv420p",
    "-map_metadata",
    "-1",
    "-y",
    destination,
  ]);
  // FFmpeg's WebM muxer randomizes TrackUID even in bitexact mode. Replace
  // the standard TrackUID and its tag target with the same deterministic
  // unsigned value so identical source frames produce byte-identical assets.
  await normalizeWebmTrackUid(destination);
}

async function inspectVideo(path) {
  const { stdout } = await run(ffprobe, [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=codec_name,width,height,avg_frame_rate:format=duration",
    "-of",
    "json",
    path,
  ]);
  const result = JSON.parse(stdout);
  const stream = result.streams?.[0];
  if (!stream || result.format?.duration === undefined)
    throw new Error(`Could not inspect generated video: ${path}`);
  return {
    codec: stream.codec_name,
    width: stream.width,
    height: stream.height,
    averageFrameRate: stream.avg_frame_rate,
    durationSeconds: Number(result.format.duration),
  };
}

try {
  await Promise.all([
    mkdir(s900Root, { recursive: true }),
    mkdir(s910Root, { recursive: true }),
  ]);

  const s900Segments = {
    lead: { file: "lead.webm", frames: 8 },
    A: { file: "a.webm", frames: 15 },
    B: { file: "b.webm", frames: 15 },
    C: { file: "c.webm", frames: 15 },
    D: { file: "d.webm", frames: 15 },
  };
  for (const [id, segment] of Object.entries(s900Segments)) {
    await encodeVideo(
      `s900-${id}`,
      segment.frames,
      (index, count) => createS900Frame(id, index, count),
      resolve(s900Root, segment.file),
    );
  }
  const s900Probe = await inspectVideo(resolve(s900Root, "a.webm"));
  await writeFile(
    resolve(s900Root, "generation-manifest.json"),
    `${JSON.stringify(
      {
        schemaVersion: 2,
        generator: "ffmpeg",
        mimeType: 'video/webm; codecs="vp8"',
        frameRate,
        width,
        height,
        leadIn: s900Segments.lead,
        reels: {
          A: s900Segments.A,
          B: s900Segments.B,
          C: s900Segments.C,
          D: s900Segments.D,
        },
        probe: s900Probe,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  const s910Asset = resolve(s910Root, "caption-stage.webm");
  await encodeVideo("s910-caption-stage", 60, createS910Frame, s910Asset);
  const s910Probe = await inspectVideo(s910Asset);
  await writeFile(
    resolve(s910Root, "generation-manifest.json"),
    `${JSON.stringify(
      {
        schemaVersion: 2,
        generator: "ffmpeg",
        asset: "caption-stage.webm",
        frameRate,
        durationSeconds: 4,
        width,
        height,
        visuals: s910Visuals,
        probe: s910Probe,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
