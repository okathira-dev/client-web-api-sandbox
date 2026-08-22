import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { activeS910CueId, type S910CueId, s910Cues } from "./S-910.functions";
import { s910Locale } from "./S-910.locale";

const videoUrl = new URL(
  "../fixtures/s910/assets/caption-stage.webm",
  import.meta.url,
).href;
const emptyCaptionsUrl = new URL(
  "../fixtures/s910/assets/empty.vtt",
  import.meta.url,
).href;

const cueTextKeys: Record<
  S910CueId,
  "redCircle" | "blueTriangle" | "yellowSquare"
> = {
  circle: "redCircle",
  triangle: "blueTriangle",
  square: "yellowSquare",
};

/**
 * S-910 — 再生中のvideoへruntime TextTrackとVTTCueを加え、実activeCuesが対応時刻に重なることを観測する。
 * 目的: 既存VTT fileのtrack切替ではなく、playerの操作でその瞬間のWebVTT cueをvideoへ生み出す体験にする。
 * 最初の一手: native videoを再生し、画面上に赤い円・青い三角・黄色い四角が現れるそれぞれの時間に、同じ字幕buttonを押す。
 * 箱ごとの解法: B01はcircle / triangle / squareの3 cueを正しい出現区間へ追加する。`video.addTextTrack()`と`new VTTCue()`へ追加したcueの実`cuechange`で`activeCues`に対応textが現れた時だけ、3つ揃って開く。
 * 開かない操作: 字幕buttonを動画停止中に押す、違う記号の時に押す、static VTT asset、画面上の文字だけ、synthetic cuechange、video時間をDOMで偽装する操作では開かない。
 * 使用API: HTMLVideoElement、TextTrack、WebVTT `VTTCue`、`addCue`、`cuechange`、`activeCues`。3記号はFFmpeg生成済みの固定WebMそのものへ焼き込む。
 * 権限・privacy: 権限・保存・送信は使わない。作成したcueと達成状態は訪問中memoryだけである。
 * cleanup: stage離脱・作り直し時にtrackのcueをremoveし、cuechange listenerを解除し、videoをpauseする。
 * 対応環境: native videoとruntime TextTrack / VTTCueを提供するbrowser。WebVTT parserや字幕libraryのfallbackは使わない。
 * 人手確認: H-065で3正解、停止中・誤記号の負例、cuechange / activeCues、reset、re-entry cleanupを確認する。
 */
export default function S910Stage(props: StageComponentProps) {
  const problem = props.problem("S-910-B01");
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<TextTrack | null>(null);
  const cueRefs = useRef<VTTCue[]>([]);
  const matchedRef = useRef<Set<S910CueId>>(new Set());
  const [status, setStatus] = useState<"waiting" | "added" | "complete">(
    "waiting",
  );
  const [revision, setRevision] = useState(0);
  const supported = "VTTCue" in window;

  useEffect(() => {
    void revision;
    const video = videoRef.current;
    if (!video || !supported) return;
    const track = video.addTextTrack("captions", "Busybox live captions", "en");
    track.mode = "showing";
    trackRef.current = track;
    const inspect = () => {
      const activeCues = Array.from(track.activeCues ?? []);
      for (const cue of activeCues) {
        const cueId = s910Cues.find(
          (expected) => (cue as VTTCue).id === expected.id,
        )?.id;
        const current = activeS910CueId(video.currentTime);
        if (cueId && cueId === current) matchedRef.current.add(cueId);
      }
      if (matchedRef.current.size === s910Cues.length) {
        problem.solve(["webvtt:runtime-cues-overlapped"]);
        setStatus("complete");
      }
    };
    track.addEventListener("cuechange", inspect);
    return () => {
      track.removeEventListener("cuechange", inspect);
      for (const cue of cueRefs.current) track.removeCue(cue);
      track.mode = "disabled";
      cueRefs.current = [];
      trackRef.current = null;
      video.pause();
    };
  }, [problem.solve, revision, supported]);

  const addCaption = (id: S910CueId) => {
    const video = videoRef.current;
    const track = trackRef.current;
    if (!video || !track || !supported || video.paused) return;
    const cue = new VTTCue(
      video.currentTime,
      Math.min(video.duration, video.currentTime + 0.45),
      stageText(props.locale, s910Locale[cueTextKeys[id]]),
    );
    cue.id = id;
    cueRefs.current.push(cue);
    track.addCue(cue);
    setStatus("added");
  };

  const reset = () => {
    matchedRef.current.clear();
    setStatus("waiting");
    setRevision((current) => current + 1);
  };

  return (
    <div className="puzzle s910-stage">
      <div className="problem-row">
        <ProblemGiftBox problem={problem} locale={props.locale} />
      </div>
      <p>{stageText(props.locale, s910Locale.intro)}</p>
      <div className="s910-player">
        <video ref={videoRef} className="s910-video" controls src={videoUrl}>
          <track
            kind="captions"
            src={emptyCaptionsUrl}
            srcLang="en"
            label="Runtime captions"
          />
        </video>
      </div>
      <div className="s910-captions">
        {s910Cues.map((cue) => (
          <button
            type="button"
            key={cue.id}
            disabled={!supported}
            onClick={() => addCaption(cue.id)}
          >
            {stageText(props.locale, s910Locale[cueTextKeys[cue.id]])}
          </button>
        ))}
      </div>
      <button type="button" onClick={reset}>
        {stageText(props.locale, s910Locale.reset)}
      </button>
      <output className="interaction-status" aria-live="polite">
        {!supported
          ? stageText(props.locale, s910Locale.unsupported)
          : stageText(props.locale, s910Locale[status])}
      </output>
    </div>
  );
}
