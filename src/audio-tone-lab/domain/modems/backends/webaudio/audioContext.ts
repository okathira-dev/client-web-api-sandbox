const SAMPLE_RATE = 48000;

export function getSampleRate() {
  return SAMPLE_RATE;
}

export async function createPlaybackContext() {
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) throw new Error("Web Audio API is not available");
  const context = new Ctx({ sampleRate: SAMPLE_RATE });
  if (context.state === "suspended") {
    await context.resume();
  }
  return context;
}

export async function playSamples(
  samples: Float32Array,
  gain = 0.08,
): Promise<void> {
  const context = await createPlaybackContext();
  const buffer = context.createBuffer(1, samples.length, context.sampleRate);
  buffer.getChannelData(0).set(samples);
  const source = context.createBufferSource();
  source.buffer = buffer;
  const gainNode = context.createGain();
  gainNode.gain.value = gain;
  source.connect(gainNode);
  gainNode.connect(context.destination);
  await new Promise<void>((resolve) => {
    source.onended = () => resolve();
    source.start(0);
  });
  await context.close();
}
