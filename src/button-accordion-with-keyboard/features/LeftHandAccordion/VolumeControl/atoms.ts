import { atom, useAtomValue, useSetAtom } from "jotai";

import { setVolume } from "../audio/audioProcessor";

const INITIAL_VOLUME = -20;

// 音量の値
const volumeSourceAtom = atom<number>(INITIAL_VOLUME);

// 初期値を設定
setVolume(INITIAL_VOLUME);

// 音量の値を変更する際に、実際に音量を変更するatom.
const volumeAtom = atom(
  (get) => {
    return get(volumeSourceAtom);
  },
  (_get, set, newValue: number) => {
    set(volumeSourceAtom, newValue);
    setVolume(newValue); // 実際に音量を変更する
  },
);

export const useSetVolume = () => {
  return useSetAtom(volumeAtom);
};
export const useVolumeValue = () => {
  return useAtomValue(volumeAtom);
};
