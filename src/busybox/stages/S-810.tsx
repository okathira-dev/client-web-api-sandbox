import { useCallback, useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s810Locale } from "./S-810.locale";

type SweepKey = "small-square" | "large-square" | "wide" | "tall";

const sweepLabelKeys: Record<SweepKey, keyof typeof s810Locale> = {
  "small-square": "smallSquare",
  "large-square": "largeSquare",
  wide: "wide",
  tall: "tall",
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

function classifyDimensions(
  width: number,
  height: number,
): SweepKey | undefined {
  if (width <= 200 && height <= 200) return "small-square";
  if (width >= 900 && height >= 900) return "large-square";
  if (width >= 900 && height <= 200) return "wide";
  if (width <= 200 && height >= 900) return "tall";
  return undefined;
}

/**
 * S-810 — 固定assetをMSEで連結したVP8 WebMのnative videoWidth/videoHeightを読む。
 * 目的: CSSで引き伸ばした表示ではなく、再生中のフレーム寸法そのものを見せる。
 * 最初の一手: 固定スウィープassetを読み込み、再生またはシークして4種類の寸法帯を観察する。
 * 箱ごとの成功条件: B01は小正方形、B02は大正方形、B03は横長、B04は縦長をframe callbackで確認する。
 * 開かない操作: CSSサイズ変更、固定画像、読み込みボタンだけ、metadataの一回読み取りだけでは開かない。
 * API/権限: MediaSource/SourceBuffer、固定WebMasset、video resize、requestVideoFrameCallback。権限・送信・保存はない。
 * cleanup/環境: appendとAbortSignal、video callback、blob URLを離脱時に破棄する。MSE WebM VP8対応環境でH-001/H-002/H-003/H-019/H-020/H-023/H-025/H-053を確認する。
 */
/**
 * S-810
 *
 * 目的: S-810の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S810Stage(props: StageComponentProps) {
  const problems = (
    ["S-810-B01", "S-810-B02", "S-810-B03", "S-810-B04"] as const
  ).map((id) => props.problem(id));
  const videoRef = useRef<HTMLVideoElement>(null);
  const callbackId = useRef<number | undefined>(undefined);
  const generationRef = useRef<AbortController | undefined>(undefined);
  const observedRef = useRef<Partial<Record<SweepKey, boolean>>>({});
  const [videoUrl, setVideoUrl] = useState<string>();
  const [observed, setObserved] = useState<Partial<Record<SweepKey, boolean>>>(
    {},
  );
  const [dimensions, setDimensions] = useState<[number, number]>();
  const [status, setStatus] = useState(() =>
    stageText(props.locale, s810Locale.initial),
  );

  const observe = (width: number, height: number) => {
    setDimensions([width, height]);
    const key = classifyDimensions(width, height);
    if (!key || observedRef.current[key]) return;
    observedRef.current[key] = true;
    setObserved((previous) => ({ ...previous, [key]: true }));
    const index =
      key === "small-square"
        ? 0
        : key === "large-square"
          ? 1
          : key === "wide"
            ? 2
            : 3;
    problems[index]?.solve([`video:resize:${key}`]);
  };

  const stopSampling = useCallback(() => {
    const video = videoRef.current;
    if (video && callbackId.current !== undefined)
      video.cancelVideoFrameCallback?.(callbackId.current);
    callbackId.current = undefined;
  }, []);

  const sample = () => {
    const video = videoRef.current;
    if (!video?.requestVideoFrameCallback) return;
    observe(video.videoWidth, video.videoHeight);
    callbackId.current = video.requestVideoFrameCallback(sample);
  };

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
            observe(
              event.currentTarget.videoWidth,
              event.currentTarget.videoHeight,
            )
          }
          onResize={(event) =>
            observe(
              event.currentTarget.videoWidth,
              event.currentTarget.videoHeight,
            )
          }
          onPlaying={() => {
            stopSampling();
            const video = videoRef.current;
            if (!video?.requestVideoFrameCallback) {
              setStatus(stageText(props.locale, s810Locale.frameUnsupported));
              return;
            }
            callbackId.current = video.requestVideoFrameCallback(sample);
          }}
          onPause={stopSampling}
          onEnded={stopSampling}
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
          ? `${dimensions[0]} × ${dimensions[1]} — ${status}`
          : status}
      </p>
      <div className="s810-observed" aria-live="polite">
        {(Object.keys(sweepLabelKeys) as SweepKey[]).map((key) => (
          <span key={key} data-observed={observed[key] ? "true" : "false"}>
            {observed[key] ? "✓" : "○"}{" "}
            {stageText(props.locale, s810Locale[sweepLabelKeys[key]])}
          </span>
        ))}
      </div>
    </div>
  );
}
