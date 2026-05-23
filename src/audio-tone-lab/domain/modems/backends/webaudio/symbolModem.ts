import { getSampleRate } from "./audioContext";
import { detectToneIndex, goertzelPower } from "./goertzel";

const PREAMBLE_SYMBOLS = [0, 1, 2, 3, 0, 1, 2, 3] as const;

export function appendTone(
  out: number[],
  sampleRate: number,
  hz: number,
  durationMs: number,
  gain: number,
  phaseRef: { value: number },
) {
  const count = Math.max(1, Math.round((sampleRate * durationMs) / 1000));
  const step = (2 * Math.PI * hz) / sampleRate;
  for (let i = 0; i < count; i += 1) {
    out.push(Math.sin(phaseRef.value) * gain);
    phaseRef.value += step;
  }
}

export function appendGap(out: number[], sampleRate: number, gapMs: number) {
  const count = Math.max(0, Math.round((sampleRate * gapMs) / 1000));
  for (let i = 0; i < count; i += 1) {
    out.push(0);
  }
}

export function bytesToMfsk4Samples(
  bytes: Uint8Array,
  frequencies: number[],
  symbolMs: number,
  gapMs: number,
  txGain: number,
): Float32Array {
  const sampleRate = getSampleRate();
  const out: number[] = [];
  const phase = { value: 0 };

  for (const sym of PREAMBLE_SYMBOLS) {
    appendTone(
      out,
      sampleRate,
      frequencies[sym] ?? 2000,
      symbolMs,
      txGain,
      phase,
    );
    appendGap(out, sampleRate, gapMs);
  }

  for (const byte of bytes) {
    for (let shift = 6; shift >= 0; shift -= 2) {
      const sym = (byte >> shift) & 0b11;
      appendTone(
        out,
        sampleRate,
        frequencies[sym] ?? 2000,
        symbolMs,
        txGain,
        phase,
      );
      appendGap(out, sampleRate, gapMs);
    }
  }

  return new Float32Array(out);
}

export function decodeMfsk4Stream(
  chunk: Float32Array,
  sampleRate: number,
  frequencies: number[],
  symbolMs: number,
  gapMs: number,
  state: {
    buffer: Float32Array;
    preambleMatched: number;
    bits: number[];
    bytes: number[];
  },
): Uint8Array | null {
  const merged = new Float32Array(state.buffer.length + chunk.length);
  merged.set(state.buffer);
  merged.set(chunk, state.buffer.length);
  state.buffer = merged;

  const symbolSamples = Math.max(
    64,
    Math.round((sampleRate * symbolMs) / 1000),
  );
  const gapSamples = Math.round((sampleRate * gapMs) / 1000);
  const window = symbolSamples + gapSamples;

  while (state.buffer.length >= window) {
    const slice = state.buffer.slice(0, symbolSamples);
    state.buffer = state.buffer.slice(window);
    const sym = detectToneIndex(slice, sampleRate, frequencies);

    if (!state.preambleMatched) {
      const expected = PREAMBLE_SYMBOLS[state.preambleMatched];
      if (sym === expected) {
        state.preambleMatched += 1;
        if (state.preambleMatched >= PREAMBLE_SYMBOLS.length) {
          state.bits = [];
          state.bytes = [];
        }
      } else {
        state.preambleMatched = sym === PREAMBLE_SYMBOLS[0] ? 1 : 0;
      }
      continue;
    }

    state.bits.push(sym & 0b11);
    if (state.bits.length === 4) {
      const byte =
        ((state.bits[0] ?? 0) << 6) |
        ((state.bits[1] ?? 0) << 4) |
        ((state.bits[2] ?? 0) << 2) |
        (state.bits[3] ?? 0);
      state.bits = [];
      state.bytes.push(byte);
    }
  }

  if (state.bytes.length < 12) return null;
  try {
    return new Uint8Array(state.bytes);
  } catch {
    return null;
  }
}

