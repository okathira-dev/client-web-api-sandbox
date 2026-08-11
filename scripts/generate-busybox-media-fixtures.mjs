import { execFile } from "node:child_process";
import { copyFile, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
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
const assetRoot = resolve(root, "src/busybox/fixtures/media/assets");
const temporaryRoot = await mkdtemp(join(tmpdir(), "busybox-poc-006-"));

async function run(executable, args) {
  const { stdout, stderr } = await runFile(executable, args, {
    windowsHide: true,
    maxBuffer: 16 * 1024 * 1024,
  });
  return { stdout, stderr };
}

async function generate(outputName, args) {
  const output = join(temporaryRoot, outputName);
  await run(ffmpeg, [
    "-hide_banner",
    "-loglevel",
    "error",
    ...args,
    "-y",
    output,
  ]);
  return output;
}

function isAbsoluteFilesystemPath(value) {
  return (
    /^[a-zA-Z]:[\\/]/u.test(value) || /^\\\\/u.test(value) || /^\//u.test(value)
  );
}

function sanitizeProbe(probe) {
  if (probe.format && typeof probe.format === "object") {
    delete probe.format.filename;
  }
  return probe;
}

function assertPortableManifestValue(value, location = "manifest") {
  if (typeof value === "string" && isAbsoluteFilesystemPath(value)) {
    throw new Error(`${location} contains a machine-local absolute path.`);
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      assertPortableManifestValue(item, `${location}[${index}]`);
    });
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      assertPortableManifestValue(item, `${location}.${key}`);
    }
  }
}

try {
  await mkdir(assetRoot, { recursive: true });

  const outputs = [];
  outputs.push(
    await generate("vfr-cadence.webm", [
      "-f",
      "lavfi",
      "-i",
      "testsrc2=size=640x360:rate=120:duration=9",
      "-vf",
      "select=if(lt(t\\,2)\\,not(mod(n\\,10))\\,if(lt(t\\,5)\\,not(mod(n\\,5))\\,if(lt(t\\,7)\\,not(mod(n\\,4))\\,not(mod(n\\,2))))),setpts=PTS-STARTPTS",
      "-fps_mode",
      "vfr",
      "-an",
      "-c:v",
      "libvpx-vp9",
      "-pix_fmt",
      "yuv420p",
      "-b:v",
      "600k",
      "-deadline",
      "good",
      "-cpu-used",
      "4",
      "-metadata",
      "title=Busybox POC-006 VFR cadence",
    ]),
  );

  for (const [name, size, bitrate] of [
    ["reel-320x180.webm", "320x180", "250k"],
    ["reel-640x360.webm", "640x360", "500k"],
    ["reel-960x540.webm", "960x540", "900k"],
  ]) {
    outputs.push(
      await generate(name, [
        "-f",
        "lavfi",
        "-i",
        `testsrc2=size=${size}:rate=24:duration=4`,
        "-an",
        "-c:v",
        "libvpx-vp9",
        "-pix_fmt",
        "yuv420p",
        "-b:v",
        bitrate,
        "-g",
        "48",
        "-deadline",
        "good",
        "-cpu-used",
        "4",
        "-metadata",
        `title=Busybox POC-006 ${size} reel`,
      ]),
    );
  }

  outputs.push(
    await generate("multi-audio.mp4", [
      "-f",
      "lavfi",
      "-i",
      "testsrc2=size=640x360:rate=24:duration=5",
      "-f",
      "lavfi",
      "-i",
      "sine=frequency=330:sample_rate=48000:duration=5",
      "-f",
      "lavfi",
      "-i",
      "sine=frequency=440:sample_rate=48000:duration=5",
      "-f",
      "lavfi",
      "-i",
      "sine=frequency=550:sample_rate=48000:duration=5",
      "-map",
      "0:v:0",
      "-map",
      "1:a:0",
      "-map",
      "2:a:0",
      "-map",
      "3:a:0",
      "-c:v",
      "libx264",
      "-profile:v",
      "baseline",
      "-level:v",
      "3.0",
      "-pix_fmt",
      "yuv420p",
      "-b:v",
      "600k",
      "-c:a",
      "aac",
      "-b:a",
      "64k",
      "-metadata:s:a:0",
      "title=Busy",
      "-metadata:s:a:0",
      "language=qaa",
      "-metadata:s:a:1",
      "title=Busybox",
      "-metadata:s:a:1",
      "language=qab",
      "-metadata:s:a:2",
      "title=Box",
      "-metadata:s:a:2",
      "language=qac",
      "-disposition:a:0",
      "default",
      "-disposition:a:1",
      "0",
      "-disposition:a:2",
      "0",
      "-movflags",
      "+faststart",
      "-shortest",
    ]),
  );

  const { stdout: versionOutput } = await run(ffmpeg, ["-version"]);
  const manifest = {
    schemaVersion: 1,
    generatedBy: versionOutput.split(/\r?\n/u)[0],
    assets: [],
  };
  for (const output of outputs) {
    const { stdout } = await run(ffprobe, [
      "-v",
      "error",
      "-show_streams",
      "-show_format",
      "-of",
      "json",
      output,
    ]);
    const probe = sanitizeProbe(JSON.parse(stdout));
    assertPortableManifestValue(probe, "probe");
    manifest.assets.push({
      file: output.slice(temporaryRoot.length + 1).replaceAll("\\", "/"),
      probe,
    });
    await copyFile(
      output,
      join(assetRoot, output.slice(temporaryRoot.length + 1)),
    );
  }
  assertPortableManifestValue(manifest);
  await writeFile(
    join(assetRoot, "generation-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
