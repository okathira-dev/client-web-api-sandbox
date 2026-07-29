/**
 * mediabunny を使った多重化。
 *
 * 「エンコードできた」だけでは実用できるとは限らないので、想定コンテナへ実際に
 * 書き出してバイト数を確認する。ストリーミング出力もフラグメント化も要らないため、
 * BufferTarget へ書いて最後に長さを見るだけでよい。
 */

import {
  BufferTarget,
  EncodedAudioPacketSource,
  EncodedPacket,
  EncodedVideoPacketSource,
  Mp4OutputFormat,
  Output,
  WebMOutputFormat,
} from "mediabunny";

import type {
  AudioContainerCodec,
  ContainerFormat,
  VideoContainerCodec,
} from "../domain/types";

export type VideoChunkEntry = {
  readonly chunk: EncodedVideoChunk;
  readonly meta: EncodedVideoChunkMetadata | undefined;
};

export type AudioChunkEntry = {
  readonly chunk: EncodedAudioChunk;
  readonly meta: EncodedAudioChunkMetadata | undefined;
};

const createOutput = (container: ContainerFormat) => {
  const target = new BufferTarget();
  const output = new Output({
    format:
      container === "webm" ? new WebMOutputFormat() : new Mp4OutputFormat(),
    target,
  });
  return { output, target };
};

/**
 * 最初のパケットには decoderConfig を含む metadata を渡す必要がある。
 * WebCodecs は通常 1 つ目のチャンクに付けてくるが、実装によってはずれるため、
 * チャンク列全体から最初に見つかったものを使う。
 */
const findDecoderConfigMeta = <T extends { readonly decoderConfig?: unknown }>(
  entries: readonly { readonly meta: T | undefined }[],
): T | undefined => entries.find((entry) => entry.meta?.decoderConfig)?.meta;

export const muxVideoChunks = async ({
  entries,
  container,
  containerCodec,
  frameRate,
}: {
  entries: readonly VideoChunkEntry[];
  container: ContainerFormat;
  containerCodec: VideoContainerCodec;
  frameRate: number;
}): Promise<number> => {
  const { output, target } = createOutput(container);
  const source = new EncodedVideoPacketSource(containerCodec);
  output.addVideoTrack(source, { frameRate });

  const decoderConfigMeta = findDecoderConfigMeta(entries);
  await output.start();
  try {
    for (const [index, entry] of entries.entries()) {
      const meta =
        index === 0 && !entry.meta?.decoderConfig
          ? decoderConfigMeta
          : entry.meta;
      await source.add(EncodedPacket.fromEncodedChunk(entry.chunk), meta);
    }
    await output.finalize();
  } catch (error) {
    await output.cancel();
    throw error;
  }
  return target.buffer?.byteLength ?? 0;
};

export const muxAudioChunks = async ({
  entries,
  container,
  containerCodec,
}: {
  entries: readonly AudioChunkEntry[];
  container: ContainerFormat;
  containerCodec: AudioContainerCodec;
}): Promise<number> => {
  const { output, target } = createOutput(container);
  const source = new EncodedAudioPacketSource(containerCodec);
  output.addAudioTrack(source);

  const decoderConfigMeta = findDecoderConfigMeta(entries);
  await output.start();
  try {
    for (const [index, entry] of entries.entries()) {
      const meta =
        index === 0 && !entry.meta?.decoderConfig
          ? decoderConfigMeta
          : entry.meta;
      await source.add(EncodedPacket.fromEncodedChunk(entry.chunk), meta);
    }
    await output.finalize();
  } catch (error) {
    await output.cancel();
    throw error;
  }
  return target.buffer?.byteLength ?? 0;
};