export function bytesToBinaryFskSamples(
  bytes: Uint8Array,
  markHz: number,
  spaceHz: number,
  baud: number,
  txGain: number,
): Float32Array {
  const sampleRate = getSampleRate();
  const out: number[] = [];
  const phase = { value: 0 };
  const bitDurationMs = 1000 / baud;

  const bits: number[] = [];
  for (const byte of bytes) {
    for (let b = 7; b >= 0; b -= 1) {
      bits.push((byte >> b) & 1);
    }
  }

  for (const bit of bits) {
    appendTone(
      out,
      sampleRate,
      bit === 1 ? markHz : spaceHz,
      bitDurationMs,
      txGain,
      phase,
    );
  }

  return new Float32Array(out);
}

export function decodeBinaryFskStream(
  chunk: Float32Array,
  sampleRate: number,
  markHz: number,
  spaceHz: number,
  baud: number,
  state: { buffer: Float32Array; bits: number[]; bytes: number[] },
): Uint8Array | null {
  const merged = new Float32Array(state.buffer.length + chunk.length);
  merged.set(state.buffer);
  merged.set(chunk, state.buffer.length);
  state.buffer = merged;

  const bitSamples = Math.max(32, Math.round(sampleRate / baud));

  while (state.buffer.length >= bitSamples) {
    const slice = state.buffer.slice(0, bitSamples);
    state.buffer = state.buffer.slice(bitSamples);
    const markPower = goertzelPower(slice, sampleRate, markHz);
    const spacePower = goertzelPower(slice, sampleRate, spaceHz);
    state.bits.push(markPower >= spacePower ? 1 : 0);
    if (state.bits.length === 8) {
      let byte = 0;
      for (const bit of state.bits) {
        byte = (byte << 1) | bit;
      }
      state.bits = [];
      state.bytes.push(byte);
    }
  }

  if (state.bytes.length < 12) return null;
  return new Uint8Array(state.bytes);
}

export function bytesToGmskSamples(
  bytes: Uint8Array,
  centerHz: number,
  deviationHz: number,
  symbolMs: number,
  txGain: number,
): Float32Array {
  const sampleRate = getSampleRate();
  const out: number[] = [];
  let phase = 0;
  let currentHz = centerHz - deviationHz;

  const emit = (hz: number, durationMs: number) => {
    const count = Math.max(1, Math.round((sampleRate * durationMs) / 1000));
    const step = (2 * Math.PI * hz) / sampleRate;
    for (let i = 0; i < count; i += 1) {
      out.push(Math.sin(phase) * txGain);
      phase += step;
    }
  };

  emit(centerHz, symbolMs * 2);

  for (const byte of bytes) {
    for (let b = 7; b >= 0; b -= 1) {
      const bit = (byte >> b) & 1;
      currentHz = bit ? centerHz + deviationHz : centerHz - deviationHz;
      emit(currentHz, symbolMs);
    }
  }

  return new Float32Array(out);
}

export function decodeGmskStream(
  chunk: Float32Array,
  sampleRate: number,
  centerHz: number,
  deviationHz: number,
  symbolMs: number,
  state: {
    buffer: Float32Array;
    bits: number[];
    bytes: number[];
    synced: boolean;
  },
): Uint8Array | null {
  const merged = new Float32Array(state.buffer.length + chunk.length);
  merged.set(state.buffer);
  merged.set(chunk, state.buffer.length);
  state.buffer = merged;

  const symbolSamples = Math.max(
    32,
    Math.round((sampleRate * symbolMs) / 1000),
  );
  const lowHz = centerHz - deviationHz;
  const highHz = centerHz + deviationHz;

  while (state.buffer.length >= symbolSamples) {
    const slice = state.buffer.slice(0, symbolSamples);
    state.buffer = state.buffer.slice(symbolSamples);
    const low = goertzelPower(slice, sampleRate, lowHz);
    const high = goertzelPower(slice, sampleRate, highHz);
    if (!state.synced) {
      if (high > low * 1.2) state.synced = true;
      continue;
    }
    state.bits.push(high >= low ? 1 : 0);
    if (state.bits.length === 8) {
      let byte = 0;
      for (const bit of state.bits) {
        byte = (byte << 1) | bit;
      }
      state.bits = [];
      state.bytes.push(byte);
    }
  }

  if (state.bytes.length < 12) return null;
  return new Uint8Array(state.bytes);
}
