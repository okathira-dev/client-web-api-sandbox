import { useCallback, useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import {
  aspectRatio,
  classifyS810AspectRatio,
  type S810AspectKey,
} from "./S-810.functions";
import { s810Locale } from "./S-810.locale";

const sweepLabelKeys: Record<S810AspectKey, keyof typeof s810Locale> = {
  square: "square",
  "four-three": "fourThree",
  "sixteen-nine": "sixteenNine",
  "nine-twenty": "nineTwenty",
};

function appendSegment(
  sourceBuffer: SourceBuffer,
  segment: ArrayBuffer,
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
      sourceBuffer.appendBuffer(segment);
    } catch (error) {
      sourceBuffer.removeEventListener("updateend", finish);
      signal.removeEventListener("abort", cancel);
      reject(error);
    }
  });
}

type SweepManifest = {
  schemaVersion: number;
  frameRate: number;
  frameCount: number;
  asset: string;
  segments: readonly {
    index: number;
    width: number;
    height: number;
    offset: number;
    length: number;
  }[];
};

const sweepManifestUrl = new URL(
  "../fixtures/s810/assets/generation-manifest.json",
  import.meta.url,
).href;
const sweepPackUrl = new URL(
  "../fixtures/s810/assets/resolution-sweep.pack",
  import.meta.url,
).href;

