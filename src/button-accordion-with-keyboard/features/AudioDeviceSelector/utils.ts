/**
 * メディアデバイスの一覧を取得し、利用可能な音声出力デバイスを返す
 * @throws {Error} 出力デバイスが見つからない場合、または権限が拒否された場合
 */
export async function initializeAudioDevices() {
  try {
    // メディアデバイスへのアクセス権限を要求
    const stream = await navigator.mediaDevices
      .getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
      .catch((error: unknown) => {
        if (error instanceof Error) {
          throw new Error(`マイクへのアクセスが拒否されました: ${error.name}`);
        }
        throw error;
      });

    // すぐにストリームを停止
    stream.getTracks().forEach((track) => track.stop());

    // メディアデバイスの一覧を取得
    const devices = await navigator.mediaDevices
      .enumerateDevices()
      .catch((error: unknown) => {
        if (error instanceof Error) {
          throw new Error(`デバイス一覧の取得に失敗しました: ${error.message}`);
        }
        throw error;
      });

    const audioOutputDevices = devices.filter(
      (device) => device.kind === "audiooutput",
    );

    if (audioOutputDevices.length === 0) {
      throw new Error("出力デバイスが見つかりませんでした");
    }

    return audioOutputDevices;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("予期せぬエラーが発生しました");
  }
}
