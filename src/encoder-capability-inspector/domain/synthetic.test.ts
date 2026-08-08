import {
  createCompatibilityAudioSamples,
  createNoiseTiles,
  createSustainedAudioGenerator,
  getCompatibilityFrameOps,
  getSustainedFrameOps,
  hslToRgb,
  NOISE_TILE_COUNT,
  NOISE_TILE_SIZE,
} from "./synthetic";

const FRAME_SIZES = [
  [640, 480],
  [1920, 1080],
  [3840, 2160],
] as const;

describe("hslToRgb", () => {
  it("matches the reference values of the CSS conversion", () => {
    expect(hslToRgb(0, 1, 0.5)).toEqual([255, 0, 0]);
    expect(hslToRgb(120, 1, 0.5)).toEqual([0, 255, 0]);
    expect(hslToRgb(240, 1, 0.5)).toEqual([0, 0, 255]);
    expect(hslToRgb(0, 0, 0.5)).toEqual([128, 128, 128]);
  });

  it("wraps the hue so generated frames never produce out-of-range channels", () => {
    for (let hue = -720; hue <= 720; hue += 7) {
      for (const channel of hslToRgb(hue, 0.8, 0.5)) {
        expect(channel).toBeGreaterThanOrEqual(0);
        expect(channel).toBeLessThanOrEqual(255);
      }
    }
  });
});

describe("createNoiseTiles", () => {
  it("returns the same pixels on every call", () => {
    expect(createNoiseTiles()).toEqual(createNoiseTiles());
  });

  it("makes each tile differ so neighbouring tiles do not predict each other", () => {
    const tiles = createNoiseTiles();
    expect(tiles).toHaveLength(NOISE_TILE_COUNT);
    const signatures = tiles.map((tile) => tile.join(","));
    expect(new Set(signatures).size).toBe(NOISE_TILE_COUNT);
    for (const tile of tiles) {
      expect(tile).toHaveLength(NOISE_TILE_SIZE * NOISE_TILE_SIZE * 4);
      // 不透明であることは、下の塗りが透けないという描画側の前提になる。
      for (let index = 3; index < tile.length; index += 4) {
        expect(tile[index]).toBe(255);
      }
    }
  });
});

