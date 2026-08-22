import { useCallback, useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s430Locale } from "./S-430.locale";

const recoverySource = new URL(
  "../fixtures/media/assets/multi-audio.mp4",
  import.meta.url,
).href;

type AudioSessionLike = EventTarget & {
  state?: string;
  type?: string;
};

/**
 * S-430 — ページ外の音声制御
 *
 * 目的: ページ内の再生／停止ボタンではなく、OS・ブラウザが所有する音声制御と音声フォーカス復帰を使う。
 * 最初の一手: B01は「音を始める」を押してから、ブラウザのメディアUI、メディアキー、ヘッドセット等で停止する。B02は「復帰を待つ音を始める」を押し、端末側で別の音を鳴らしてから元の音へ戻す。
 * 箱ごとの解法: B01は登録済みMedia Sessionの実pause actionが届いた時だけ開く。B02はAudio Sessionが同一試行でinterruptedを経てactiveへ戻り、対象audioの実playingイベントで再生復帰を確認した時だけ開く。
 * 開かない操作: ページ内のaudio controls、通常のpauseイベント、scriptからの停止、visibility変化、Media SessionのB01停止、inactiveだけ、合成statechangeではB02を開かない。
 * 使用API: Media Session、Web Audio、HTMLAudioElement、対応環境のAudio Session API。
 * 権限・privacy: 権限は要求せず、生成音とGit管理済み音声を再生するだけで、音声入力・端末名・interruption sourceを保存／送信しない。
 * cleanup: 離脱時にoscillatorとmedia elementを停止し、Media Session handlerとAudio Session listenerを外し、Audio Session typeをautoへ戻す。
 * 対応環境: B01はMedia SessionとAudioContext、B02はAudio Sessionを実装したOS／browserでのみ観測できる。B02非対応はB01を妨げない。
 * 人手確認: H-003/H-004/H-019/H-020/H-022/H-023/H-025/H-039/H-052で、外部pause、実interruption、復帰、取消、離脱を確認する。
 */
export default function S430Stage(props: StageComponentProps) {
  const pause = props.problem("S-430-B01");
  const recovery = props.problem("S-430-B02");
  const context = useRef<AudioContext | null>(null);
  const oscillator = useRef<OscillatorNode | null>(null);
  const recoveryAudio = useRef<HTMLAudioElement>(null);
  const interrupted = useRef(false);
  const [status, setStatus] = useState<
    "idle" | "paused" | "playing" | "waiting" | "unsupported"
  >("idle");
  const session = (
    navigator as Navigator & {
      audioSession?: AudioSessionLike;
    }
  ).audioSession;

  const stopGeneratedSound = useCallback(() => {
    try {
      oscillator.current?.stop();
    } catch {}
    oscillator.current = null;
    void context.current?.close();
    context.current = null;
  }, []);

  const startPauseSound = async () => {
    stopGeneratedSound();
    const audio = new AudioContext();
    const tone = audio.createOscillator();
    const gain = audio.createGain();
    gain.gain.value = 0.035;
    tone.connect(gain).connect(audio.destination);
    tone.start();
    context.current = audio;
    oscillator.current = tone;
    setStatus("playing");
    navigator.mediaSession.metadata = new MediaMetadata({
      title: "Busybox",
      artist: stageText(props.locale, s430Locale.outsideControl),
    });
    navigator.mediaSession.playbackState = "playing";
    navigator.mediaSession.setActionHandler("pause", () => {
      stopGeneratedSound();
      navigator.mediaSession.playbackState = "paused";
      setStatus("paused");
      pause.solve(["media-session:pause-handler"]);
    });
  };

  const startRecoverySound = async () => {
    const audio = recoveryAudio.current;
    if (!session || !audio) {
      setStatus("unsupported");
      return;
    }
    interrupted.current = false;
    session.type = "playback";
    try {
      await audio.play();
      setStatus("waiting");
    } catch {
      setStatus("idle");
    }
  };

  useEffect(() => {
    const onSessionStateChange = () => {
      if (session?.state === "interrupted") interrupted.current = true;
    };
    const onRecoveryPlaying = () => {
      if (interrupted.current && session?.state === "active") {
        recovery.solve(["audio-session:interrupted-active-playing"]);
      }
    };
    session?.addEventListener("statechange", onSessionStateChange);
    const audio = recoveryAudio.current;
    audio?.addEventListener("playing", onRecoveryPlaying);
    const cleanup = () => {
      stopGeneratedSound();
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.playbackState = "none";
      session?.removeEventListener("statechange", onSessionStateChange);
      if (session) session.type = "auto";
      audio?.pause();
      if (audio) audio.currentTime = 0;
      audio?.removeEventListener("playing", onRecoveryPlaying);
    };
    props.signal.addEventListener("abort", cleanup, { once: true });
    return () => {
      props.signal.removeEventListener("abort", cleanup);
      cleanup();
    };
  }, [props.signal, recovery.solve, stopGeneratedSound]);

  const statusText =
    status === "paused"
      ? s430Locale.pausedOutside
      : status === "playing"
        ? s430Locale.playing
        : status === "waiting"
          ? s430Locale.waitingForInterruption
          : status === "unsupported"
            ? s430Locale.audioSessionUnsupported
            : s430Locale.idle;

  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        <ProblemGiftBox problem={pause} locale={props.locale} />
        <ProblemGiftBox problem={recovery} locale={props.locale} />
      </div>
      <button
        type="button"
        className="stage-action"
        onClick={() => void startPauseSound()}
      >
        {stageText(props.locale, s430Locale.startSound)}
      </button>
      <button
        type="button"
        className="stage-action"
        onClick={() => void startRecoverySound()}
      >
        {stageText(props.locale, s430Locale.startRecovery)}
      </button>
      <audio
        ref={recoveryAudio}
        src={recoverySource}
        controls
        preload="metadata"
      >
        <track
          kind="captions"
          src={
            new URL(
              "../fixtures/media/assets/captions-busy.vtt",
              import.meta.url,
            ).href
          }
          srcLang="en"
          label="Busybox"
        />
      </audio>
      <p role="status">{stageText(props.locale, statusText)}</p>
    </div>
  );
}
