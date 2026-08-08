/** プレビュー用に、検査と同じ手順で音声の合成パターンを作る。 */

import {
  createCompatibilityAudioSamples,
  createSustainedAudioGenerator,
} from "../../domain/synthetic";
import type { TestMode } from "../../domain/types";
import {
  PREVIEW_AUDIO_CHANNELS,
  PREVIEW_AUDIO_FRAMES_PER_CHUNK,
  PREVIEW_AUDIO_SAMPLE_RATE,
  PREVIEW_COMPATIBILITY_AUDIO_CHUNKS,
  PREVIEW_SUSTAINED_AUDIO_SECONDS,
} from "./consts";

export type PreviewAudio = {
  /** planar 配置（`channel * frames + index`）。 */
  readonly samples: Float32Array<ArrayBuffer>;
  readonly channels: number;
  readonly frames: number;
  readonly sampleRate: number;
};

/**
 * 検査ワーカーと同じくチャンク単位で作る。
 * 一括実用検査は 1 チャンクを繰り返し、実用継続検査は生成器に位相を持ち回らせる。
 */
export const buildPreviewAudio = (testMode: TestMode): PreviewAudio => {
  const channels = PREVIEW_AUDIO_CHANNELS;
  const sampleRate = PREVIEW_AUDIO_SAMPLE_RATE;
  const chunkFrames = PREVIEW_AUDIO_FRAMES_PER_CHUNK;
  const chunkCount =
    testMode === "sustained"
      ? Math.round((sampleRate * PREVIEW_SUSTAINED_AUDIO_SECONDS) / chunkFrames)
      : PREVIEW_COMPATIBILITY_AUDIO_CHUNKS;
  const frames = chunkFrames * chunkCount;
  const samples = new Float32Array(frames * channels);

  const generator =
    testMode === "sustained"
      ? createSustainedAudioGenerator({ channels, sampleRate })
      : null;
  const chunk = generator
    ? new Float32Array(chunkFrames * channels)
    : createCompatibilityAudioSamples({
        channels,
        sampleRate,
        frames: chunkFrames,
      });

  for (let index = 0; index < chunkCount; index += 1) {
    generator?.fill(chunk, chunkFrames);
    for (let channel = 0; channel < channels; channel += 1) {
      samples.set(
        chunk.subarray(channel * chunkFrames, (channel + 1) * chunkFrames),
        channel * frames + index * chunkFrames,
      );
    }
  }

  return { samples, channels, frames, sampleRate };
};
