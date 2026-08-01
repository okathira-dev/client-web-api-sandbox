/**
 * 合成パターンをファイルへ書き出す。
 *
 *   node src/encoder-capability-inspector/scripts/generateSyntheticSamples.ts
 *   node src/encoder-capability-inspector/scripts/generateSyntheticSamples.ts --check
 *
 * 検査で実際に使う入力を目と耳で確かめられるようにし、パターンを変えたときの差分を
 * レビューできるようにするためのもの。出力は git 管理する。
 *
 * `--check` は生データのハッシュだけを突き合わせる。PNG/WAV を作り直さないので、
 * zlib の実装差でファイルのバイト列が変わっても誤検出しない。
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { argv } from "node:process";
import { fileURLToPath } from "node:url";

import {
  createCompatibilityAudioSamples,
  createSustainedAudioGenerator,
  getCompatibilityFrameOps,
  getSustainedFrameOps,
  SYNTHETIC_PATTERN_VERSION,
} from "../domain/synthetic.ts";
import { encodeApng, encodePng } from "./png.ts";
import { rasterizeFrame } from "./rasterize.ts";
import { encodeWav } from "./wav.ts";

/**
 * サンプルの解像度。ノイズタイルの枚数は画素数から決まるので、
 * 実際の検査が使う 720p 以上と覆う割合がずれない大きさを選ぶ。
 */
const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 360;
const VIDEO_FPS = 30;
/** APNG に入れるフレーム数と、元のフレーム列から何枚おきに取るか。 */
const VIDEO_FRAME_COUNT = 20;
const VIDEO_FRAME_STRIDE = 3;

const AUDIO_SAMPLE_RATE = 48_000;
/** 1 チャンク = 48kHz で 20ms。検査ワーカーが `AudioEncoder` へ渡す単位に合わせる。 */
const AUDIO_FRAMES_PER_CHUNK = 960;
const SUSTAINED_AUDIO_SECONDS = 2;
/** 一括実用検査は 1 チャンクの使い回しなので、繰り返して継ぎ目が無いことを聴けるようにする。 */
const COMPATIBILITY_AUDIO_CHUNKS = 25;

type SampleFile = {
  readonly path: string;
  readonly contents: Buffer;
  /** 圧縮前の生データ。差分検出はこちらのハッシュで行う。 */
  readonly raw: Uint8Array;
  readonly description: string;
};

const digest = (data: Uint8Array): string =>
  createHash("sha256").update(data).digest("hex");

const toBytes = (samples: Float32Array): Uint8Array =>
  new Uint8Array(samples.buffer, samples.byteOffset, samples.byteLength);

const buildCompatibilityVideo = (): SampleFile => {
  const pixels = rasterizeFrame(
    getCompatibilityFrameOps(VIDEO_WIDTH, VIDEO_HEIGHT),
    VIDEO_WIDTH,
    VIDEO_HEIGHT,
  );
  return {
    path: "video/compatibility.png",
    contents: encodePng(pixels, VIDEO_WIDTH, VIDEO_HEIGHT),
    raw: pixels,
    description:
      "一括実用検査の映像入力。全フレームがこの 1 枚の複製になる（生成は 1 回だけ）。",
  };
};

const buildSustainedVideo = (): SampleFile => {
  const frames = Array.from({ length: VIDEO_FRAME_COUNT }, (_unused, index) =>
    rasterizeFrame(
      getSustainedFrameOps(
        index * VIDEO_FRAME_STRIDE,
        VIDEO_WIDTH,
        VIDEO_HEIGHT,
      ),
      VIDEO_WIDTH,
      VIDEO_HEIGHT,
    ),
  );
  const raw = new Uint8Array(frames.reduce((total, f) => total + f.length, 0));
  let offset = 0;
  for (const frame of frames) {
    raw.set(frame, offset);
    offset += frame.length;
  }

  return {
    path: "video/sustained.png",
    contents: encodeApng({
      frames,
      width: VIDEO_WIDTH,
      height: VIDEO_HEIGHT,
      // 何枚おきに取ったかを遅延へ反映し、実時間と同じ速さで再生されるようにする。
      delayNumerator: VIDEO_FRAME_STRIDE,
      delayDenominator: VIDEO_FPS,
    }),
    raw,
    description: `実用継続検査の映像入力。${VIDEO_FPS}fps のフレーム列から ${VIDEO_FRAME_STRIDE} 枚おきに ${VIDEO_FRAME_COUNT} 枚を抜いた APNG。`,
  };
};

const buildCompatibilityAudio = (channels: number): SampleFile => {
  const chunk = createCompatibilityAudioSamples({
    channels,
    sampleRate: AUDIO_SAMPLE_RATE,
    frames: AUDIO_FRAMES_PER_CHUNK,
  });
  const frames = AUDIO_FRAMES_PER_CHUNK * COMPATIBILITY_AUDIO_CHUNKS;
  const samples = new Float32Array(frames * channels);
  for (let channel = 0; channel < channels; channel += 1) {
    for (let repeat = 0; repeat < COMPATIBILITY_AUDIO_CHUNKS; repeat += 1) {
      samples.set(
        chunk.subarray(
          channel * AUDIO_FRAMES_PER_CHUNK,
          (channel + 1) * AUDIO_FRAMES_PER_CHUNK,
        ),
        channel * frames + repeat * AUDIO_FRAMES_PER_CHUNK,
      );
    }
  }

  return {
    path: `audio/compatibility-${channels === 1 ? "mono" : "stereo"}.wav`,
    contents: encodeWav({
      samples,
      channels,
      sampleRate: AUDIO_SAMPLE_RATE,
      frames,
    }),
    raw: toBytes(samples),
    description: `一括実用検査の音声入力（${channels}ch）。20ms の同じチャンクを ${COMPATIBILITY_AUDIO_CHUNKS} 回繰り返したもの。`,
  };
};

