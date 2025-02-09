import { atom, useAtomValue, useSetAtom } from "jotai";
import { createReedHooks } from "../audio/audioProcessor";
import { ReedName } from "../consts";

// 各リードのhooksを生成と名前付け
export const {
  useSetReedPitch: useSetReedL1Pitch,
  usePlayReed: usePlayReedL1,
} = createReedHooks("LOW");

export const {
  useSetReedPitch: useSetReedM1Pitch,
  usePlayReed: usePlayReedM1,
} = createReedHooks("MID_1");

export const {
  useSetReedPitch: useSetReedM2Pitch,
  usePlayReed: usePlayReedM2,
} = createReedHooks("MID_2");

export const {
  useSetReedPitch: useSetReedM3Pitch,
  usePlayReed: usePlayReedM3,
} = createReedHooks("MID_3");

export const {
  useSetReedPitch: useSetReedH1Pitch,
  usePlayReed: usePlayReedH1,
} = createReedHooks("HIGH");

// 12個の音色切り替えスイッチに対応する ReedActivation を定義する
type ReedActivation = Record<ReedName, boolean>;
export const reedActivationPresets: ReedActivation[] = [
  { LOW: true, MID_1: false, MID_2: false, MID_3: false, HIGH: false }, // bassoon
  { LOW: true, MID_1: false, MID_2: true, MID_3: false, HIGH: false }, //  bandoneon
  { LOW: true, MID_1: false, MID_2: true, MID_3: true, HIGH: false }, //   accordion
  { LOW: true, MID_1: false, MID_2: true, MID_3: false, HIGH: true }, //   harmonium
  { LOW: true, MID_1: true, MID_2: false, MID_3: true, HIGH: true }, //    master
  { LOW: false, MID_1: false, MID_2: true, MID_3: false, HIGH: true }, //  oboe
  { LOW: false, MID_1: true, MID_2: true, MID_3: true, HIGH: false }, //   musette
  { LOW: false, MID_1: false, MID_2: true, MID_3: true, HIGH: false }, //  violin
  { LOW: false, MID_1: false, MID_2: true, MID_3: false, HIGH: false }, // clarinet
  { LOW: true, MID_1: false, MID_2: false, MID_3: false, HIGH: true }, //  organ
  { LOW: false, MID_1: true, MID_2: true, MID_3: true, HIGH: true }, //    ???
  { LOW: false, MID_1: false, MID_2: false, MID_3: false, HIGH: true }, // piccolo
];

const INITIAL_SELECTED_PRESET = 2;

// 選択中のプリセット
const selectedPresetAtom = atom<number>(INITIAL_SELECTED_PRESET);
export const useSelectedPreset = () => useAtomValue(selectedPresetAtom);
export const useSetSelectedPreset = () => useSetAtom(selectedPresetAtom);

// プリセットの適用
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

// リードの有効/無効状態
const reedActivationAtom = atom<ReedActivation>(
  reedActivationPresets[INITIAL_SELECTED_PRESET]!, // TODO: get関数を作って型安全にしたい
);
export const useReedActivation = () => useAtomValue(reedActivationAtom);
export const useSetReedActivation = () => useSetAtom(reedActivationAtom);

// リード全体の基準となるピッチ。そのままだとA4=440Hzになる。
export const baseReedPitchAtom = atom<number>(0);
export const useBaseReedPitch = () => useAtomValue(baseReedPitchAtom);
export const useSetBaseReedPitch = () => useSetAtom(baseReedPitchAtom);

// 基準ピッチに対する各リードの相対値
type ReedPitches = Record<ReedName, number>;
const relativeReedPitchesAtom = atom<ReedPitches>({
  LOW: -1195,
  MID_1: -7,
  MID_2: 0,
  MID_3: 11,
  HIGH: 1205,
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
    LOW: base + relative.LOW,
    MID_1: base + relative.MID_1,
    MID_2: base + relative.MID_2,
    MID_3: base + relative.MID_3,
    HIGH: base + relative.HIGH,
  };
});

export const useReedPitches = () => useAtomValue(reedPitchesAtom);

// 全リードのピッチを適用
export const useAdaptAllReedPitches = () => {
  const reedPitches = useReedPitches();
  const setReedL1Pitch = useSetReedL1Pitch();
  const setReedM1Pitch = useSetReedM1Pitch();
  const setReedM2Pitch = useSetReedM2Pitch();
  const setReedM3Pitch = useSetReedM3Pitch();
  const setReedH1Pitch = useSetReedH1Pitch();

  const adaptAll = () => {
    setReedL1Pitch(reedPitches.LOW);
    setReedM1Pitch(reedPitches.MID_1);
    setReedM2Pitch(reedPitches.MID_2);
    setReedM3Pitch(reedPitches.MID_3);
    setReedH1Pitch(reedPitches.HIGH);
  };

  return adaptAll;
};

// プリセットの順序を管理
const presetOrderAtom = atom<number[]>(Array.from({ length: 12 }, (_, i) => i));

export const usePresetAtPosition = (position: number) => {
  const presetOrder = useAtomValue(presetOrderAtom);
  if (
    position >= 0 &&
    position < presetOrder.length &&
    presetOrder[position] !== undefined &&
    presetOrder[position] < reedActivationPresets.length
  ) {
    return reedActivationPresets[presetOrder[position]];
  }
  return reedActivationPresets[0];
};

export const usePresetOrder = () => useAtomValue(presetOrderAtom);
export const useSetPresetOrder = () => useSetAtom(presetOrderAtom);
