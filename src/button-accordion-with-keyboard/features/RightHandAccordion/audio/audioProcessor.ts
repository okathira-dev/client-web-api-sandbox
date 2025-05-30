import { createPolySynth } from "../../../audio/audioCore";

import type { ReedName } from "../consts";
import type * as Tone from "tone";

type Synths = Record<ReedName, Tone.PolySynth>;

// リード音源を管理
export const reeds: Synths = {
  LOW: createPolySynth(),
  MID_1: createPolySynth(),
  MID_2: createPolySynth(),
  MID_3: createPolySynth(),
  HIGH: createPolySynth(),
};

// リードのフック生成
export const createReedHooks = (reedName: ReedName) => {
  const useSetReedPitch = () => {
    return (detune: number) => {
      reeds[reedName].set({ detune });
    };
  };

  const usePlayReed = () => {
    const playReed = (frequency: number) => {
      reeds[reedName].triggerAttack(frequency);
    };

    const stopReed = (frequency: number) => {
      reeds[reedName].triggerRelease(frequency);
    };

    return { playReed, stopReed };
  };

  return {
    useSetReedPitch,
    usePlayReed,
  };
};

// 音量制御
export const setVolumes = (volume: number) => {
  Object.values(reeds).forEach((reed) => {
    reed.set({ volume });
  });
};
