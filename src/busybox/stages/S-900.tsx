import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { hasS900CorrectOrder, type S900ReelId } from "./S-900.functions";
import { s900Locale } from "./S-900.locale";

type SegmentManifest = {
  schemaVersion: number;
  mimeType: string;
  frameRate: number;
  width: number;
  height: number;
  leadIn: SegmentDescription;
  reels: Readonly<Record<S900ReelId, SegmentDescription>>;
};

type SegmentDescription = {
  file: keyof typeof segmentUrls;
  frames: number;
};

const manifestUrl = new URL(
  "../fixtures/s900/assets/generation-manifest.json",
  import.meta.url,
).href;
const emptyCaptionsUrl = new URL(
  "../fixtures/s900/assets/empty.vtt",
  import.meta.url,
).href;
const segmentUrls = {
  "lead.webm": new URL("../fixtures/s900/assets/lead.webm", import.meta.url)
    .href,
  "a.webm": new URL("../fixtures/s900/assets/a.webm", import.meta.url).href,
  "b.webm": new URL("../fixtures/s900/assets/b.webm", import.meta.url).href,
  "c.webm": new URL("../fixtures/s900/assets/c.webm", import.meta.url).href,
  "d.webm": new URL("../fixtures/s900/assets/d.webm", import.meta.url).href,
} as const;
const reelIds: readonly S900ReelId[] = ["A", "B", "C", "D"];
const slots = [1, 2, 3, 4] as const;
const reelSequence: Readonly<Record<S900ReelId, number>> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
};

function appendSegment(
  sourceBuffer: SourceBuffer,
  bytes: ArrayBuffer,
  signal: AbortSignal,
) {
  return new Promise<void>((resolve, reject) => {
    const finish = () => {
      sourceBuffer.removeEventListener("updateend", finish);
      signal.removeEventListener("abort", cancel);
      resolve();
    };
    const cancel = () => {
      sourceBuffer.removeEventListener("updateend", finish);
      reject(new DOMException("aborted", "AbortError"));
    };
    signal.addEventListener("abort", cancel, { once: true });
    sourceBuffer.addEventListener("updateend", finish, { once: true });
    try {
      sourceBuffer.appendBuffer(bytes);
    } catch (error) {
      sourceBuffer.removeEventListener("updateend", finish);
      signal.removeEventListener("abort", cancel);
      reject(error);
    }
  });
}

async function createSplicedVideo(
  order: readonly S900ReelId[],
  signal: AbortSignal,
) {
  const response = await fetch(manifestUrl, { signal });
  if (!response.ok) throw new Error("segment fixture unavailable");
  const manifest = (await response.json()) as SegmentManifest;
  if (
    manifest.schemaVersion !== 2 ||
    !Number.isFinite(manifest.frameRate) ||
    manifest.frameRate <= 0 ||
    manifest.width !== 640 ||
    manifest.height !== 360 ||
    !MediaSource.isTypeSupported(manifest.mimeType)
  ) {
    throw new Error("VP8 MediaSource unavailable");
  }
  const segments = [
    manifest.leadIn,
    ...order.map((reel) => manifest.reels[reel]),
  ];
  if (
    segments.some(
      (segment) =>
        !segment ||
        !(segment.file in segmentUrls) ||
        !Number.isInteger(segment.frames) ||
        segment.frames <= 0,
    )
  )
    throw new Error("invalid segment fixture manifest");
  const buffers = await Promise.all(
    segments.map(async (segment) => {
      const url = segmentUrls[segment.file];
      const asset = await fetch(url, { signal });
      if (!asset.ok) throw new Error("segment bytes unavailable");
      return { bytes: await asset.arrayBuffer(), frames: segment.frames };
    }),
  );
  const mediaSource = new MediaSource();
  const url = URL.createObjectURL(mediaSource);
  const ready = new Promise<void>((resolve, reject) => {
    mediaSource.addEventListener(
      "sourceopen",
      () => {
        void (async () => {
          const sourceBuffer = mediaSource.addSourceBuffer(manifest.mimeType);
          // Each reel is an independently encoded WebM. Append it at an
          // explicit timestamp so MSE, rather than a runtime transcoder,
          // creates the continuous playback timeline.
          sourceBuffer.mode = "segments";
          let timestamp = 0;
          for (const segment of buffers) {
            sourceBuffer.timestampOffset = timestamp;
            await appendSegment(sourceBuffer, segment.bytes, signal);
            timestamp += segment.frames / manifest.frameRate;
          }
          if (mediaSource.readyState === "open") mediaSource.endOfStream();
          resolve();
        })().catch((error: unknown) => {
          if (mediaSource.readyState === "open")
            mediaSource.endOfStream("decode");
          reject(error);
        });
      },
      { once: true },
    );
  });
  return { ready, url };
}