function createSweepMediaSource(signal: AbortSignal) {
  const mediaSource = new MediaSource();
  const url = URL.createObjectURL(mediaSource);
  const ready = new Promise<void>((resolve, reject) => {
    mediaSource.addEventListener(
      "sourceopen",
      () => {
        void (async () => {
          const [manifestResponse, packResponse] = await Promise.all([
            fetch(sweepManifestUrl, { signal }),
            fetch(sweepPackUrl, { signal }),
          ]);
          if (!manifestResponse.ok || !packResponse.ok)
            throw new Error("fixed sweep asset unavailable");
          const manifest = (await manifestResponse.json()) as SweepManifest;
          const pack = await packResponse.arrayBuffer();
          if (
            manifest.schemaVersion !== 1 ||
            manifest.frameCount !== manifest.segments.length ||
            manifest.segments.length === 0
          )
            throw new Error("invalid fixed sweep manifest");
          const mime = 'video/webm; codecs="vp8"';
          if (!MediaSource.isTypeSupported(mime))
            throw new Error("MSE WebM VP8 is unavailable");
          const sourceBuffer = mediaSource.addSourceBuffer(mime);
          sourceBuffer.mode = "segments";
          for (const segment of manifest.segments) {
            sourceBuffer.timestampOffset = segment.index / manifest.frameRate;
            await appendSegment(
              sourceBuffer,
              pack.slice(segment.offset, segment.offset + segment.length),
              signal,
            );
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
 * S-810 — 固定assetをMSEで連結したVP8 WebMをnative controlsでシークする。
 * 目的: CSSで引き伸ばした表示ではなく、シークを止めた実提示frameのnative寸法からアスペクト比を読む。
 * 最初の一手: 固定スウィープassetを読み込み、native timelineを動かしてから4つの比率のどれかでシークを止める。
 * 箱ごとの解法: B01は1:1、B02は4:3、B03は16:9、B04は9:20を、`seeked`後の`requestVideoFrameCallback()`で観測する。比率の許容差は相対5%以内。
 * 開かない操作: 通常再生、pauseだけ、読み込みボタン、metadataの一回読み取り、CSSサイズ変更、固定画像。ページにはscript自動seek経路を置かず、native controls以外を案内しない。
 * 使用API: MediaSource/SourceBuffer、固定WebMasset、video resize、seeked、requestVideoFrameCallback。
 * 権限・privacy: 権限・送信・保存はなく、固定assetと表示寸法だけを扱う。
 * cleanup: appendとAbortSignal、video callback、blob URLを離脱時に破棄する。
 * 対応環境: MSE WebM VP8と表示中frameの寸法を観測できるbrowser。
 * 人手確認: H-001/H-002/H-003/H-019/H-020/H-023/H-025/H-053で4比率のnative seekと再入場を確認する。
 */
export default function S810Stage(props: StageComponentProps) {
  const problems = (
    ["S-810-B01", "S-810-B02", "S-810-B03", "S-810-B04"] as const
  ).map((id) => props.problem(id));
  const videoRef = useRef<HTMLVideoElement>(null);
  const callbackId = useRef<number | undefined>(undefined);
  const generationRef = useRef<AbortController | undefined>(undefined);
  const seekGenerationRef = useRef(0);
  const observedRef = useRef<Partial<Record<S810AspectKey, boolean>>>({});
  const [videoUrl, setVideoUrl] = useState<string>();
  const [observed, setObserved] = useState<
    Partial<Record<S810AspectKey, boolean>>
  >({});
  const [dimensions, setDimensions] = useState<[number, number]>();
  const [status, setStatus] = useState(() =>
    stageText(props.locale, s810Locale.initial),
  );

  const updateDimensions = (width: number, height: number) => {
    setDimensions([width, height]);
  };

  const observeSeekedFrame = () => {
    const video = videoRef.current;
    if (!video?.requestVideoFrameCallback) {
      setStatus(stageText(props.locale, s810Locale.frameUnsupported));
      return;
    }
    if (callbackId.current !== undefined)
      video.cancelVideoFrameCallback?.(callbackId.current);
    const generation = ++seekGenerationRef.current;
    callbackId.current = video.requestVideoFrameCallback(() => {
      if (generation !== seekGenerationRef.current) return;
      callbackId.current = undefined;
      const width = video.videoWidth;
      const height = video.videoHeight;
      updateDimensions(width, height);
      const key = classifyS810AspectRatio(width, height);
      if (!key) {
        setStatus(stageText(props.locale, s810Locale.seekMiss));
        return;
      }
      setStatus(
        `${stageText(props.locale, s810Locale.seekHit)} ${stageText(props.locale, s810Locale[sweepLabelKeys[key]])}`,
      );
      if (observedRef.current[key]) return;
      observedRef.current[key] = true;
      setObserved((previous) => ({ ...previous, [key]: true }));
      const index =
        key === "square"
          ? 0
          : key === "four-three"
            ? 1
            : key === "sixteen-nine"
              ? 2
              : 3;
      problems[index]?.solve([`video:seeked-aspect:${key}`]);
    });
  };

  const stopSampling = useCallback(() => {
    seekGenerationRef.current += 1;
    const video = videoRef.current;
    if (video && callbackId.current !== undefined)
      video.cancelVideoFrameCallback?.(callbackId.current);
    callbackId.current = undefined;
  }, []);

  const ratioLabel = dimensions
    ? aspectRatio(dimensions[0], dimensions[1])?.toFixed(2)
    : undefined;

  useEffect(() => {
    const stop = () => {
      stopSampling();
      videoRef.current?.pause();
    };
    props.signal.addEventListener("abort", stop, { once: true });
    return () => {
      props.signal.removeEventListener("abort", stop);
      stop();
      generationRef.current?.abort();
      setVideoUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return undefined;
      });
    };
  }, [props.signal, stopSampling]);

  return (
    <div className="puzzle puzzle--centered s810-stage">
      <div className="problem-row">
        {problems.map((problem) => (
          <ProblemGiftBox
            key={problem.definition.id}
            problem={problem}
            locale={props.locale}
          />
        ))}
      </div>
      <button
        type="button"
        className="stage-action"
        onClick={() => {
          generationRef.current?.abort();
          stopSampling();
          const controller = new AbortController();
          generationRef.current = controller;
          setStatus(stageText(props.locale, s810Locale.generating));
          const media = createSweepMediaSource(controller.signal);
          setVideoUrl((previous) => {
            if (previous) URL.revokeObjectURL(previous);
            return media.url;
          });
          observedRef.current = {};
          setObserved({});
          setDimensions(undefined);
          void media.ready
            .then(() => setStatus(stageText(props.locale, s810Locale.ready)))
            .catch((error: unknown) => {
              if ((error as Error).name !== "AbortError")
                setStatus(
                  `${stageText(props.locale, s810Locale.generationFailed)}: ${error instanceof Error ? error.message : stageText(props.locale, s810Locale.unknown)}`,
                );
            });
        }}
      >
        {stageText(props.locale, s810Locale.generate)}
      </button>
      {videoUrl ? (
        <video
          ref={videoRef}
          className="stage-video s810-video"
          src={videoUrl}
          controls
          muted
          playsInline
          onLoadedMetadata={(event) =>
            updateDimensions(
              event.currentTarget.videoWidth,
              event.currentTarget.videoHeight,
            )
          }
          onResize={(event) =>
            updateDimensions(
              event.currentTarget.videoWidth,
              event.currentTarget.videoHeight,
            )
          }
          onSeeking={stopSampling}
          onSeeked={observeSeekedFrame}
          onPlay={() => setStatus(stageText(props.locale, s810Locale.playing))}
          onEnded={() => {
            stopSampling();
            setStatus(stageText(props.locale, s810Locale.ended));
          }}
        >
          <track
            kind="captions"
            src="data:text/vtt,WEBVTT"
            srcLang="en"
            label={stageText(props.locale, s810Locale.captions)}
          />
        </video>
      ) : null}
      <p className="measurement" aria-live="polite">
        {dimensions
          ? `${dimensions[0]} × ${dimensions[1]} (${ratioLabel}:1) — ${status}`
          : status}
      </p>
      <div className="s810-observed" aria-live="polite">
        {(Object.keys(sweepLabelKeys) as S810AspectKey[]).map((key) => (
          <span key={key} data-observed={observed[key] ? "true" : "false"}>
            {observed[key] ? "✓" : "○"}{" "}
            {stageText(props.locale, s810Locale[sweepLabelKeys[key]])}
          </span>
        ))}
      </div>
    </div>
  );
}