describe("frame operations", () => {
  it("keeps every fill inside the frame", () => {
    for (const [width, height] of FRAME_SIZES) {
      const ops = [
        ...getCompatibilityFrameOps(width, height),
        ...getSustainedFrameOps(0, width, height),
        ...getSustainedFrameOps(37, width, height),
      ];
      for (const op of ops) {
        if (op.kind !== "fill") continue;
        expect(op.x).toBeGreaterThanOrEqual(0);
        expect(op.y).toBeGreaterThanOrEqual(0);
        expect(op.x + op.width).toBeLessThanOrEqual(width);
        expect(op.y + op.height).toBeLessThanOrEqual(height);
        expect(Number.isInteger(op.x)).toBe(true);
        expect(Number.isInteger(op.y)).toBe(true);
      }
    }
  });

  it("starts every frame with a fill that covers the whole frame", () => {
    for (const [width, height] of FRAME_SIZES) {
      for (const ops of [
        getCompatibilityFrameOps(width, height),
        getSustainedFrameOps(11, width, height),
      ]) {
        expect(ops[0]).toMatchObject({
          kind: "fill",
          x: 0,
          y: 0,
          width,
          height,
        });
      }
    }
  });

  it("addresses only tiles that exist", () => {
    for (const [width, height] of FRAME_SIZES) {
      for (let index = 0; index < 8; index += 1) {
        for (const op of getSustainedFrameOps(index, width, height)) {
          if (op.kind !== "tile") continue;
          expect(op.tileIndex).toBeGreaterThanOrEqual(0);
          expect(op.tileIndex).toBeLessThan(NOISE_TILE_COUNT);
          expect(op.x).toBeGreaterThanOrEqual(0);
          expect(op.y).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it("returns the same operations for the same frame number", () => {
    expect(getSustainedFrameOps(42, 1280, 720)).toEqual(
      getSustainedFrameOps(42, 1280, 720),
    );
    expect(getCompatibilityFrameOps(1280, 720)).toEqual(
      getCompatibilityFrameOps(1280, 720),
    );
  });

  it("moves something on every step, so no frame is a copy of the last", () => {
    for (let index = 0; index < 90; index += 1) {
      expect(getSustainedFrameOps(index + 1, 1280, 720)).not.toEqual(
        getSustainedFrameOps(index, 1280, 720),
      );
    }
  });
});

describe("createCompatibilityAudioSamples", () => {
  it("fits a whole number of periods into one chunk so the reused buffer does not click", () => {
    const frames = 960;
    const sampleRate = 48_000;
    const channels = 2;
    // 同じ列を 2 チャンクぶん並べたものと、2 チャンクぶんを続けて作ったものが
    // 一致すれば、1 チャンクを使い回しても波形がつながる。
    const single = createCompatibilityAudioSamples({
      channels,
      sampleRate,
      frames,
    });
    const doubled = createCompatibilityAudioSamples({
      channels,
      sampleRate,
      frames: frames * 2,
    });
    for (let channel = 0; channel < channels; channel += 1) {
      for (let index = 0; index < frames; index += 1) {
        expect(doubled[channel * frames * 2 + frames + index]).toBeCloseTo(
          single[channel * frames + index] ?? Number.NaN,
          6,
        );
      }
    }
  });

  it("gives each channel a different waveform", () => {
    const frames = 960;
    const samples = createCompatibilityAudioSamples({
      channels: 2,
      sampleRate: 48_000,
      frames,
    });
    const left = samples.slice(0, frames);
    const right = samples.slice(frames, frames * 2);
    expect([...left]).not.toEqual([...right]);
  });

  it("stays well inside the full scale range", () => {
    const samples = createCompatibilityAudioSamples({
      channels: 2,
      sampleRate: 48_000,
      frames: 960,
    });
    for (const sample of samples) {
      expect(Math.abs(sample)).toBeLessThanOrEqual(0.9);
    }
  });
});

describe("createSustainedAudioGenerator", () => {
  const sampleRate = 48_000;
  const channels = 2;

  const collect = (chunkFrames: number, chunkCount: number): number[] => {
    const generator = createSustainedAudioGenerator({ channels, sampleRate });
    const buffer = new Float32Array(chunkFrames * channels);
    const collected: number[] = [];
    for (let chunk = 0; chunk < chunkCount; chunk += 1) {
      generator.fill(buffer, chunkFrames);
      for (let channel = 0; channel < channels; channel += 1) {
        for (let index = 0; index < chunkFrames; index += 1) {
          collected.push(buffer[channel * chunkFrames + index] ?? Number.NaN);
        }
      }
    }
    return collected;
  };

  it("produces the same samples for the same construction arguments", () => {
    expect(collect(960, 4)).toEqual(collect(960, 4));
  });

  it("never clips", () => {
    const generator = createSustainedAudioGenerator({ channels, sampleRate });
    const buffer = new Float32Array(960 * channels);
    let peak = 0;
    // 掃引と振幅の周期が一巡するだけの長さを流し、山が重なる区間も含めて見る。
    for (let chunk = 0; chunk < 400; chunk += 1) {
      generator.fill(buffer, 960);
      for (const sample of buffer) {
        peak = Math.max(peak, Math.abs(sample));
      }
    }
    expect(peak).toBeLessThan(1);
    // 逆に小さすぎても、エンコーダーに渡る情報量が減ってしまう。
    expect(peak).toBeGreaterThan(0.3);
  });

  it("keeps the phase continuous across chunk boundaries", () => {
    const chunkFrames = 960;
    const generator = createSustainedAudioGenerator({ channels, sampleRate });
    const buffer = new Float32Array(chunkFrames * channels);
    let previousTail: number | null = null;
    let previousStep: number | null = null;

    for (let chunk = 0; chunk < 20; chunk += 1) {
      generator.fill(buffer, chunkFrames);
      const head = buffer[0] ?? Number.NaN;
      if (previousTail !== null && previousStep !== null) {
        // 境界をまたぐ変化が、チャンク内の 1 サンプルあたりの変化と同じ桁に収まっていること。
        const boundaryStep = Math.abs(head - previousTail);
        expect(boundaryStep).toBeLessThan(previousStep * 4 + 0.02);
      }
      previousTail = buffer[chunkFrames - 1] ?? Number.NaN;
      previousStep = Math.abs(
        (buffer[chunkFrames - 1] ?? 0) - (buffer[chunkFrames - 2] ?? 0),
      );
    }
  });

  it("does not depend on how the stream is cut into chunks", () => {
    const asOneChunk = collect(1920, 1);
    const asTwoChunks = collect(960, 2);
    // planar なので、チャンクを分けると並びは変わる。同じ位置の値を突き合わせる。
    for (let index = 0; index < 960; index += 1) {
      expect(asTwoChunks[index]).toBeCloseTo(asOneChunk[index] ?? 0, 6);
    }
  });

  it("gives each channel a different signal", () => {
    const frames = 4800;
    const generator = createSustainedAudioGenerator({ channels, sampleRate });
    const buffer = new Float32Array(frames * channels);
    generator.fill(buffer, frames);
    const left = buffer.slice(0, frames);
    const right = buffer.slice(frames, frames * 2);
    expect([...left]).not.toEqual([...right]);
  });

  it("sweeps instead of holding one tone", () => {
    const frames = 48_000;
    const generator = createSustainedAudioGenerator({ channels, sampleRate });
    const buffer = new Float32Array(frames * channels);
    generator.fill(buffer, frames);

    const crossings = (from: number, to: number): number => {
      let count = 0;
      for (let index = from + 1; index < to; index += 1) {
        const previous = buffer[index - 1] ?? 0;
        const current = buffer[index] ?? 0;
        if (previous <= 0 && current > 0) count += 1;
      }
      return count;
    };

    // 前半と後半でゼロ交差の数が変われば、周波数が動いている。
    expect(crossings(0, frames / 2)).not.toBe(crossings(frames / 2, frames));
  });
});