/**
 * S-900 — 固定VP8 WebM segmentを実MediaSource / SourceBufferへ順にappendし、完成videoを再生する。
 * 目的: playlist表示だけでなく、player自身が選んだ順のbyte streamをbrowserの映写機が再生可能なmediaへ組み立てる感覚を作る。
 * 最初の一手: A〜Dのリールを4つの空き枠へ一度ずつ選ぶ。選んだ順は枠に残るので、必要なら「並びを消す」でやり直せる。
 * 箱ごとの解法: B01はA→B→C→Dで4枠を埋め、「映写機へ送る」を押す。固定lead-inと各固定WebM segmentを`MediaSource`の`SourceBuffer`へ実appendしたoutput videoをnative controlsで最後まで再生すると開く。
 * 開かない操作: cardの見た目だけの並び、4本未満、同じreelの重複、assembleだけ、videoの途中停止、synthetic ended event、DOM上の順序変更では開かない。
 * 使用API: MediaSource、SourceBuffer、`appendBuffer`、`updateend`、固定WebM asset、HTMLVideoElementのtrusted ended event。
 * 権限・privacy: 権限・保存・送信は使わず、同梱した5つの固定assetだけをfetchする。
 * cleanup: stage離脱・再組立時はappend AbortSignal、video playback、blob URLを破棄する。workerやtimerを残さない。
 * 対応環境: VP8 WebMをMediaSourceでappendできるbrowser。fallback videoや疑似progressは作らない。
 * 人手確認: H-064で正順・誤順、未完成、再組立、native ended、network失敗、離脱時abortを確認する。
 */
export default function S900Stage(props: StageComponentProps) {
  const problem = props.problem("S-900-B01");
  const videoRef = useRef<HTMLVideoElement>(null);
  const generationRef = useRef<AbortController | null>(null);
  const [order, setOrder] = useState<S900ReelId[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>();
  const [status, setStatus] = useState<
    "idle" | "waiting" | "ready" | "wrong" | "failed"
  >("idle");

  useEffect(() => {
    const stop = () => {
      generationRef.current?.abort();
      videoRef.current?.pause();
    };
    props.signal.addEventListener("abort", stop, { once: true });
    return () => {
      props.signal.removeEventListener("abort", stop);
      stop();
      setVideoUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return undefined;
      });
    };
  }, [props.signal]);

  const assemble = () => {
    if (order.length !== reelIds.length) return;
    generationRef.current?.abort();
    const controller = new AbortController();
    generationRef.current = controller;
    setStatus("waiting");
    void createSplicedVideo(order, controller.signal)
      .then((media) => {
        setVideoUrl((current) => {
          if (current) URL.revokeObjectURL(current);
          return media.url;
        });
        return media.ready;
      })
      .then(() => {
        if (!controller.signal.aborted)
          setStatus(hasS900CorrectOrder(order) ? "ready" : "wrong");
      })
      .catch((error: unknown) => {
        if ((error as DOMException).name !== "AbortError") setStatus("failed");
      });
  };

  const isSupported =
    "MediaSource" in window &&
    MediaSource.isTypeSupported('video/webm; codecs="vp8"');
  return (
    <div className="puzzle s900-stage">
      <div className="problem-row">
        <ProblemGiftBox problem={problem} locale={props.locale} />
      </div>
      <p>{stageText(props.locale, s900Locale.intro)}</p>
      <div className="s900-workbench">
        <fieldset className="s900-reels">
          <legend className="sr-only">
            {stageText(props.locale, s900Locale.reel)}
          </legend>
          {reelIds.map((reel) => (
            <button
              type="button"
              className="s900-reel"
              key={reel}
              disabled={
                !isSupported ||
                order.includes(reel) ||
                order.length === reelIds.length
              }
              onClick={() => setOrder((current) => [...current, reel])}
            >
              {stageText(props.locale, s900Locale.reel)} {reel}
              <span className="s900-reel__sequence">
                {stageText(props.locale, s900Locale.sequence)}{" "}
                {reelSequence[reel]} / {reelIds.length}
              </span>
            </button>
          ))}
        </fieldset>
        <ol
          className="s900-slots"
          aria-label={stageText(props.locale, s900Locale.slot)}
        >
          {slots.map((slot) => (
            <li key={`slot-${slot}`}>
              {order[slot - 1] ?? stageText(props.locale, s900Locale.slot)}
            </li>
          ))}
        </ol>
      </div>
      <div className="s900-actions">
        <button
          type="button"
          className="stage-action"
          disabled={
            !isSupported ||
            order.length !== reelIds.length ||
            status === "waiting"
          }
          onClick={assemble}
        >
          {stageText(props.locale, s900Locale.assemble)}
        </button>
        <button
          type="button"
          onClick={() => {
            generationRef.current?.abort();
            setOrder([]);
            setStatus("idle");
          }}
        >
          {stageText(props.locale, s900Locale.reset)}
        </button>
      </div>
      {videoUrl ? (
        <video
          ref={videoRef}
          className="s900-video"
          controls
          src={videoUrl}
          onEnded={(event) => {
            if (event.isTrusted && hasS900CorrectOrder(order))
              problem.solve(["media-source:ordered-stream-ended"]);
          }}
        >
          <track
            kind="captions"
            src={emptyCaptionsUrl}
            srcLang="en"
            label="Reel captions"
          />
        </video>
      ) : null}
      <output className="interaction-status" aria-live="polite">
        {!isSupported
          ? stageText(props.locale, s900Locale.unsupported)
          : status === "waiting"
            ? stageText(props.locale, s900Locale.waiting)
            : status === "ready"
              ? stageText(props.locale, s900Locale.ready)
              : status === "wrong"
                ? stageText(props.locale, s900Locale.wrongOrder)
                : status === "failed"
                  ? stageText(props.locale, s900Locale.failed)
                  : ""}
      </output>
    </div>
  );
}
