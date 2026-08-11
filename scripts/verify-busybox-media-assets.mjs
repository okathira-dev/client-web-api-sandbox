import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const assetRoot = resolve(root, "src/busybox/fixtures/media/assets");
const manifest = JSON.parse(
  await readFile(resolve(assetRoot, "generation-manifest.json"), "utf8"),
);

function isAbsoluteFilesystemPath(value) {
  return (
    /^[a-zA-Z]:[\\/]/u.test(value) || /^\\\\/u.test(value) || /^\//u.test(value)
  );
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

assertPortableManifestValue(manifest);
const assets = new Map(
  manifest.assets.map((asset) => [asset.file, asset.probe]),
);

function requireVideo(file, codec, width, height) {
  const probe = assets.get(file);
  const video = probe?.streams.find((stream) => stream.codec_type === "video");
  if (
    video?.codec_name !== codec ||
    video.width !== width ||
    video.height !== height
  ) {
    throw new Error(
      `${file} must contain ${codec} video at ${width}x${height}.`,
    );
  }
  return probe;
}

requireVideo("vfr-cadence.webm", "vp9", 640, 360);
requireVideo("reel-320x180.webm", "vp9", 320, 180);
requireVideo("reel-640x360.webm", "vp9", 640, 360);
requireVideo("reel-960x540.webm", "vp9", 960, 540);

const multiAudio = requireVideo("multi-audio.mp4", "h264", 640, 360);
const audioStreams = multiAudio.streams.filter(
  (stream) => stream.codec_type === "audio",
);
const expectedTracks = [
  { language: "qaa", name: "Busy", isDefault: 1 },
  { language: "qab", name: "Busybox", isDefault: 0 },
  { language: "qac", name: "Box", isDefault: 0 },
];

for (const [index, expected] of expectedTracks.entries()) {
  const stream = audioStreams[index];
  if (
    stream?.codec_name !== "aac" ||
    stream.tags?.language !== expected.language ||
    stream.tags?.name !== expected.name ||
    stream.disposition?.default !== expected.isDefault
  ) {
    throw new Error(
      `multi-audio.mp4 audio track ${index} does not match ${expected.name}/${expected.language}/default=${expected.isDefault}.`,
    );
  }
}

if (audioStreams.length !== expectedTracks.length) {
  throw new Error(
    `multi-audio.mp4 must contain exactly ${expectedTracks.length} audio tracks.`,
  );
}

console.log("Native media ffprobe and portability contract verified.");
