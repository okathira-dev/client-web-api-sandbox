/** Sustained test のライブ入力取得。通常の録画ファイルは一切作らない。 */

import type { LiveAudioInfo, LiveSourceInfo } from "../../domain/types";

export type AcquiredLiveCapture = {
  readonly video: ReadableStream<VideoFrame>;
  /** 音声を共有しなかった場合は null。 */
  readonly audio: ReadableStream<AudioData> | null;
  readonly info: LiveSourceInfo;
  /** 検査終了後にキャプチャを止める。呼び忘れるとタブ共有バーが残る。 */
  readonly stop: () => void;
};

/**
 * 画面共有の音声制約。
 *
 * エコーキャンセルなどの音声処理を通す実装では、処理系がモノラル前提のために
 * トラックが 1ch へ落ちてくることがある。音声候補の検査ではチャンネル数そのものが
 * 検査対象なので、処理はすべて切って素のまま受け取る。
 *
 * これで必ず 2ch になるわけではない（共有元が本当にモノラルのこともある）。
 * 実際に何 ch で取れたかは `getSettings()` で確かめ、結果へ残す。
 */
const AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: false,
  noiseSuppression: false,
  autoGainControl: false,
  channelCount: 2,
  sampleRate: 48_000,
};

const readAudioInfo = (track: MediaStreamTrack): LiveAudioInfo => {
  const settings = track.getSettings();
  return {
    channelCount: settings.channelCount ?? null,
    sampleRate: settings.sampleRate ?? null,
  };
};

/**
 * 画面・タブのキャプチャを取得し、WebCodecs が読めるストリームへ変換する。
 * ここで得たフレームとサンプルはエンコード検査にだけ使い、保存も送信もしない。
 */
export const acquireLiveCapture = async (): Promise<AcquiredLiveCapture> => {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    throw new Error("display-capture-unavailable");
  }
  if (typeof MediaStreamTrackProcessor === "undefined") {
    throw new Error("media-stream-track-processor-unavailable");
  }

  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: { frameRate: { ideal: 60 } },
    audio: AUDIO_CONSTRAINTS,
  });
  const stop = () => {
    for (const track of stream.getTracks()) track.stop();
  };

  try {
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) throw new Error("live-capture-video-track-unavailable");

    // 音声の共有は利用者が選ぶもの。無くてもここでは失敗させない。
    const audioTrack = stream.getAudioTracks()[0] ?? null;
    const settings = videoTrack.getSettings();

    return {
      video: new MediaStreamTrackProcessor({ track: videoTrack }).readable,
      audio: audioTrack
        ? new MediaStreamTrackProcessor({ track: audioTrack }).readable
        : null,
      info: {
        width: settings.width ?? null,
        height: settings.height ?? null,
        frameRate: settings.frameRate ?? null,
        displaySurface: settings.displaySurface ?? null,
        audio: audioTrack ? readAudioInfo(audioTrack) : null,
      },
      stop,
    };
  } catch (error) {
    stop();
    throw error;
  }
};
