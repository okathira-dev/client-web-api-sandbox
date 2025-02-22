import { atom, useAtomValue, useSetAtom } from "jotai";

const audioDeviceErrorAtom = atom<string | null>(null);
export const useAudioDeviceError = () => useAtomValue(audioDeviceErrorAtom);
export const useSetAudioDeviceError = () => useSetAtom(audioDeviceErrorAtom);

const audioDevicesAtom = atom<MediaDeviceInfo[]>([]);
export const useAudioDevices = () => useAtomValue(audioDevicesAtom);
export const useSetAudioDevices = () => useSetAtom(audioDevicesAtom);
