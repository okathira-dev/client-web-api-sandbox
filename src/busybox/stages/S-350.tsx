import { useEffect, useRef } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s350Locale } from "./S-350.locale";

const mainSource = new URL(
  "../fixtures/media/assets/multi-audio.mp4",
  import.meta.url,
).href;
const captionSources = {
  busy: new URL("../fixtures/media/assets/captions-busy.vtt", import.meta.url)
    .href,
  busybox: new URL(
    "../fixtures/media/assets/captions-busybox.vtt",
    import.meta.url,
  ).href,
  box: new URL("../fixtures/media/assets/captions-box.vtt", import.meta.url)
    .href,
} as const;

/**
 * S-350 — browser標準の動画プレイヤー操作をそのまま解法にする。
 * 目的: game製の再生UIではなく、native controlsのseek、mute、pause、速度、字幕、PiP、fullscreenを観測する。
 * 最初の一手: 音声付き動画を再生し、B01は途中seek、B02はmute/音量0、B03は終了前pause、B04は速度変更を行う。B05は字幕メニューでBusyboxを選び、B06はPiP、B08はfullscreenへ入る。
 * 箱ごとの成功条件: 各操作が実videoイベント・textTrack状態・documentPiP/fullscreen状態として報告された時だけ対応箱が開く。終了後の先頭復帰seekは除外する。
 * 開かない操作: page内の模倣ボタン、ended後の自動seek、scriptによるrate変更／PiP要求、字幕文字列の入力では開かない。
 * API/権限: HTMLMediaElement、TextTrack、Picture-in-Picture、Fullscreen。音声・映像は保存・送信しない。PiP/fullscreenはbrowserの明示操作を要求する。
 * cleanup/環境: videoを停止し、PiP/fullscreenとlistenerを離脱時に解放する。H-001/H-002/H-003/H-012/H-019/H-020/H-023/H-025/H-030/H-052を確認する。
 */
export default function S350Stage(props: StageComponentProps) {
  const seek = props.problem("S-350-B01");
  const mute = props.problem("S-350-B02");
  const pause = props.problem("S-350-B03");
  const rate = props.problem("S-350-B04");
  const captions = props.problem("S-350-B05");
  const pictureInPicture = props.problem("S-350-B06");
  const fullscreen = props.problem("S-350-B08");
  const videoRef = useRef<HTMLVideoElement>(null);
  const playedFrom = useRef<number | null>(null);
  const stableTime = useRef(0);
  const seekOrigin = useRef<number | null>(null);
  const cleaningUp = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleTrackChange = () => {
      const target = Array.from(video.textTracks).find(
        (track) => track.label === "Busybox",
      );
      const otherShowing = Array.from(video.textTracks).some(
        (track) => track !== target && track.mode === "showing",
      );
      if (target?.mode === "showing" && !otherShowing) {
        captions.solve(["text-track:busybox"]);
      }
    };
    video.textTracks.addEventListener("change", handleTrackChange);
    return () =>
      video.textTracks.removeEventListener("change", handleTrackChange);
  }, [captions.solve]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleEnterPictureInPicture = () => {
      pictureInPicture.solve(["picture-in-picture:entered"]);
    };
    video.addEventListener(
      "enterpictureinpicture",
      handleEnterPictureInPicture,
    );
    return () =>
      video.removeEventListener(
        "enterpictureinpicture",
        handleEnterPictureInPicture,
      );
  }, [pictureInPicture.solve]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (document.fullscreenElement === videoRef.current) {
        fullscreen.solve(["fullscreen:video-entered"]);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [fullscreen.solve]);

  useEffect(() => {
    const stop = () => {
      const video = videoRef.current;
      if (!video) return;
      cleaningUp.current = true;
      video.pause();
      if (document.pictureInPictureElement === video) {
        void document.exitPictureInPicture();
      }
      if (document.fullscreenElement === video) {
        void document.exitFullscreen();
      }
    };
    props.signal.addEventListener("abort", stop, { once: true });
    return () => {
      props.signal.removeEventListener("abort", stop);
      stop();
    };
  }, [props.signal]);

  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        <ProblemGiftBox problem={seek} locale={props.locale} />
        <ProblemGiftBox problem={mute} locale={props.locale} />
        <ProblemGiftBox problem={pause} locale={props.locale} />
        <ProblemGiftBox problem={rate} locale={props.locale} />
        <ProblemGiftBox problem={captions} locale={props.locale} />
        <ProblemGiftBox problem={pictureInPicture} locale={props.locale} />
        <ProblemGiftBox problem={fullscreen} locale={props.locale} />
      </div>

      <video
        ref={videoRef}
        className="stage-video"
        src={mainSource}
        controls
        preload="metadata"
        aria-label={stageText(props.locale, s350Locale.videoToOperate)}
        onLoadedMetadata={(event) => {
          stableTime.current = event.currentTarget.currentTime;
        }}
        onTimeUpdate={(event) => {
          if (!event.currentTarget.seeking) {
            stableTime.current = event.currentTarget.currentTime;
          }
        }}
        onSeeking={() => {
          seekOrigin.current ??= stableTime.current;
        }}
        onSeeked={(event) => {
          const video = event.currentTarget;
          const from = seekOrigin.current;
          const to = video.currentTime;
          const replayReset =
            Number.isFinite(video.duration) &&
            from !== null &&
            from >= video.duration - 0.35 &&
            to <= 0.25;
          if (from !== null && Math.abs(to - from) >= 0.5 && !replayReset) {
            seek.solve(["video:meaningful-native-seek"]);
          }
          stableTime.current = to;
          seekOrigin.current = null;
        }}
        onVolumeChange={(event) => {
          const video = event.currentTarget;
          if (video.muted || video.volume === 0) {
            mute.solve([video.muted ? "video:muted" : "video:zero-volume"]);
          }
        }}
        onPlay={(event) => {
          playedFrom.current = event.currentTarget.currentTime;
        }}
        onRateChange={(event) => {
          const playbackRate = event.currentTarget.playbackRate;
          if (playbackRate !== 1) {
            rate.solve([`video:playback-rate:${playbackRate}`]);
          }
        }}
        onPause={(event) => {
          const video = event.currentTarget;
          const from = playedFrom.current;
          const advanced = from !== null && video.currentTime - from >= 0.2;
          if (!cleaningUp.current && !video.ended && advanced) {
            pause.solve(["video:advanced-then-paused"]);
          }
          playedFrom.current = null;
        }}
        onEnded={() => {
          playedFrom.current = null;
        }}
      >
        <track
          kind="captions"
          src={captionSources.busy}
          srcLang="qaa"
          label="Busy"
          default
        />
        <track
          kind="captions"
          src={captionSources.busybox}
          srcLang="qab"
          label="Busybox"
        />
        <track
          kind="captions"
          src={captionSources.box}
          srcLang="qac"
          label="Box"
        />
      </video>
    </div>
  );
}
