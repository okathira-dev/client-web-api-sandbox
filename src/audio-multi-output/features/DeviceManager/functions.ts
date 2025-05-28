import { DEVICE_TYPES, DEFAULT_DEVICE_ID } from "./consts";
import { DEFAULT_DEVICE_LABEL, ERROR_MESSAGES } from "../../consts/audioConsts";

import type { AudioOutputDevice } from "./consts";

// 音声出力デバイス一覧を取得
export const enumerateAudioDevices = async (): Promise<AudioOutputDevice[]> => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      throw new Error(ERROR_MESSAGES.DEVICE_ENUMERATION_FAILED);
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioOutputDevices = devices
      .filter((device) => device.kind === DEVICE_TYPES.AUDIO_OUTPUT)
      .map((device) => ({
        deviceId: device.deviceId || DEFAULT_DEVICE_ID,
        label: device.label || DEFAULT_DEVICE_LABEL,
      }));

    // デフォルトデバイスが含まれていない場合は追加
    if (
      !audioOutputDevices.some(
        (device) => device.deviceId === DEFAULT_DEVICE_ID,
      )
    ) {
      audioOutputDevices.unshift({
        deviceId: DEFAULT_DEVICE_ID,
        label: DEFAULT_DEVICE_LABEL,
      });
    }

    return audioOutputDevices;
  } catch (error) {
    console.error("デバイス取得エラー:", error);
    throw new Error(ERROR_MESSAGES.DEVICE_ENUMERATION_FAILED);
  }
};

// デバイス変更の監視を開始
export const startDeviceChangeMonitoring = (
  onDeviceChange: () => void,
): (() => void) => {
  if (!navigator.mediaDevices) {
    return () => {};
  }

  navigator.mediaDevices.addEventListener("devicechange", onDeviceChange);

  // クリーンアップ関数を返す
  return () => {
    navigator.mediaDevices.removeEventListener("devicechange", onDeviceChange);
  };
};

// 音声出力デバイスの選択権限を要求
export const requestAudioOutputPermission = async (): Promise<boolean> => {
  try {
    // MediaDevices APIが利用可能かチェック
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn("MediaDevices APIが利用できません");
      return false;
    }

    // マイクへのアクセス権限を要求してデバイス列挙の権限を取得
    // これによりenumerateDevices()でデバイスのラベルが取得可能になる
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // ストリームを即座に停止（権限取得が目的のため）
    stream.getTracks().forEach((track) => track.stop());

    return true;
  } catch (error) {
    console.error("音声デバイスアクセス権限の要求に失敗:", error);
    return false;
  }
};
