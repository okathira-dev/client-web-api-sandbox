import { atom, useAtomValue, useSetAtom } from "jotai";

// グローバル再生状態
const isPlayingAtom = atom(false);

// カスタムフックで提供
export const useIsPlayingValue = () => useAtomValue(isPlayingAtom);
export const useSetIsPlaying = () => useSetAtom(isPlayingAtom);
