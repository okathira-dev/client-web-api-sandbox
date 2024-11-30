import { atom, useAtomValue, useSetAtom } from "jotai";
import { createReedHooks } from "../audio/synth";
import { ReedName } from "../audio/synth";

// 各リードのhooksを生成と名前付け
export const {
  useSetReedPitch: useSetReedL1Pitch,
  usePlayReed: usePlayReedL1,
} = createReedHooks("L1");

export const {
  useSetReedPitch: useSetReedM1Pitch,
  usePlayReed: usePlayReedM1,
} = createReedHooks("M1");

export const {
  useSetReedPitch: useSetReedM2Pitch,
  usePlayReed: usePlayReedM2,
} = createReedHooks("M2");

export const {
  useSetReedPitch: useSetReedM3Pitch,
  usePlayReed: usePlayReedM3,
} = createReedHooks("M3");

export const {
  useSetReedPitch: useSetReedH1Pitch,
  usePlayReed: usePlayReedH1,
} = createReedHooks("H1");

export type ReedActivation = Record<ReedName, boolean>;

// 12個の音色切り替えスイッチに対応する ReedActivation を定義する
export const reedActivationPresets: ReedActivation[] = [
  { L1: true, M1: false, M2: false, M3: false, H1: false }, // bassoon
  { L1: true, M1: false, M2: true, M3: false, H1: false }, //  bandoneon
  { L1: true, M1: false, M2: true, M3: true, H1: false }, //   accordion
  { L1: true, M1: false, M2: true, M3: false, H1: true }, //   harmonium
  { L1: true, M1: true, M2: false, M3: true, H1: true }, //    master
  { L1: false, M1: false, M2: true, M3: false, H1: true }, //  oboe
  { L1: false, M1: true, M2: true, M3: true, H1: false }, //   musette
  { L1: false, M1: false, M2: true, M3: true, H1: false }, //  violin
  { L1: false, M1: false, M2: true, M3: false, H1: false }, // clarinet
  { L1: true, M1: false, M2: false, M3: false, H1: true }, //  organ
  { L1: false, M1: true, M2: true, M3: true, H1: true }, //    ???
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

const reedActivationAtom = atom<ReedActivation>(
  reedActivationPresets[INITIAL_SELECTED_PRESET]!,
);

export const useReedActivation = () => useAtomValue(reedActivationAtom);
export const useSetReedActivation = () => useSetAtom(reedActivationAtom);

// 各リードのピッチ
type ReedPitches = Record<ReedName, number>;

// リード全体の基準となるピッチ。そのままだとA4=440Hzになる。
const baseReedPitchAtom = atom<number>(0);

// 基準ピッチに対する各リードの相対値
const relativeReedPitchesAtom = atom<ReedPitches>({
  L1: -1195,
  M1: -7,
  M2: 0,
  M3: 11,
  H1: 1205,
});

export const useRelativeReedPitches = () =>
  useAtomValue(relativeReedPitchesAtom);
export const useSetRelativeReedPitches = () =>
  useSetAtom(relativeReedPitchesAtom);

// 鳴らすときの各リードのピッチ
const reedPitchesAtom = atom<ReedPitches>((get) => {
  const base = get(baseReedPitchAtom);
  const relative = get(relativeReedPitchesAtom);

  return {
    L1: base + relative.L1,
    M1: base + relative.M1,
    M2: base + relative.M2,
    M3: base + relative.M3,
    H1: base + relative.H1,
  };
});

export const useReedPitches = () => useAtomValue(reedPitchesAtom);

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
