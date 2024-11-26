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
      attack: 0.0001,
      decay: 0.1,
      sustain: 0.95,
      release: 0.25,
    },
    oscillator: {
      type: "custom",
      partials: combinedPartials,
    },
  }).toDestination();

// TODO: リード音源をatomで管理する必要があるか確認する
// リード音源をatomで管理する
// 一旦コピペ

// L1
const reedL1Atom = atom<Tone.PolySynth | null>(createPolySynth());
export const useReedL1 = () => useAtomValue(reedL1Atom);
export const useSetReedL1 = () => useSetAtom(reedL1Atom);
export const useSetReedL1Volume = () => {
  const reedL1 = useReedL1();
  const setReedL1Volume = (volume: number) => {
    reedL1?.set({ volume });
  };

  return setReedL1Volume;
};
export const useSetReedL1Pitch = () => {
  const reedL1 = useReedL1();
  const setReedL1Pitch = (detune: number) => {
    reedL1?.set({ detune });
  };

  return setReedL1Pitch;
};
export const usePlayReedL1 = () => {
  const reedL1 = useReedL1();
  const playReedL1 = (frequency: number) => {
    if (!isReady) {
      void Tone.start().then(() => {
        console.log("Tone is ready");
      });
      isReady = true;
    }

    reedL1?.triggerAttack(frequency);
  };
  const stopReedL1 = (frequency: number) => {
    reedL1?.triggerRelease(frequency);
  };

  return { playReedL1, stopReedL1 };
};

// M1
const reedM1Atom = atom<Tone.PolySynth | null>(createPolySynth());
export const useReedM1 = () => useAtomValue(reedM1Atom);
export const useSetReedM1 = () => useSetAtom(reedM1Atom);
export const useSetReedM1Volume = () => {
  const reedM1 = useReedM1();
  const setReedM1Volume = (volume: number) => {
    reedM1?.set({ volume });
  };

  return setReedM1Volume;
};
export const useSetReedM1Pitch = () => {
  const reedM1 = useReedM1();
  const setReedM1Pitch = (detune: number) => {
    reedM1?.set({ detune });
  };

  return setReedM1Pitch;
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

// M2
const reedM2Atom = atom<Tone.PolySynth | null>(createPolySynth());
export const useReedM2 = () => useAtomValue(reedM2Atom);
export const useSetReedM2 = () => useSetAtom(reedM2Atom);
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

// M3
const reedM3Atom = atom<Tone.PolySynth | null>(createPolySynth());
export const useReedM3 = () => useAtomValue(reedM3Atom);
export const useSetReedM3 = () => useSetAtom(reedM3Atom);
export const useSetReedM3Volume = () => {
  const reedM3 = useReedM3();
  const setReedM3Volume = (volume: number) => {
    reedM3?.set({ volume });
  };

  return setReedM3Volume;
};
export const useSetReedM3Pitch = () => {
  const reedM3 = useReedM3();
  const setReedM3Pitch = (detune: number) => {
    reedM3?.set({ detune });
  };

  return setReedM3Pitch;
};
export const usePlayReedM3 = () => {
  const reedM3 = useReedM3();
  const playReedM3 = (frequency: number) => {
    if (!isReady) {
      void Tone.start().then(() => {
        console.log("Tone is ready");
      });
      isReady = true;
    }

    reedM3?.triggerAttack(frequency);
  };
  const stopReedM3 = (frequency: number) => {
    reedM3?.triggerRelease(frequency);
  };

  return { playReedM3, stopReedM3 };
};

// H1
const reedH1Atom = atom<Tone.PolySynth | null>(createPolySynth());
export const useReedH1 = () => useAtomValue(reedH1Atom);
export const useSetReedH1 = () => useSetAtom(reedH1Atom);
export const useSetReedH1Volume = () => {
  const reedH1 = useReedH1();
  const setReedH1Volume = (volume: number) => {
    reedH1?.set({ volume });
  };

  return setReedH1Volume;
};
export const useSetReedH1Pitch = () => {
  const reedH1 = useReedH1();
  const setReedH1Pitch = (detune: number) => {
    reedH1?.set({ detune });
  };

  return setReedH1Pitch;
};
export const usePlayReedH1 = () => {
  const reedH1 = useReedH1();
  const playReedH1 = (frequency: number) => {
    if (!isReady) {
      void Tone.start().then(() => {
        console.log("Tone is ready");
      });
      isReady = true;
    }

    reedH1?.triggerAttack(frequency);
  };
  const stopReedH1 = (frequency: number) => {
    reedH1?.triggerRelease(frequency);
  };

  return { playReedH1, stopReedH1 };
};
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
  const setReedL1Volume = useSetReedL1Volume();
  const setReedM1Volume = useSetReedM1Volume();
  const setReedM2Volume = useSetReedM2Volume();
  const setReedM3Volume = useSetReedM3Volume();
  const setReedH1Volume = useSetReedH1Volume();

  const adaptAll = () => {
    setReedL1Volume(reedVolume);
    setReedM1Volume(reedVolume);
    setReedM2Volume(reedVolume);
    setReedM3Volume(reedVolume);
    setReedH1Volume(reedVolume);
  };

  return adaptAll;
};

// 12個の音色切り替えスイッチに対応する ReedActivation を定義する
const reedActivationPresets: ReedActivation[] = [
  { L1: true, M1: false, M2: false, M3: false, H1: false },
  { L1: false, M1: true, M2: false, M3: false, H1: false },
  { L1: false, M1: false, M2: true, M3: false, H1: false },
  { L1: false, M1: false, M2: false, M3: true, H1: false },
  { L1: false, M1: false, M2: false, M3: false, H1: true },
  { L1: true, M1: true, M2: false, M3: false, H1: false },
  { L1: false, M1: true, M2: true, M3: false, H1: false },
  { L1: false, M1: false, M2: true, M3: true, H1: false },
  { L1: false, M1: false, M2: false, M3: true, H1: true },
  { L1: true, M1: false, M2: false, M3: false, H1: true },
  { L1: true, M1: true, M2: true, M3: false, H1: false },
  { L1: false, M1: true, M2: true, M3: true, H1: true },
];

const selectedPresetAtom = atom<number>(0);
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

const reedActivationAtom = atom<ReedActivation>({
  L1: false,
  M1: false,
  M2: true,
  M3: false,
  H1: false,
});

export const useReedActivation = () => useAtomValue(reedActivationAtom);
export const useSetReedActivation = () => useSetAtom(reedActivationAtom);

// どのリードが有効になっているかを管理する atom
export const reedNames = ["L1", "M1", "M2", "M3", "H1"] as const;
export type Reed = (typeof reedNames)[number];
type ReedActivation = Record<Reed, boolean>;

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
  const { playReedL1, stopReedL1 } = usePlayReedL1();
  const { playReedM1, stopReedM1 } = usePlayReedM1();
  const { playReedM2, stopReedM2 } = usePlayReedM2();
  const { playReedM3, stopReedM3 } = usePlayReedM3();
  const { playReedH1, stopReedH1 } = usePlayReedH1();

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
