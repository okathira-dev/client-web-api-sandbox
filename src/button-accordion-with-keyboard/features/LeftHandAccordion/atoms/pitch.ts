import { atom, useAtomValue, useSetAtom } from "jotai";

import {
  useSetBassReedPitch,
  useSetTenorReedPitch,
  useSetSopranoReedPitch,
  useSetAltoReedPitch,
} from "./reeds";
import { DEFAULT_RELATIVE_REED_PITCHES } from "../consts";

import type { ReedPitches } from "../types";

// リード全体の基準となるピッチ。そのままだとA4=440Hzになる。
const baseReedPitchAtom = atom<number>(0);
export const useBaseReedPitchValue = () => useAtomValue(baseReedPitchAtom);
export const useSetBaseReedPitch = () => useSetAtom(baseReedPitchAtom);

// 基準ピッチに対する各リードの相対値
const relativeReedPitchesAtom = atom<ReedPitches>(
  DEFAULT_RELATIVE_REED_PITCHES,
);
export const useRelativeReedPitchesValue = () =>
  useAtomValue(relativeReedPitchesAtom);
export const useSetRelativeReedPitches = () =>
  useSetAtom(relativeReedPitchesAtom);

// 鳴らすときの各リードのピッチ
const reedPitchesAtom = atom<ReedPitches>((get) => {
  const base = get(baseReedPitchAtom);
  const relative = get(relativeReedPitchesAtom);

  return {
    soprano: base + relative.soprano,
    alto: base + relative.alto,
    tenor: base + relative.tenor,
    bass: base + relative.bass,
  };
});

export const useReedPitchesValue = () => useAtomValue(reedPitchesAtom);

// 全リードのピッチを適用
export const useAdaptAllReedPitches = () => {
  const reedPitches = useReedPitchesValue();
  const setSopranoReedPitch = useSetSopranoReedPitch();
  const setAltoReedPitch = useSetAltoReedPitch();
  const setTenorReedPitch = useSetTenorReedPitch();
  const setBassReedPitch = useSetBassReedPitch();

  const adaptAll = () => {
    setSopranoReedPitch(reedPitches.soprano);
    setAltoReedPitch(reedPitches.alto);
    setTenorReedPitch(reedPitches.tenor);
    setBassReedPitch(reedPitches.bass);
  };

  return adaptAll;
};
