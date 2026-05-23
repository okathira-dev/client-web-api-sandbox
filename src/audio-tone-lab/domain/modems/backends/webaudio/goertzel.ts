export function goertzelPower(
  samples: Float32Array,
  sampleRate: number,
  targetHz: number,
): number {
  const k = Math.round((samples.length * targetHz) / sampleRate);
  const w = (2 * Math.PI * k) / samples.length;
  const cosine = Math.cos(w);
  const coeff = 2 * cosine;
  let s0 = 0;
  let s1 = 0;
  let s2 = 0;
  for (let i = 0; i < samples.length; i += 1) {
    s0 = (samples[i] ?? 0) + coeff * s1 - s2;
    s2 = s1;
    s1 = s0;
  }
  const power = s1 * s1 + s2 * s2 - coeff * s1 * s2;
  return Math.max(0, power);
}

export function detectToneIndex(
  samples: Float32Array,
  sampleRate: number,
  frequencies: number[],
): number {
  let bestIndex = 0;
  let bestPower = -1;
  for (let i = 0; i < frequencies.length; i += 1) {
    const power = goertzelPower(samples, sampleRate, frequencies[i] ?? 0);
    if (power > bestPower) {
      bestPower = power;
      bestIndex = i;
    }
  }
  return bestIndex;
}
