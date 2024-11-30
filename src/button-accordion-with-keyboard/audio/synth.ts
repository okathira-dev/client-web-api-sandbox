import * as Tone from "tone";

// コンテキストの設定
Tone.setContext(
  new Tone.Context({
    latencyHint: "interactive",
    lookAhead: 0,
    updateInterval: 0.01,
  }),
);
console.log("Tone context", Tone.getContext());

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

const partialsQuantity = 64;
const sawtoothPartials = getSawtoothPartials(partialsQuantity);
const squarePartials = getSquarePartials(partialsQuantity);
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

// リードの定義
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

// 全体設定
export const initReeds = () => {
  void Tone.start().then(() => {
    console.log("Tone started");
  });
};

// 音量を一律で設定する関数
export const setAllReedVolumes = (volume: number) => {
  Object.values(reeds).forEach((reed) => {
    reed.set({ volume });
  });
};