const buildSustainedAudio = (channels: number): SampleFile => {
  const generator = createSustainedAudioGenerator({
    channels,
    sampleRate: AUDIO_SAMPLE_RATE,
  });
  const chunkCount = Math.round(
    (AUDIO_SAMPLE_RATE * SUSTAINED_AUDIO_SECONDS) / AUDIO_FRAMES_PER_CHUNK,
  );
  const frames = chunkCount * AUDIO_FRAMES_PER_CHUNK;
  const samples = new Float32Array(frames * channels);
  const chunk = new Float32Array(AUDIO_FRAMES_PER_CHUNK * channels);

  // 検査と同じくチャンク単位で作り、境界の扱いまで同じ条件にする。
  for (let index = 0; index < chunkCount; index += 1) {
    generator.fill(chunk, AUDIO_FRAMES_PER_CHUNK);
    for (let channel = 0; channel < channels; channel += 1) {
      samples.set(
        chunk.subarray(
          channel * AUDIO_FRAMES_PER_CHUNK,
          (channel + 1) * AUDIO_FRAMES_PER_CHUNK,
        ),
        channel * frames + index * AUDIO_FRAMES_PER_CHUNK,
      );
    }
  }

  return {
    path: `audio/sustained-${channels === 1 ? "mono" : "stereo"}.wav`,
    contents: encodeWav({
      samples,
      channels,
      sampleRate: AUDIO_SAMPLE_RATE,
      frames,
    }),
    raw: toBytes(samples),
    description: `実用継続検査の音声入力（${channels}ch・${SUSTAINED_AUDIO_SECONDS}秒）。多重波形の掃引と微小ノイズ。`,
  };
};

const buildSamples = (): SampleFile[] => [
  buildCompatibilityVideo(),
  buildSustainedVideo(),
  buildCompatibilityAudio(2),
  buildSustainedAudio(2),
  buildSustainedAudio(1),
];

const buildManifest = (samples: readonly SampleFile[]) => ({
  patternVersion: SYNTHETIC_PATTERN_VERSION,
  note: "npm run inspector:samples で再生成する。rawSha256 は圧縮前の生データのハッシュ。",
  video: {
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
    fps: VIDEO_FPS,
    apngFrameCount: VIDEO_FRAME_COUNT,
    apngFrameStride: VIDEO_FRAME_STRIDE,
  },
  audio: {
    sampleRate: AUDIO_SAMPLE_RATE,
    framesPerChunk: AUDIO_FRAMES_PER_CHUNK,
    sustainedSeconds: SUSTAINED_AUDIO_SECONDS,
    compatibilityChunks: COMPATIBILITY_AUDIO_CHUNKS,
  },
  files: Object.fromEntries(
    samples.map((sample) => [
      sample.path,
      {
        description: sample.description,
        rawBytes: sample.raw.byteLength,
        rawSha256: digest(sample.raw),
        fileBytes: sample.contents.byteLength,
      },
    ]),
  ),
});

type Manifest = ReturnType<typeof buildManifest>;

const samplesDirectory = fileURLToPath(new URL("../samples/", import.meta.url));
const manifestPath = `${samplesDirectory}manifest.json`;

const write = async (samples: readonly SampleFile[]): Promise<void> => {
  await mkdir(`${samplesDirectory}video`, { recursive: true });
  await mkdir(`${samplesDirectory}audio`, { recursive: true });

  for (const sample of samples) {
    await writeFile(`${samplesDirectory}${sample.path}`, sample.contents);
    console.log(
      `${sample.path}: ${(sample.contents.byteLength / 1024).toFixed(0)} KB`,
    );
  }
  await writeFile(
    manifestPath,
    `${JSON.stringify(buildManifest(samples), null, 2)}\n`,
  );
  console.log(
    `manifest.json を更新した（パターン版数 ${SYNTHETIC_PATTERN_VERSION}）`,
  );
};

const check = async (samples: readonly SampleFile[]): Promise<boolean> => {
  let stored: Manifest;
  try {
    stored = JSON.parse(await readFile(manifestPath, "utf8")) as Manifest;
  } catch {
    console.error(
      "samples/manifest.json を読めない。npm run inspector:samples で生成する。",
    );
    return false;
  }

  const expected = buildManifest(samples);
  let ok = true;

  if (stored.patternVersion !== expected.patternVersion) {
    console.error(
      `パターン版数が違う: 保存 ${stored.patternVersion} / 現在 ${expected.patternVersion}`,
    );
    ok = false;
  }

  for (const [path, entry] of Object.entries(expected.files)) {
    const storedEntry = stored.files?.[path];
    if (!storedEntry) {
      console.error(`${path}: manifest に記録が無い`);
      ok = false;
      continue;
    }
    if (storedEntry.rawSha256 !== entry.rawSha256) {
      console.error(`${path}: 生データが変わっている`);
      ok = false;
    }
  }

  for (const sample of samples) {
    try {
      await readFile(`${samplesDirectory}${sample.path}`);
    } catch {
      console.error(`${sample.path}: ファイルが無い`);
      ok = false;
    }
  }

  console.log(
    ok
      ? "samples/ は現在の合成パターンと一致している。"
      : "samples/ が古い。npm run inspector:samples で作り直す。",
  );
  return ok;
};

const main = async (): Promise<void> => {
  const samples = buildSamples();
  if (argv.includes("--check")) {
    process.exitCode = (await check(samples)) ? 0 : 1;
    return;
  }
  await write(samples);
};

await main();
