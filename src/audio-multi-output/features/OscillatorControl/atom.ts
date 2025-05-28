import { atom, useAtomValue, useSetAtom } from "jotai";

import type { OscillatorSettings } from "./consts";

// オシレーター設定の状態（デバイスIDをキーとする）
const oscillatorSettingsAtom = atom<Record<string, OscillatorSettings>>({});

// カスタムフックで提供
export const useOscillatorSettingsValue = () =>
  useAtomValue(oscillatorSettingsAtom);
export const useSetOscillatorSettings = () =>
  useSetAtom(oscillatorSettingsAtom);
