/**
 * 合成入力のパターン。
 *
 * 2 種類の検査で求めるものが違うため、生成方法を分ける。
 *
 * - 一括実用検査: 全候補を 1 周するので、入力生成は軽いほどよい。
 *   1 枚・1 チャンクだけ作って使い回す前提の、状態を持たないパターン。
 * - 実用継続検査: 動きと情報量が無いと圧縮が効きすぎ、エンコーダーの実力を測れない。
 *   フレーム番号・サンプル位置に応じて変化するパターン。
 *
 * 映像はブラウザー（Canvas）と Node（サンプル出力スクリプト）の双方から同じ絵を得たいので、
 * 「矩形の塗り」と「タイルの貼り付け」だけで表す。色は `hsl()` のような文字列を経由すると
 * 実装ごとの丸めに左右されるため、RGB の整数で持つ。
 */

export type Rgb = readonly [red: number, green: number, blue: number];

/** 単色の矩形塗り。座標・寸法は整数（画素）。 */
export type FillOp = {
  readonly kind: "fill";
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly color: Rgb;
};

/** 事前に作ったノイズタイルの貼り付け。等倍でのみ使う。 */
export type TileOp = {
  readonly kind: "tile";
  readonly tileIndex: number;
  readonly x: number;
  readonly y: number;
};

export type DrawOp = FillOp | TileOp;

export const NOISE_TILE_SIZE = 64;
export const NOISE_TILE_COUNT = 4;

/** パターンの版数。変えたらサンプル出力を作り直す。`samples/manifest.json` に記録する。 */
export const SYNTHETIC_PATTERN_VERSION = 1;

const NOISE_SEED = 0x9e3779b9;

/** 線形合同法。決定的な擬似乱数であればよいので、質より再現性と速さを取る。 */
const createRandom = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state;
  };
};

const wrap = (value: number, limit: number): number =>
  ((value % limit) + limit) % limit;

/**
 * HSL から RGB へ。Canvas の `hsl()` 解釈に頼らず自前で計算し、
 * ブラウザーと Node で同じ画素値になるようにする。
 */
export const hslToRgb = (
  hue: number,
  saturation: number,
  lightness: number,
): Rgb => {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const section = wrap(hue, 360) / 60;
  const second = chroma * (1 - Math.abs((section % 2) - 1));
  const [red, green, blue] =
    section < 1
      ? [chroma, second, 0]
      : section < 2
        ? [second, chroma, 0]
        : section < 3
          ? [0, chroma, second]
          : section < 4
            ? [0, second, chroma]
            : section < 5
              ? [second, 0, chroma]
              : [chroma, 0, second];
  const match = lightness - chroma / 2;
  return [
    Math.round((red + match) * 255),
    Math.round((green + match) * 255),
    Math.round((blue + match) * 255),
  ];
};

/**
 * ノイズタイル。平坦な塗りだけだと空間予測で潰れてしまうので、
 * 決定的な粒状ノイズを貼って情報量を持たせる。
 *
 * 同じタイルを並べると今度はタイル同士で予測が効くため、複数種類を用意して貼り分ける。
 * 返すのは RGBA の画素列で、ブラウザーでは `ImageData`、Node では直接合成に使う。
 */
export const createNoiseTiles = (): readonly Uint8ClampedArray<ArrayBuffer>[] =>
  Array.from({ length: NOISE_TILE_COUNT }, (_unused, tileIndex) => {
    const random = createRandom(NOISE_SEED + tileIndex * 0x1000);
    const pixels = new Uint8ClampedArray(NOISE_TILE_SIZE * NOISE_TILE_SIZE * 4);
    for (let index = 0; index < NOISE_TILE_SIZE * NOISE_TILE_SIZE; index += 1) {
      const value = random();
      pixels[index * 4] = value & 0xff;
      pixels[index * 4 + 1] = (value >>> 8) & 0xff;
      pixels[index * 4 + 2] = (value >>> 16) & 0xff;
      pixels[index * 4 + 3] = 255;
    }
    return pixels;
  });

/**
 * ノイズタイルの枚数。画素数に対して一定の割合を覆うようにし、
 * 解像度が変わってもパターンの性質が変わらないようにする。
 */
const getTileCount = (width: number, height: number): number => {
  const area = width * height;
  const covered = Math.round(area / (NOISE_TILE_SIZE * NOISE_TILE_SIZE * 12));
  // 上限は 4K でも覆う割合が落ちない値にする。タイル 1 枚の貼り付けは十分に軽い。
  return Math.min(256, Math.max(4, covered));
};

/**
 * 一括実用検査の 1 枚。全候補ぶん繰り返すので、生成は 1 回きりで済ませる。
 *
 * 単色だと出力が小さくなりすぎて多重化の検証にならないため、
 * 色帯とノイズタイルで最低限の情報量を持たせる。
 */
