import * as Tone from "tone";

// コンテキストの初期化
Tone.setContext(
  new Tone.Context({
    latencyHint: "interactive",
    lookAhead: 0,
    updateInterval: 0.01,
  }),
);

export const startAudioContext = () => {
  return Tone.start();
};

// 波形生成の共通関数
const calculateSawtoothPartial = (index: number) => {
  return index % 2 === 0 ? 1 / (index + 1) : -1 / (index + 1);
};

const calculateSquarePartial = (index: number) => {
  return index % 2 === 0 ? 1 / (index + 1) : 0;
};

const getSawtoothPartials = (partialCount: number) =>
  Array.from({ length: partialCount }, (_, index) =>
    calculateSawtoothPartial(index),
  );

const getSquarePartials = (partialCount: number) =>
  Array.from({ length: partialCount }, (_, index) =>
    calculateSquarePartial(index),
  );

// 波形の生成
export const createWaveform = (partialCount: number = 64) => {
  const sawtoothPartials = getSawtoothPartials(partialCount);
  const squarePartials = getSquarePartials(partialCount);
  return sawtoothPartials.map(
    (value, index) => value - (squarePartials[index] ?? 0) / 2,
  );
};

// 共通のPolySynth設定
export const createPolySynth = () =>
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
      partials: createWaveform(),
    },
  }).toDestination();
