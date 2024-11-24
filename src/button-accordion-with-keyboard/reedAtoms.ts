import { atom, useAtomValue, useSetAtom } from "jotai";
import * as Tone from "tone";

let isReady = false;

// L1, M1, M2, M3, H1 のリード音源を格納する atom を定義する

// M1
const reedM1Atom = atom<Tone.PolySynth | null>(null);
export const useReedM1 = () => {
  return useAtomValue(reedM1Atom);
};
export const useSetReedM1 = () => {
  return useSetAtom(reedM1Atom);
};
export const useInitReedM1 = () => {
  const setReedM1 = useSetReedM1();

  const initReedM1 = (initialVolume: number) => {
    // ここだけ Tone.js 全体に関わる設定
    Tone.setContext(new Tone.Context({ latencyHint: "interactive" }));
    Tone.getContext().lookAhead = 0;

    const newSynth = new Tone.PolySynth(Tone.Synth, {
      portamento: 0,
      volume: initialVolume,
      detune: 0,
      envelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0.95,
        release: 0.4,
      },
      oscillator: {
        type: "custom",
        partials: [
          1.909859317102744, -0.3183098861837907, 0.6366197723675814,
          -0.15915494309189535, 0.3819718634205488, -0.1061032953945969,
          0.272837045300392, -0.07957747154594767, 0.2122065907891938,
          -0.06366197723675814, 0.17362357428206768, -0.05305164769729845,
          0.14691225516174952, -0.04547284088339867, 0.1273239544735163,
          -0.039788735772973836, 0.11234466571192611, -0.0353677651315323,
          0.10051891142646022, -0.03183098861837907,
        ],
      },
    }).toDestination();

    setReedM1(newSynth);
  };

  return initReedM1;
};
export const useSetReedM1Volume = () => {
  const reedM1 = useReedM1();
  const setReedM1Volume = (volume: number) => {
    reedM1?.set({ volume });
  };

  return setReedM1Volume;
};
export const usePlayReedM1 = () => {
  const reedM1 = useReedM1();
  const playReedM1 = (frequency: number) => {
    if (!isReady) {
      void Tone.start().then(() => {
        console.log("Tone is ready");
      });
      isReady = true;
    }

    reedM1?.triggerAttack(frequency);
  };
  const stopReedM1 = (frequency: number) => {
    reedM1?.triggerRelease(frequency);
  };

  return { playReedM1, stopReedM1 };
};

// TODO: リードをまとめて管理する atom を定義する
// TODO: どのリードが有効になっているかを管理する atom を定義する
// TODO: 有効なリードの音を再生する関数を定義する
