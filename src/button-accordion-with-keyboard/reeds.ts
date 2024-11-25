import { atom, useAtomValue, useSetAtom } from "jotai";
import * as Tone from "tone";

let isReady = false;

// 倍音の計算
const calculateSawtoothPartial = (index: number) => {
  return index % 2 === 0 ? 1 / (index + 1) : -1 / (index + 1);
};
const calculateSquarePartial = (index: number) => {
  return index % 2 === 0 ? 1 / (index + 1) : 0;
};

// 波形を作成する
const getSawtoothPartials = (partialCount: number) =>
  Array.from({ length: partialCount }, (_, index) =>
    calculateSawtoothPartial(index),
  );
const getSquarePartials = (partialCount: number) =>
  Array.from({ length: partialCount }, (_, index) =>
    calculateSquarePartial(index),
  );

const partialsQuantity = 64; // 倍音の数
// 波形の倍音パラメータを生成する
const sawtoothPartials = getSawtoothPartials(partialsQuantity);
const squarePartials = getSquarePartials(partialsQuantity);
// 2つの波形を合成する
const combinedPartials = sawtoothPartials.map((value, index) => {
  return value - (squarePartials[index] ?? 0) / 2;
});

// TODO: リード音源をatomで管理する必要があるか確認する
// L1, M1, M2, M3, H1 のリード音源を格納する atom を定義する

// M2
const reedM2Atom = atom<Tone.PolySynth | null>(
  new Tone.PolySynth(Tone.Synth, {
    portamento: 0,
    // volume: -16, // コンポーネント側で設定する
    // detune: 0, // コンポーネント側で設定する
    envelope: {
      attack: 0.0001,
      decay: 0.1,
      sustain: 0.95,
      release: 0.25,
    },
    oscillator: {
      type: "custom",
      partials: combinedPartials,
    },
  }).toDestination(),
);
export const useReedM2 = () => {
  return useAtomValue(reedM2Atom);
};
export const useSetReedM2 = () => {
  return useSetAtom(reedM2Atom);
};
export const useSetReedM2Volume = () => {
  const reedM2 = useReedM2();
  const setReedM2Volume = (volume: number) => {
    reedM2?.set({ volume });
  };

  return setReedM2Volume;
};
export const useSetReedM2Pitch = () => {
  const reedM2 = useReedM2();
  const setReedM2Pitch = (detune: number) => {
    reedM2?.set({ detune });
  };

  return setReedM2Pitch;
};
export const usePlayReedM2 = () => {
  const reedM2 = useReedM2();
  const playReedM2 = (frequency: number) => {
    if (!isReady) {
      void Tone.start().then(() => {
        console.log("Tone is ready");
      });
      isReady = true;
    }

    reedM2?.triggerAttack(frequency);
  };
  const stopReedM2 = (frequency: number) => {
    reedM2?.triggerRelease(frequency);
  };

  return { playReedM2, stopReedM2 };
};

// TODO: リードをまとめて管理する atom を定義する
// TODO: どのリードが有効になっているかを管理する atom を定義する
// TODO: 有効なリードの音を再生する関数を定義する

// 全体設定
export const initReeds = () => {
  // ここだけ Tone.js 全体に関わる設定
  Tone.setContext(
    new Tone.Context({ latencyHint: "interactive", lookAhead: 0 }),
  );

  return Tone.getContext();
};

// 音量を管理する atom
const volumeAtom = atom<number>(-18);
export const useVolume = () => {
  return useAtomValue(volumeAtom);
};
export const useSetVolume = () => {
  return useSetAtom(volumeAtom);
};
export const useAdaptAllReedVolumes = () => {
  const reedVolume = useVolume();
  const setReedM2Volume = useSetReedM2Volume();

  const adaptAll = () => {
    setReedM2Volume(reedVolume);
  };

  return adaptAll;
};

// どのリードが有効になっているかを管理する atom
export const reedNames = ["L1", "M1", "M2", "M3", "H1"] as const;
type Reed = (typeof reedNames)[number];
type ReedActivation = Record<Reed, boolean>;

const reedActivationAtom = atom<ReedActivation>({
  L1: false,
  M1: false,
  M2: true,
  M3: false,
  H1: false,
});
export const useReedActivation = () => {
  return useAtomValue(reedActivationAtom);
};
export const useSetReedActivation = () => {
  return useSetAtom(reedActivationAtom);
};

// それぞれのリードのピッチ[cent]を管理する atom
const baseReedPitchAtom = atom<number>(0);
type ReedPitches = Record<Reed, number>;
const relativeReedPitchesAtom = atom<ReedPitches>({
  L1: -1195,
  M1: -7,
  M2: 0,
  M3: 11,
  H1: 1205,
});
export const useRelativeReedPitches = () => {
  return useAtomValue(relativeReedPitchesAtom);
};
export const useSetRelativeReedPitches = () => {
  return useSetAtom(relativeReedPitchesAtom);
};
const reedPitchesAtom = atom<ReedPitches>((get) => {
  const base = get(baseReedPitchAtom);
  const relative = get(relativeReedPitchesAtom);

  const reedPitches: ReedPitches = {
    L1: base + relative.L1,
    M1: base + relative.M1,
    M2: base + relative.M2,
    M3: base + relative.M3,
    H1: base + relative.H1,
  };

  return reedPitches;
});
export const useReedPitches = () => {
  return useAtomValue(reedPitchesAtom);
};
export const useAdaptAllReedPitches = () => {
  const reedPitches = useReedPitches();
  const setReedM2Pitch = useSetReedM2Pitch();

  const adaptAll = () => {
    setReedM2Pitch(reedPitches.M2);
  };

  return adaptAll;
};
