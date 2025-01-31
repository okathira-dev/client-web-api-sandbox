import * as Tone from "tone";
import { ReedName } from "../../config/rightHand/rightHandConfig";
import { createPolySynth } from "../shared/audioCore";

type RightHandSynths = Record<ReedName, Tone.PolySynth>;

// 右手側のリード音源を管理
export const rightHandReeds: RightHandSynths = {
  LOW: createPolySynth(),
  MID_1: createPolySynth(),
  MID_2: createPolySynth(),
  MID_3: createPolySynth(),
  HIGH: createPolySynth(),
};

// 右手側のリードのフック生成
export const createRightHandReedHooks = (reedName: ReedName) => {
  const useSetReedPitch = () => {
    return (detune: number) => {
      rightHandReeds[reedName].set({ detune });
    };
  };

  const usePlayReed = () => {
    const playReed = (frequency: number) => {
      rightHandReeds[reedName].triggerAttack(frequency);
    };

    const stopReed = (frequency: number) => {
      rightHandReeds[reedName].triggerRelease(frequency);
    };

    return { playReed, stopReed };
  };

  return {
    useSetReedPitch,
    usePlayReed,
  };
};

// 右手側の音量制御
export const setRightHandVolumes = (volume: number) => {
  Object.values(rightHandReeds).forEach((reed) => {
    reed.set({ volume });
  });
};
