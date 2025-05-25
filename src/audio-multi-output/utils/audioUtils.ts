// 周波数の範囲チェック
export const isValidFrequency = (frequency: number): boolean => {
  return frequency >= 20 && frequency <= 20000;
};

// デバイスIDの検証
export const isValidDeviceId = (deviceId: string): boolean => {
  return typeof deviceId === "string" && deviceId.length > 0;
};

// AudioContextの状態チェック
export const isAudioContextReady = (context: AudioContext): boolean => {
  return context.state === "running";
};

// ブラウザサポートチェック
export const checkBrowserSupport = (): {
  webAudio: boolean;
  audioOutput: boolean;
  mediaDevices: boolean;
} => {
  // AudioContext.setSinkIdのサポートチェック
  const audioOutputSupported = (() => {
    try {
      const testContext = new AudioContext();
      const supported = "setSinkId" in testContext;
      void testContext.close();
      return supported;
    } catch {
      return false;
    }
  })();

  return {
    webAudio: "AudioContext" in window || "webkitAudioContext" in window,
    audioOutput: audioOutputSupported,
    mediaDevices:
      "mediaDevices" in navigator &&
      "enumerateDevices" in navigator.mediaDevices,
  };
};
