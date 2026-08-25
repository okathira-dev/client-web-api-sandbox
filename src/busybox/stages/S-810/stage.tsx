import AspectRatioOutlined from "@mui/icons-material/AspectRatioOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useCallback, useEffect, useRef, useState } from "react";
import { stageText } from "../locale";
import { classifyS810AspectRatio, type S810AspectKey } from "./functions";
import { locale } from "./locale";

const sweepLabelKeys: Record<S810AspectKey, keyof typeof locale> = {
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
  "../../fixtures/s810/assets/generation-manifest.json",
  import.meta.url,
).href;
const sweepPackUrl = new URL(
  "../../fixtures/s810/assets/resolution-sweep.pack",
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
 * 最初の一手: 入場時に表示される固定スウィープassetを、native controlsで止めるか停止中にシークする。
 * 箱ごとの解法: B01は1:1、B02は4:3、B03は16:9、B04は9:20を、停止中の提示frameのnative寸法で観測する。初期frameは1:1なのでB01は入場直後に開く。寸法がまだ取得できない場合だけ`requestVideoFrameCallback()`を待つ。比率の許容差は相対5%以内。
 * 開かない操作: 通常再生中の比率通過、CSSサイズ変更、固定画像では開かない。pause、ended、停止中のnative seekは提示frameの実寸で判定する。
 * 使用API: MediaSource/SourceBuffer、固定WebMasset、video resize、seeked、requestVideoFrameCallback。
 * 権限・privacy: 権限・送信・保存はなく、固定assetと表示寸法だけを扱う。
 * cleanup: appendとAbortSignal、video callback、blob URLを離脱時に破棄する。
 * 対応環境: MSE WebM VP8と表示中frameの寸法を観測できるbrowser。
 * 人手確認: H-001/H-002/H-003/H-019/H-020/H-023/H-025/H-053で4比率のnative seekと再入場を確認する。
 */
function S810Stage(props: Props) {
  const problems = [
    props.boxes[manifest.box.B01],
    props.boxes[manifest.box.B02],
    props.boxes[manifest.box.B03],
    props.boxes[manifest.box.B04],
  ] as const;
  const videoRef = useRef<HTMLVideoElement>(null);
  const callbackId = useRef<number | undefined>(undefined);
  const generationRef = useRef<AbortController | undefined>(undefined);
  const seekGenerationRef = useRef(0);
  const [videoUrl, setVideoUrl] = useState<string>();
  const [error, setError] = useState<string>();

  const solveObservedFrame = (video: HTMLVideoElement) => {
    const key = classifyS810AspectRatio(video.videoWidth, video.videoHeight);
    if (!key) return;
    const index =
      key === "square"
        ? 0
        : key === "four-three"
          ? 1
          : key === "sixteen-nine"
            ? 2
            : 3;
    problems[index]?.solve();
  };

  const observeStoppedFrame = () => {
    const video = videoRef.current;
    if (!video?.paused || video.seeking) return;
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      solveObservedFrame(video);
      return;
    }
    if (!video?.requestVideoFrameCallback) {
      setError(stageText(props.locale, locale.frameUnsupported));
      return;
    }
    if (callbackId.current !== undefined)
      video.cancelVideoFrameCallback?.(callbackId.current);
    const generation = ++seekGenerationRef.current;
    callbackId.current = video.requestVideoFrameCallback(() => {
      if (generation !== seekGenerationRef.current) return;
      callbackId.current = undefined;
      solveObservedFrame(video);
    });
  };

  const stopSampling = useCallback(() => {
    seekGenerationRef.current += 1;
    const video = videoRef.current;
    if (video && callbackId.current !== undefined)
      video.cancelVideoFrameCallback?.(callbackId.current);
    callbackId.current = undefined;
  }, []);

  const loadSweep = useCallback(() => {
    generationRef.current?.abort();
    stopSampling();
    const controller = new AbortController();
    generationRef.current = controller;
    const media = createSweepMediaSource(controller.signal);
    setVideoUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return media.url;
    });
    setError(undefined);
    void media.ready.catch((loadError: unknown) => {
      if ((loadError as Error).name !== "AbortError")
        setError(
          `${stageText(props.locale, locale.generationFailed)}: ${loadError instanceof Error ? loadError.message : stageText(props.locale, locale.unknown)}`,
        );
    });
  }, [props.locale, stopSampling]);

  useEffect(() => {
    const stop = () => {
      stopSampling();
      videoRef.current?.pause();
    };
    props.signal.addEventListener("abort", stop, { once: true });
    loadSweep();
    return () => {
      props.signal.removeEventListener("abort", stop);
      stop();
      generationRef.current?.abort();
      setVideoUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return undefined;
      });
    };
  }, [loadSweep, props.signal, stopSampling]);

  return (
    <div className="puzzle puzzle--centered s810-stage">
      <div className="problem-row s810-problem-row">
        {problems.map((problem, index) => {
          const key = (
            ["square", "four-three", "sixteen-nine", "nine-twenty"] as const
          )[index];
          if (!key) return null;
          return (
            <div className="s810-problem" key={problem.id}>
              <StageProblemGiftBox box={problem} locale={props.locale} />
              <span>
                {stageText(props.locale, locale[sweepLabelKeys[key]])}
              </span>
            </div>
          );
        })}
      </div>
      {videoUrl ? (
        <video
          ref={videoRef}
          className="stage-video s810-video"
          src={videoUrl}
          controls
          muted
          playsInline
          onLoadedData={observeStoppedFrame}
          onSeeking={stopSampling}
          onSeeked={observeStoppedFrame}
          onPause={observeStoppedFrame}
          onPlay={stopSampling}
          onEnded={observeStoppedFrame}
        >
          <track
            kind="captions"
            src="data:text/vtt,WEBVTT"
            srcLang="en"
            label={stageText(props.locale, locale.captions)}
          />
        </video>
      ) : null}
      {error ? <p className="measurement">{error}</p> : null}
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: AspectRatioOutlined,
      color: "#84cc16",
      label: locale.B01,
    },
    [manifest.box.B02]: {
      icon: AspectRatioOutlined,
      color: "#65a30d",
      label: locale.B02,
    },
    [manifest.box.B03]: {
      icon: AspectRatioOutlined,
      color: "#4d7c0f",
      label: locale.B03,
    },
    [manifest.box.B04]: {
      icon: AspectRatioOutlined,
      color: "#3f6212",
      label: locale.B04,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      "onresize" in HTMLVideoElement.prototype &&
      "requestVideoFrameCallback" in HTMLVideoElement.prototype
        ? "available"
        : "unsupported",
    ),
  Component: S810Stage,
});
