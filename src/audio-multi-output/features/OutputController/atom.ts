import { atom, useAtomValue, useSetAtom } from "jotai";

// 各デバイスの音声コンテキスト管理
const audioContextsAtom = atom<Record<string, AudioContext>>({});

// 各デバイスのオシレーター管理
const oscillatorsAtom = atom<Record<string, OscillatorNode>>({});

// 各デバイスのゲインノード管理
const gainNodesAtom = atom<Record<string, GainNode>>({});

// カスタムフックで提供
export const useAudioContextsValue = () => useAtomValue(audioContextsAtom);
export const useSetAudioContexts = () => useSetAtom(audioContextsAtom);

export const useOscillatorsValue = () => useAtomValue(oscillatorsAtom);
export const useSetOscillators = () => useSetAtom(oscillatorsAtom);

export const useGainNodesValue = () => useAtomValue(gainNodesAtom);
export const useSetGainNodes = () => useSetAtom(gainNodesAtom);
