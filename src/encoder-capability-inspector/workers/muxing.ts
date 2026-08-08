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

import {
  MUX_CANCEL_TIMEOUT_MS,
  MUX_FINALIZE_TIMEOUT_MS,
  MUX_START_TIMEOUT_MS,
} from "../consts/inspection";
import type {
  AudioContainerCodec,
  ContainerFormat,
  VideoContainerCodec,
} from "../domain/types";
import { throwIfAborted, withDeadline } from "./async";

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

/**
 * `cancel()` は失敗後の後始末なので、ここでハングして本来のエラーを隠さない。
 * 完了を短時間だけ待ち、終わらなければワーカー終了時の解放に委ねる。
 */
const cancelOutput = async (cancel: () => Promise<void>): Promise<void> => {
  try {
    await withDeadline(
      cancel(),
      MUX_CANCEL_TIMEOUT_MS,
      new AbortController().signal,
      "mux-cancel",
    );
  } catch {
    // 元の多重化エラーを優先する。
  }
};

export const muxVideoChunks = async ({
  entries,
  container,
  containerCodec,
  frameRate,
  signal,
}: {
  entries: readonly VideoChunkEntry[];
  container: ContainerFormat;
  containerCodec: VideoContainerCodec;
  frameRate: number;
  signal: AbortSignal;
}): Promise<number> => {
  const { output, target } = createOutput(container);
  const source = new EncodedVideoPacketSource(containerCodec);
  output.addVideoTrack(source, { frameRate });

  const decoderConfigMeta = findDecoderConfigMeta(entries);
  try {
    throwIfAborted(signal);
    await withDeadline(
      output.start(),
      MUX_START_TIMEOUT_MS,
      signal,
      "mux-start",
    );
    for (const [index, entry] of entries.entries()) {
      throwIfAborted(signal);
      const meta =
        index === 0 && !entry.meta?.decoderConfig
          ? decoderConfigMeta
          : entry.meta;
      await source.add(EncodedPacket.fromEncodedChunk(entry.chunk), meta);
    }
    throwIfAborted(signal);
    await withDeadline(
      output.finalize(),
      MUX_FINALIZE_TIMEOUT_MS,
      signal,
      "mux-finalize",
    );
  } catch (error) {
    await cancelOutput(() => output.cancel());
    throw error;
  }
  return target.buffer?.byteLength ?? 0;
};

export const muxAudioChunks = async ({
  entries,
  container,
  containerCodec,
  signal,
}: {
  entries: readonly AudioChunkEntry[];
  container: ContainerFormat;
  containerCodec: AudioContainerCodec;
  signal: AbortSignal;
}): Promise<number> => {
  const { output, target } = createOutput(container);
  const source = new EncodedAudioPacketSource(containerCodec);
  output.addAudioTrack(source);

  const decoderConfigMeta = findDecoderConfigMeta(entries);
  try {
    throwIfAborted(signal);
    await withDeadline(
      output.start(),
      MUX_START_TIMEOUT_MS,
      signal,
      "mux-start",
    );
    for (const [index, entry] of entries.entries()) {
      throwIfAborted(signal);
      const meta =
        index === 0 && !entry.meta?.decoderConfig
          ? decoderConfigMeta
          : entry.meta;
      await source.add(EncodedPacket.fromEncodedChunk(entry.chunk), meta);
    }
    throwIfAborted(signal);
    await withDeadline(
      output.finalize(),
      MUX_FINALIZE_TIMEOUT_MS,
      signal,
      "mux-finalize",
    );
  } catch (error) {
    await cancelOutput(() => output.cancel());
    throw error;
  }
  return target.buffer?.byteLength ?? 0;
};
