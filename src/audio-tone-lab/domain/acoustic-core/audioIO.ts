export interface MicrophoneAnalyserHandle {
  analyser: AnalyserNode;
  sampleRate: number;
  readLevel: () => number;
  close: () => Promise<void>;
}

import { PREFERRED_MIC_CONSTRAINTS } from "./micConstraints";

export async function createMicrophoneAnalyser(): Promise<MicrophoneAnalyserHandle> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: PREFERRED_MIC_CONSTRAINTS,
  });
  const context = new AudioContext();
  if (context.state === "suspended") {
    await context.resume();
  }
  const source = context.createMediaStreamSource(stream);
  const analyser = context.createAnalyser();
  analyser.fftSize = 2048;
  source.connect(analyser);
  const timeBuffer = new Float32Array(analyser.fftSize);

  return {
    analyser,
    sampleRate: context.sampleRate,
    readLevel: () => {
      analyser.getFloatTimeDomainData(timeBuffer);
      let sum = 0;
      for (let i = 0; i < timeBuffer.length; i += 1) {
        const value = timeBuffer[i] ?? 0;
        sum += value * value;
      }
      return Math.sqrt(sum / timeBuffer.length);
    },
    close: async () => {
      for (const track of stream.getTracks()) {
        track.stop();
      }
      await context.close();
    },
  };
}
