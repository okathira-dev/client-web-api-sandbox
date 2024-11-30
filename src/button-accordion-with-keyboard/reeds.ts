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

// 共通のPolySynth設定
const createPolySynth = () =>
  new Tone.PolySynth(Tone.Synth, {
    portamento: 0,
    envelope: {
      attack: 0.001,
      decay: 0.1,
      sustain: 0.975,
      release: 0.175,
    },
    oscillator: {
      type: "custom",
      partials: combinedPartials,
    },
  }).toDestination();

// リードの型定義
export const reedNames = ["L1", "M1", "M2", "M3", "H1"] as const;
export type ReedName = (typeof reedNames)[number];
type ReedSynths = Record<ReedName, Tone.PolySynth>;

// リード音源を管理するオブジェクト
const reeds: ReedSynths = {
  L1: createPolySynth(),
  M1: createPolySynth(),
  M2: createPolySynth(),
  M3: createPolySynth(),
  H1: createPolySynth(),
};

// 共通の関数を生成するファクトリ関数
const createReedHooks = (reedName: ReedName) => {
  //  今のところボリュームを個別で設定することは無い
  // const useSetReedVolume = () => {
  //   return (volume: number) => {
  //     reeds[reedName].set({ volume });
  //   };
  // };

  const useSetReedPitch = () => {
    return (detune: number) => {
      reeds[reedName].set({ detune });
    };
  };

  const usePlayReed = () => {
    const playReed = (frequency: number) => {
      if (!isReady) {
        void Tone.start().then(() => {
          console.log("Tone is ready");
        });
        isReady = true;
      }
      reeds[reedName].triggerAttack(frequency);
    };

    const stopReed = (frequency: number) => {
      reeds[reedName].triggerRelease(frequency);
    };

    return { playReed, stopReed };
  };

  return {
    // useSetReedVolume,
    useSetReedPitch,
    usePlayReed,
  };
};

// 各リードのhooksを生成と名前付け
const { useSetReedPitch: useSetReedL1Pitch, usePlayReed: usePlayReedL1 } =
  createReedHooks("L1");

const { useSetReedPitch: useSetReedM1Pitch, usePlayReed: usePlayReedM1 } =
  createReedHooks("M1");

const { useSetReedPitch: useSetReedM2Pitch, usePlayReed: usePlayReedM2 } =
  createReedHooks("M2");

const { useSetReedPitch: useSetReedM3Pitch, usePlayReed: usePlayReedM3 } =
  createReedHooks("M3");

const { useSetReedPitch: useSetReedH1Pitch, usePlayReed: usePlayReedH1 } =
  createReedHooks("H1");

// 全体設定
export const initReeds = () => {
  // レイテンシーを最小限に抑えるための設定
  Tone.setContext(
    new Tone.Context({
      latencyHint: "interactive",
      lookAhead: 0,
      updateInterval: 0.01, // 更新間隔を短く設定
    }),
  );

  return Tone.getContext();
};

// 音量を直接設定する関数をエクスポート
export const setAllReedVolumes = (volume: number) => {
  Object.values(reeds).forEach((reed) => {
    reed.set({ volume });
  });
};

// 12個の音色切り替えスイッチに対応する ReedActivation を定義する
export const reedActivationPresets: ReedActivation[] = [
  { L1: true, M1: false, M2: false, M3: false, H1: false }, // bassoon
  { L1: true, M1: false, M2: true, M3: false, H1: false }, // bandoneon
  { L1: true, M1: false, M2: true, M3: true, H1: false }, // accordion
  { L1: true, M1: false, M2: true, M3: false, H1: true }, // harmonium
  { L1: true, M1: true, M2: false, M3: true, H1: true }, // master
  { L1: false, M1: false, M2: true, M3: false, H1: true }, // oboe
  { L1: false, M1: true, M2: true, M3: true, H1: false }, // musette
  { L1: false, M1: false, M2: true, M3: true, H1: false }, // violin
  { L1: false, M1: false, M2: true, M3: false, H1: false }, // clarinet
  { L1: true, M1: false, M2: false, M3: false, H1: true }, // organ
  { L1: false, M1: true, M2: true, M3: true, H1: true }, // ???
  { L1: false, M1: false, M2: false, M3: false, H1: true }, // piccolo
];

const INITIAL_SELECTED_PRESET = 2;

const selectedPresetAtom = atom<number>(INITIAL_SELECTED_PRESET);
export const useSelectedPreset = () => useAtomValue(selectedPresetAtom);
export const useSetSelectedPreset = () => useSetAtom(selectedPresetAtom);
export const useAdoptPreset = () => {
  const setReedActivation = useSetReedActivation();

  const adoptPreset = (selectedPreset: number) => {
    const newReedActivation = reedActivationPresets[selectedPreset];

    if (newReedActivation) {
      setReedActivation(newReedActivation);
    }
  };

  return adoptPreset;
};

// どのリードが有効になっているかを管理する atom
const reedActivationAtom = atom<ReedActivation>(
  reedActivationPresets[INITIAL_SELECTED_PRESET]!,
);

export const useReedActivation = () => useAtomValue(reedActivationAtom);
export const useSetReedActivation = () => useSetAtom(reedActivationAtom);

type ReedActivation = Record<ReedName, boolean>;

// それぞれのリードのピッチ[cent]を管理する atom
const baseReedPitchAtom = atom<number>(0);
type ReedPitches = Record<ReedName, number>;
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
  const setReedL1Pitch = useSetReedL1Pitch();
  const setReedM1Pitch = useSetReedM1Pitch();
  const setReedM2Pitch = useSetReedM2Pitch();
  const setReedM3Pitch = useSetReedM3Pitch();
  const setReedH1Pitch = useSetReedH1Pitch();

  const adaptAll = () => {
    setReedL1Pitch(reedPitches.L1);
    setReedM1Pitch(reedPitches.M1);
    setReedM2Pitch(reedPitches.M2);
    setReedM3Pitch(reedPitches.M3);
    setReedH1Pitch(reedPitches.H1);
  };

  return adaptAll;
};

export const usePlayActiveReeds = () => {
  const reedActivation = useReedActivation();
  const { playReed: playReedL1, stopReed: stopReedL1 } = usePlayReedL1();
  const { playReed: playReedM1, stopReed: stopReedM1 } = usePlayReedM1();
  const { playReed: playReedM2, stopReed: stopReedM2 } = usePlayReedM2();
  const { playReed: playReedM3, stopReed: stopReedM3 } = usePlayReedM3();
  const { playReed: playReedH1, stopReed: stopReedH1 } = usePlayReedH1();

  const playActiveReeds = (frequency: number) => {
    if (reedActivation.L1) playReedL1(frequency);
    if (reedActivation.M1) playReedM1(frequency);
    if (reedActivation.M2) playReedM2(frequency);
    if (reedActivation.M3) playReedM3(frequency);
    if (reedActivation.H1) playReedH1(frequency);
  };

  const stopActiveReeds = (frequency: number) => {
    if (reedActivation.L1) stopReedL1(frequency);
    if (reedActivation.M1) stopReedM1(frequency);
    if (reedActivation.M2) stopReedM2(frequency);
    if (reedActivation.M3) stopReedM3(frequency);
    if (reedActivation.H1) stopReedH1(frequency);
  };

  return { playActiveReeds, stopActiveReeds };
};
