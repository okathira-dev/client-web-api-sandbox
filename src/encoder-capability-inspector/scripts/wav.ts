/**
 * WAV（16bit PCM）の書き出し。
 *
 * 合成した音声をそのまま聴いて確かめられるようにするためのもので、可逆・追加依存なしを優先する。
 * 検査で使うのは f32-planar なので、ここで 16bit のインターリーブへ落とす。
 */

/** planar（`channel * frames + index`）の Float32 を 16bit PCM のインターリーブへ。 */
const toInterleavedPcm16 = (
  samples: Float32Array,
  channels: number,
  frames: number,
): Buffer => {
  const data = Buffer.alloc(frames * channels * 2);
  for (let index = 0; index < frames; index += 1) {
    for (let channel = 0; channel < channels; channel += 1) {
      const value = samples[channel * frames + index] ?? 0;
      const clamped = Math.max(-1, Math.min(1, value));
      // 負側のほうが 1 段深いので、-32768 と 32767 の両端に正しく届くよう分けて丸める。
      const scaled = Math.round(clamped * (clamped < 0 ? 32_768 : 32_767));
      data.writeInt16LE(scaled, (index * channels + channel) * 2);
    }
  }
  return data;
};

export const encodeWav = ({
  samples,
  channels,
  sampleRate,
  frames,
}: {
  samples: Float32Array;
  channels: number;
  sampleRate: number;
  frames: number;
}): Buffer => {
  const pcm = toInterleavedPcm16(samples, channels, frames);
  const blockAlign = channels * 2;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0, "latin1");
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8, "latin1");

  header.write("fmt ", 12, "latin1");
  header.writeUInt32LE(16, 16); // fmt チャンクの大きさ
  header.writeUInt16LE(1, 20); // 1 = リニア PCM
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * blockAlign, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(16, 34); // ビット深度

  header.write("data", 36, "latin1");
  header.writeUInt32LE(pcm.length, 40);

  return Buffer.concat([header, pcm]);
};
