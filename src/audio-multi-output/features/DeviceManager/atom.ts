import { atom, useAtomValue, useSetAtom } from "jotai";

import type { AudioOutputDevice } from "./consts";

// デバイス一覧の状態
const deviceListAtom = atom<AudioOutputDevice[]>([]);

// 選択されたデバイスIDの状態
const selectedDevicesAtom = atom<string[]>([]);

// カスタムフックで提供
export const useDeviceListValue = () => useAtomValue(deviceListAtom);
export const useSetDeviceList = () => useSetAtom(deviceListAtom);
export const useSelectedDevicesValue = () => useAtomValue(selectedDevicesAtom);
export const useSetSelectedDevices = () => useSetAtom(selectedDevicesAtom);
