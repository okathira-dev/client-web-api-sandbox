import { createPolySynth } from "../../../audio/audioCore";

import type { ReedName } from "../consts";
import type * as Tone from "tone";

// ストラデラベース用のシンセサイザー設定
// 各リードのシンセサイザーを作成
type Synths = Record<ReedName, Tone.PolySynth>;
const reedSynths: Synths = {
  soprano: createPolySynth(),
  alto: createPolySynth(),
  tenor: createPolySynth(),
  bass: createPolySynth(),
};

// リードごとのシンセサイザーとその制御フックを作成する関数
export const createReedHooks = (reedName: ReedName) => {
  const useSetReedPitch = () => {
    return (pitch: number) => {
      reedSynths[reedName].set({ detune: pitch });
    };
  };

  const usePlayReed = () => {
    const playReed = (frequency: number) => {
      reedSynths[reedName].triggerAttack(frequency);
    };

    const stopReed = (frequency: number) => {
      reedSynths[reedName].triggerRelease(frequency);
    };

    return { playReed, stopReed };
  };

  return {
    useSetReedPitch,
    usePlayReed,
  };
};

// // 音を鳴らす関数
// export const playNote = (
//   note: string,
//   duration: number,
//   selectedRegister: string,
// ) => {
//   const preset = STRADELLA_REGISTER_PRESETS[selectedRegister];
//   if (!preset) return;

//   // ベース音とコード音で異なるリード設定を使用
//   Object.entries(preset.bassNote).forEach(([reedName, isActive]) => {
//     if (isActive) {
//       reedSynths[reedName as ReedName].triggerAttackRelease(note, duration);
//     }
//   });

//   Object.entries(preset.chord).forEach(([reedName, isActive]) => {
//     if (isActive) {
//       reedSynths[reedName as ReedName].triggerAttackRelease(note, duration);
//     }
//   });
// };

// 音量を設定する関数
export const setVolume = (volume: number) => {
  Object.values(reedSynths).forEach((reed) => {
    reed.set({ volume });
  });
};
