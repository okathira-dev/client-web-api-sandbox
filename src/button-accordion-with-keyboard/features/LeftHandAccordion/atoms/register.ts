import { atom, useAtomValue, useSetAtom } from "jotai";

import {
  DEFAULT_STRADELLA_REGISTER,
  STRADELLA_REGISTER_PRESETS,
} from "../consts";

import type { StradellaRegisterName, StradellaReedStates } from "../types";

// 現在選択中のレジスタープリセット
const stradellaRegisterAtom = atom<StradellaRegisterName>(
  DEFAULT_STRADELLA_REGISTER,
);
export const useStradellaRegisterValue = () =>
  useAtomValue(stradellaRegisterAtom);
export const useSetStradellaRegister = () => useSetAtom(stradellaRegisterAtom);

// ストラデラベースのリードの有効/無効状態のatom
const stradellaReedStatesAtom = atom<StradellaReedStates>(
  STRADELLA_REGISTER_PRESETS[DEFAULT_STRADELLA_REGISTER],
);
export const useStradellaReedStatesValue = () =>
  useAtomValue(stradellaReedStatesAtom);
export const useSetStradellaReedStates = () =>
  useSetAtom(stradellaReedStatesAtom);

// プリセットの適用
export const useAdoptStradellaRegister = () => {
  const setStradellaReedStates = useSetStradellaReedStates();

  const adoptStradellaRegister = (
    stradellaRegisterName: StradellaRegisterName,
  ) => {
    const stradellaReedStates =
      STRADELLA_REGISTER_PRESETS[stradellaRegisterName];
    setStradellaReedStates(stradellaReedStates);
  };

  return adoptStradellaRegister;
};
