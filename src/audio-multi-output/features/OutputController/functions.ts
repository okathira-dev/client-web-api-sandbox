import { ERROR_MESSAGES } from "../../consts/audioConsts";
import { isValidDeviceId } from "../../utils/audioUtils";

import type { OscillatorSettings } from "../OscillatorControl";

// AudioContext.setSinkIdの型定義（実験的機能のため）
interface AudioContextWithSinkId extends AudioContext {
  setSinkId?: (sinkId: string | { type: "none" }) => Promise<void>;
}

// 音声出力の作成
export const createAudioOutput = async (
  deviceId: string,
  settings: OscillatorSettings,
): Promise<{
  audioContext: AudioContext;
  oscillator: OscillatorNode;
  gainNode: GainNode;
}> => {
  if (!isValidDeviceId(deviceId)) {
    throw new Error("無効なデバイスIDです");
  }

  try {
    // AudioContextの作成
    const audioContext = new window.AudioContext() as AudioContextWithSinkId;

    // AudioContext.setSinkIdが利用可能な場合は設定
    if (audioContext.setSinkId && deviceId !== "default") {
      try {
        await audioContext.setSinkId(deviceId);
      } catch (error) {
        console.warn(`デバイス ${deviceId} への出力設定に失敗:`, error);
      }
    }

    // オシレーターノードの作成
    const oscillator = audioContext.createOscillator();
    oscillator.type = settings.waveform;
    oscillator.frequency.setValueAtTime(
      settings.frequency,
      audioContext.currentTime,
    );

    // ゲインノードの作成（音量制御用）
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // 初期音量を低めに設定

    // 位相反転の処理
    if (settings.phaseInvert) {
      gainNode.gain.setValueAtTime(-0.1, audioContext.currentTime);
    }

    // ノードの接続（直接AudioContextのdestinationに接続）
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    return {
      audioContext,
      oscillator,
      gainNode,
    };
  } catch (error) {
    console.error("音声出力の作成に失敗:", error);
    throw new Error(ERROR_MESSAGES.AUDIO_CONTEXT_FAILED);
  }
};

// 音声出力の開始
export const startAudioOutput = async (
  audioContext: AudioContext,
  oscillator: OscillatorNode,
): Promise<void> => {
  try {
    // AudioContextの再開（ユーザー操作が必要）
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    // オシレーターの開始
    oscillator.start();
  } catch (error) {
    console.error("音声出力の開始に失敗:", error);
    throw error;
  }
};

// 音声出力の停止
export const stopAudioOutput = (
  audioContext: AudioContext,
  oscillator: OscillatorNode,
): void => {
  try {
    // オシレーターの停止
    oscillator.stop();

    // AudioContextのクローズ
    void audioContext.close();
  } catch (error) {
    console.error("音声出力の停止に失敗:", error);
  }
};

// オシレーター設定の更新
export const updateOscillatorSettings = (
  oscillator: OscillatorNode,
  gainNode: GainNode,
  settings: OscillatorSettings,
  audioContext: AudioContext,
): void => {
  try {
    const currentTime = audioContext.currentTime;

    // 周波数の更新
    oscillator.frequency.setValueAtTime(settings.frequency, currentTime);

    // 位相反転の更新
    const volume = settings.phaseInvert ? -0.1 : 0.1;
    gainNode.gain.setValueAtTime(volume, currentTime);
  } catch (error) {
    console.error("オシレーター設定の更新に失敗:", error);
  }
};