export const getCompatibilityFrameOps = (
  width: number,
  height: number,
): readonly DrawOp[] => {
  const ops: DrawOp[] = [
    { kind: "fill", x: 0, y: 0, width, height, color: hslToRgb(210, 0.5, 0.3) },
  ];

  const barCount = 8;
  const barWidth = Math.max(1, Math.floor(width / barCount));
  for (let index = 0; index < barCount; index += 1) {
    ops.push({
      kind: "fill",
      x: index * barWidth,
      y: Math.floor(height / 4),
      width: barWidth,
      height: Math.max(1, Math.floor(height / 2)),
      color: hslToRgb(index * 45, 0.7, 0.25 + (index % 4) * 0.15),
    });
  }

  ops.push({
    kind: "fill",
    x: Math.floor(width / 8),
    y: Math.floor(height / 8),
    width: Math.max(1, Math.floor(width / 6)),
    height: Math.max(1, Math.floor(height / 6)),
    color: hslToRgb(30, 0.75, 0.6),
  });

  const tileCount = getTileCount(width, height);
  for (let index = 0; index < tileCount; index += 1) {
    ops.push({
      kind: "tile",
      tileIndex: index % NOISE_TILE_COUNT,
      x: wrap(index * 137, Math.max(1, width - NOISE_TILE_SIZE)),
      y: wrap(index * 89, Math.max(1, height - NOISE_TILE_SIZE)),
    });
  }

  return ops;
};

/** 動く矩形。速度と大きさをずらし、同じ動きが重ならないようにする。 */
const MOVING_BOXES = [
  { speedX: 13, speedY: 7, widthRatio: 10, heightRatio: 8, hueStep: 11 },
  { speedX: -19, speedY: 11, widthRatio: 14, heightRatio: 6, hueStep: 23 },
  { speedX: 5, speedY: -17, widthRatio: 7, heightRatio: 12, hueStep: 37 },
  { speedX: -29, speedY: -3, widthRatio: 16, heightRatio: 16, hueStep: 53 },
] as const;

/**
 * 実用継続検査の 1 フレーム。
 *
 * 背景の色相回転・横スクロールする縞・速度の違う矩形・移動するノイズタイルを重ね、
 * 動き補償と空間予測のどちらにも頼りきれない絵にする。
 * すべてフレーム番号から決まるので、何度実行しても同じ列になる。
 */
export const getSustainedFrameOps = (
  index: number,
  width: number,
  height: number,
): readonly DrawOp[] => {
  const ops: DrawOp[] = [
    {
      kind: "fill",
      x: 0,
      y: 0,
      width,
      height,
      color: hslToRgb(index * 7, 0.6, 0.28),
    },
  ];

  const stripeCount = 12;
  const stripeWidth = Math.max(1, Math.floor(width / (stripeCount * 2)));
  const stripeOffset = wrap(index * 9, Math.max(1, stripeWidth * 2));
  for (let stripe = 0; stripe < stripeCount; stripe += 1) {
    const x = stripeOffset + stripe * stripeWidth * 2;
    if (x >= width) continue;
    ops.push({
      kind: "fill",
      x,
      y: 0,
      width: Math.min(stripeWidth, width - x),
      height,
      color: hslToRgb(index * 3 + stripe * 30, 0.55, 0.45),
    });
  }

  for (const [boxIndex, box] of MOVING_BOXES.entries()) {
    const boxWidth = Math.max(2, Math.floor(width / box.widthRatio));
    const boxHeight = Math.max(2, Math.floor(height / box.heightRatio));
    ops.push({
      kind: "fill",
      x: wrap(index * box.speedX, Math.max(1, width - boxWidth)),
      y: wrap(index * box.speedY, Math.max(1, height - boxHeight)),
      width: boxWidth,
      height: boxHeight,
      color: hslToRgb(
        index * box.hueStep + boxIndex * 90,
        0.8,
        0.5 + (boxIndex % 2) * 0.2,
      ),
    });
  }

  const tileCount = getTileCount(width, height);
  const maxTileX = Math.max(1, width - NOISE_TILE_SIZE);
  const maxTileY = Math.max(1, height - NOISE_TILE_SIZE);
  for (let tile = 0; tile < tileCount; tile += 1) {
    ops.push({
      kind: "tile",
      tileIndex: (tile + index) % NOISE_TILE_COUNT,
      x: wrap(tile * 149 + index * 31, maxTileX),
      y: wrap(tile * 97 + index * 17, maxTileY),
    });
  }

  return ops;
};

// ---------------------------------------------------------------------------
// 音声
// ---------------------------------------------------------------------------

const TWO_PI = Math.PI * 2;

/**
 * 一括実用検査の音声。2 チャンクぶんを 1 回作って使い回す前提の定常波形。
 * チャンネルごとに周波数を変え、多チャンネルが潰れていないかだけは分かるようにする。
 *
 * 周波数は 50Hz の倍数に揃えてある。1 チャンク（48kHz で 960 サンプル = 20ms）に
 * 整数個の周期が収まるので、同じ列を繰り返し使っても境界で位相が飛ばない。
 */
export const createCompatibilityAudioSamples = ({
  channels,
  sampleRate,
  frames,
}: {
  channels: number;
  sampleRate: number;
  frames: number;
}): Float32Array<ArrayBuffer> => {
  const samples = new Float32Array(frames * channels);
  for (let channel = 0; channel < channels; channel += 1) {
    const frequency = 400 + channel * 150;
    for (let index = 0; index < frames; index += 1) {
      samples[channel * frames + index] =
        Math.sin((TWO_PI * frequency * index) / sampleRate) * 0.2;
    }
  }
  return samples;
};

