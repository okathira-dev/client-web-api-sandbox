import { PREFERRED_MIC_CONSTRAINTS } from "../../../acoustic-core/micConstraints";
import { demodConfigFromTuning } from "../../../pipeline/demodConfig";
import type { ModemTuning } from "../../types";
import { createPlaybackContext } from "./audioContext";

export interface MicSessionHandle {
  sampleRate: number;
  pushSamples: (handler: (chunk: Float32Array) => void) => void;
  close: () => void;
}

export async function openMicSession(
  tuning: ModemTuning,
): Promise<MicSessionHandle> {
  const demod = demodConfigFromTuning(tuning);
  const context = await createPlaybackContext();
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: PREFERRED_MIC_CONSTRAINTS,
  });
  const source = context.createMediaStreamSource(stream);
  const gainNode = context.createGain();
  gainNode.gain.value = demod.inputGain;
  const bufferSize = 2048;
  const processor = context.createScriptProcessor(bufferSize, 1, 1);
  source.connect(gainNode);
  gainNode.connect(processor);
  processor.connect(context.destination);

  let handler: ((chunk: Float32Array) => void) | null = null;

  processor.onaudioprocess = (event) => {
    if (!handler) return;
    const channel = event.inputBuffer.getChannelData(0);
    handler(new Float32Array(channel));
  };

  return {
    sampleRate: context.sampleRate,
    pushSamples: (next) => {
      handler = next;
    },
    close: () => {
      handler = null;
      processor.disconnect();
      gainNode.disconnect();
      source.disconnect();
      for (const track of stream.getTracks()) {
        track.stop();
      }
      void context.close();
    },
  };
}
