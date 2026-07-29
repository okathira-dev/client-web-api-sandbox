/** Sustained test のライブ入力取得。通常の録画ファイルは一切作らない。 */

import type { LiveSourceInfo } from "../../domain/types";

export type AcquiredLiveCapture = {
  readonly readable: ReadableStream<VideoFrame>;
  readonly info: LiveSourceInfo;
  /** 検査終了後にキャプチャを止める。呼び忘れるとタブ共有バーが残る。 */
  readonly stop: () => void;
};

/**
 * 画面・タブのキャプチャを取得し、VideoFrame のストリームへ変換する。
 * ここで得たフレームはエンコード検査にだけ使い、保存も送信もしない。
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
    audio: false,
  });
  const stop = () => {
    for (const track of stream.getTracks()) track.stop();
  };

  try {
    const track = stream.getVideoTracks()[0];
    if (!track) throw new Error("live-capture-video-track-unavailable");

    const settings = track.getSettings();
    const processor = new MediaStreamTrackProcessor({ track });
    return {
      readable: processor.readable,
      info: {
        width: settings.width ?? null,
        height: settings.height ?? null,
        frameRate: settings.frameRate ?? null,
        displaySurface: settings.displaySurface ?? null,
      },
      stop,
    };
  } catch (error) {
    stop();
    throw error;
  }
};