/**
 * 実用継続検査の音声を作るオシレーター群。
 * 掃引周期と振幅周期を互いに素に近い比にして、短い周期で同じ並びが戻らないようにする。
 */
const SUSTAINED_OSCILLATORS = [
  { lowHz: 80, highHz: 1200, sweepSeconds: 2.9, amplitudeSeconds: 1.7 },
  { lowHz: 200, highHz: 3000, sweepSeconds: 3.7, amplitudeSeconds: 2.3 },
  { lowHz: 500, highHz: 7000, sweepSeconds: 5.3, amplitudeSeconds: 3.1 },
  { lowHz: 1500, highHz: 12000, sweepSeconds: 7.1, amplitudeSeconds: 4.3 },
] as const;

/** 合成後の全体音量。オシレーターの山が重なってもクリップしない値にする。 */
const SUSTAINED_GAIN = 0.8;
/** 純音だけだと圧縮しやすいので、-40 dBFS 程度の微小ノイズを足す。 */
const SUSTAINED_NOISE_LEVEL = 0.01;

/** 三角波（0 → 1 → 0）。掃引を往復させるために使う。 */
const triangle = (value: number, period: number): number => {
  const position = wrap(value / period, 1);
  return position < 0.5 ? position * 2 : 2 - position * 2;
};

export type SyntheticAudioGenerator = {
  /** planar 配置（`channel * frames + index`）の `target` を埋め、内部位置を進める。 */
  readonly fill: (target: Float32Array, frames: number) => void;
};

/**
 * 実用継続検査の音声生成器。
 *
 * 位相を積算で持ち回るので、チャンクをどう分割しても境界で不連続にならない。
 * 生成器を同じ引数で作り直せば同じ列が出る（乱数はシード付き）。
 */
export const createSustainedAudioGenerator = ({
  channels,
  sampleRate,
}: {
  channels: number;
  sampleRate: number;
}): SyntheticAudioGenerator => {
  const oscillatorCount = SUSTAINED_OSCILLATORS.length;
  const phases = new Float64Array(channels * oscillatorCount);
  // 内側のループから読むので、オブジェクトではなく数値の並びとして持つ。
  const lowHz = Float64Array.from(SUSTAINED_OSCILLATORS, (o) => o.lowHz);
  const sweepRatio = Float64Array.from(
    SUSTAINED_OSCILLATORS,
    (o) => o.highHz / o.lowHz,
  );
  const sweepSeconds = Float64Array.from(
    SUSTAINED_OSCILLATORS,
    (o) => o.sweepSeconds,
  );
  const amplitudeSeconds = Float64Array.from(
    SUSTAINED_OSCILLATORS,
    (o) => o.amplitudeSeconds,
  );
  const noise = Array.from({ length: channels }, (_unused, channel) =>
    createRandom(NOISE_SEED + 0x51 + channel * 0x2000),
  );
  // ナイキスト周波数に近づくと折り返すため、掃引の上端を抑える。
  const maxFrequency = sampleRate * 0.45;
  let position = 0;

  const fill = (target: Float32Array, frames: number): void => {
    for (let channel = 0; channel < channels; channel += 1) {
      const random = noise[channel] ?? createRandom(NOISE_SEED);
      // チャンネルごとに掃引の位相と周波数をずらし、左右が同じ波形にならないようにする。
      const timeOffset = channel * 0.41;
      const frequencyScale = 1 + channel * 0.07;

      for (let index = 0; index < frames; index += 1) {
        const seconds = (position + index) / sampleRate;
        let mixed = 0;

        for (
          let oscillator = 0;
          oscillator < oscillatorCount;
          oscillator += 1
        ) {
          const phaseIndex = channel * oscillatorCount + oscillator;
          const sweep = triangle(
            seconds + timeOffset + oscillator * 0.19,
            sweepSeconds[oscillator] ?? 1,
          );
          const frequency = Math.min(
            maxFrequency,
            (lowHz[oscillator] ?? 440) *
              (sweepRatio[oscillator] ?? 1) ** sweep *
              frequencyScale,
          );
          const amplitude =
            0.15 +
            0.85 *
              triangle(
                seconds + timeOffset * 1.7 + oscillator * 0.31,
                amplitudeSeconds[oscillator] ?? 1,
              );

          const phase = phases[phaseIndex] ?? 0;
          mixed += Math.sin(phase) * amplitude;
          const advanced = phase + (TWO_PI * frequency) / sampleRate;
          phases[phaseIndex] =
            advanced >= TWO_PI ? advanced - TWO_PI : advanced;
        }

        target[channel * frames + index] =
          (mixed / oscillatorCount) * SUSTAINED_GAIN +
          ((random() / 0x1_0000_0000) * 2 - 1) * SUSTAINED_NOISE_LEVEL;
      }
    }
    position += frames;
  };

  return { fill };
};
