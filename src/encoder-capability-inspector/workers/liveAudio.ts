/**
 * キャプチャした音声を、候補の設定に合わせて整える。
 *
 * `AudioEncoder` は設定したサンプルレートとチャンネル数に合った `AudioData` しか受け取らない。
 * 一方、画面共有で取れる音声のチャンネル数とサンプルレートは環境任せで、要求どおりとは限らない。
 * ここでチャンネルの割り当てとサンプルレート変換を行い、チャンク境界をまたいでも
 * 波形が飛ばないように状態を持ち回る。
 *
 * どれも planar（チャンネルごとの `Float32Array`）で扱う。`AudioData` の取り出しも
 * `f32-planar` へ揃えるので、ここは WebCodecs に依存せず単体で試せる。
 */

/**
 * チャンネル数を合わせる。
 *
 * 足りないときの複製は、あくまで「エンコーダーへ渡す形を整える」ための処置で、
 * 情報が増えるわけではない。2ch 候補をモノラル入力で通しても 2ch を扱えた証拠にはならないため、
 * 呼び出し側で警告として記録する。
 */
export const mapChannels = (
  source: readonly Float32Array[],
  targetChannels: number,
): Float32Array[] => {
  const sourceChannels = source.length;
  const frames = source[0]?.length ?? 0;

  return Array.from({ length: targetChannels }, (_unused, channel) => {
    if (sourceChannels === 0) return new Float32Array(frames);
    if (channel < sourceChannels) {
      // ダウンミックスが要るのは、行き先が 1ch で入力が多ch のときだけ。
      if (targetChannels !== 1 || sourceChannels === 1) {
        return source[channel] ?? new Float32Array(frames);
      }
      const mixed = new Float32Array(frames);
      for (const plane of source) {
        for (let index = 0; index < frames; index += 1) {
          mixed[index] =
            (mixed[index] ?? 0) + (plane[index] ?? 0) / sourceChannels;
        }
      }
      return mixed;
    }
    // 行き先のほうが多い。最後のチャンネルを複製して埋める。
    return source[sourceChannels - 1] ?? new Float32Array(frames);
  });
};

export type Resampler = {
  readonly push: (planes: readonly Float32Array[]) => Float32Array[];
};

/**
 * 線形補間のリサンプラー。
 *
 * 音質のためではなく、サンプルレートが合わない環境でも検査を通すためのもの。
 * 読み出し位置と直前の 1 サンプルを持ち回るので、チャンクを分けても継ぎ目が出ない。
 */
export const createResampler = ({
  sourceRate,
  targetRate,
  channels,
}: {
  sourceRate: number;
  targetRate: number;
  channels: number;
}): Resampler => {
  const step = sourceRate / targetRate;
  const tail = Array.from({ length: channels }, () => 0);
  let hasTail = false;
  // 次に読みたい位置。直前チャンクの末尾を -1 番目として数える。
  let position = 0;

  const push = (planes: readonly Float32Array[]): Float32Array[] => {
    const frames = planes[0]?.length ?? 0;
    if (frames === 0) return planes.map(() => new Float32Array(0));

    const available = hasTail ? frames + 1 : frames;
    /*
      出力 1 点は入力の floor(位置) と その次 を要る。手元にある最後の位置は
      `available - 1` なので、そこへ収まる点だけを出し、残りは次のチャンクへ持ち越す。
    */
    const outputFrames = Math.max(
      0,
      Math.floor((available - 1 - position) / step) + 1,
    );
    const output = Array.from(
      { length: channels },
      () => new Float32Array(outputFrames),
    );

    // 位置 0 は「直前チャンクの末尾」。実データは 1 番目から並ぶ。
    const sampleAt = (channel: number, index: number): number => {
      if (!hasTail) return planes[channel]?.[index] ?? 0;
      if (index <= 0) return tail[channel] ?? 0;
      return planes[channel]?.[index - 1] ?? 0;
    };

    for (let out = 0; out < outputFrames; out += 1) {
      const source = position + out * step;
      const base = Math.floor(source);
      const fraction = source - base;
      for (let channel = 0; channel < channels; channel += 1) {
        const low = sampleAt(channel, base);
        const high = sampleAt(channel, base + 1);
        const plane = output[channel];
        if (plane) plane[out] = low + (high - low) * fraction;
      }
    }

    const consumed = position + outputFrames * step;
    position = consumed - (available - 1);
    for (let channel = 0; channel < channels; channel += 1) {
      tail[channel] = planes[channel]?.[frames - 1] ?? 0;
    }
    hasTail = true;
    return output;
  };

  return { push };
};

export type PlanarQueue = {
  readonly push: (planes: readonly Float32Array[]) => void;
  readonly size: () => number;
  /** `frames` ぶん取り出して planar 配置の `target` へ書く。足りなければ false。 */
  readonly take: (target: Float32Array, frames: number) => boolean;
};

/**
 * 取り込んだサンプルを貯めておく待ち行列。
 *
 * キャプチャが返す 1 回ぶんの長さと、エンコーダーへ渡す 1 チャンクの長さは一致しないので、
 * ここで詰め替える。
 */
export const createPlanarQueue = (channels: number): PlanarQueue => {
  const pending: Float32Array[][] = [];
  let buffered = 0;
  let offset = 0;

  const push = (planes: readonly Float32Array[]): void => {
    const frames = planes[0]?.length ?? 0;
    if (frames === 0) return;
    pending.push(
      Array.from(
        { length: channels },
        (_unused, channel) => planes[channel] ?? new Float32Array(frames),
      ),
    );
    buffered += frames;
  };

  const take = (target: Float32Array, frames: number): boolean => {
    if (buffered < frames) return false;
    let written = 0;
    while (written < frames) {
      const head = pending[0];
      if (!head) return false;
      const headFrames = head[0]?.length ?? 0;
      const take = Math.min(headFrames - offset, frames - written);
      for (let channel = 0; channel < channels; channel += 1) {
        target.set(
          (head[channel] ?? new Float32Array(headFrames)).subarray(
            offset,
            offset + take,
          ),
          channel * frames + written,
        );
      }
      written += take;
      offset += take;
      if (offset >= headFrames) {
        pending.shift();
        offset = 0;
      }
    }
    buffered -= frames;
    return true;
  };

  return { push, size: () => buffered, take };
};
