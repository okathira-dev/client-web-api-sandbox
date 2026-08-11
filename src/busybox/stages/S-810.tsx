import {
  BufferTarget,
  CanvasSource,
  Output,
  WebMOutputFormat,
} from "mediabunny";
import { useCallback, useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

type SweepKey = "small-square" | "large-square" | "wide" | "tall";

const sweepLabels: Record<SweepKey, { ja: string; en: string }> = {
  "small-square": { ja: "小さい正方形", en: "Small square" },
  "large-square": { ja: "大きい正方形", en: "Large square" },
  wide: { ja: "横長", en: "Wide" },
  tall: { ja: "縦長", en: "Tall" },
};

function dimensionsForFrame(index: number) {
  const phase = Math.floor(index / 30);
  const offset = index % 30;
  const progress = offset / 29;
  const interpolate = (from: number, to: number) =>
    Math.max(144, Math.round((from + (to - from) * progress) / 8) * 8);
  if (phase === 0) {
    const size = interpolate(144, 1080);
    return [size, size] as const;
  }
  if (phase === 1) {
    const size = interpolate(1080, 144);
    return [size, size] as const;
  }
  if (phase === 2)
    return [interpolate(1080, 144), interpolate(144, 1080)] as const;
  return [interpolate(144, 1080), interpolate(1080, 144)] as const;
}

function drawSweepFrame(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  index: number,
) {
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas unavailable");
  context.fillStyle = "#f8fafc";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "#17233d";
  context.lineWidth = Math.max(2, Math.round(Math.min(width, height) / 90));
  context.strokeRect(
    context.lineWidth,
    context.lineWidth,
    width - context.lineWidth * 2,
    height - context.lineWidth * 2,
  );
  context.strokeStyle = "#6b7280";
  context.lineWidth = Math.max(1, Math.round(Math.min(width, height) / 180));
  for (let x = 1; x < 8; x += 1) {
    context.beginPath();
    context.moveTo((width * x) / 8, 0);
    context.lineTo((width * x) / 8, height);
    context.stroke();
  }
  for (let y = 1; y < 8; y += 1) {
    context.beginPath();
    context.moveTo(0, (height * y) / 8);
    context.lineTo(width, (height * y) / 8);
    context.stroke();
  }
  context.fillStyle = "#ef4444";
  context.beginPath();
  context.arc(
    width / 2,
    height / 2,
    Math.max(8, Math.min(width, height) / 8),
    0,
    Math.PI * 2,
  );
  context.fill();
  context.fillStyle = "#17233d";
  context.font = `bold ${Math.max(12, Math.min(width, height) / 10)}px sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(String(index + 1), width / 2, height / 2);
}

async function createSweepVideo(signal: AbortSignal) {
  const canvas = document.createElement("canvas");
  const source = new CanvasSource(canvas, {
    codec: "vp8",
    bitrate: 1_200_000,
    keyFrameInterval: 1 / 15,
    sizeChangeBehavior: "passThrough",
  });
  const target = new BufferTarget();
  const output = new Output({ format: new WebMOutputFormat(), target });
  output.addVideoTrack(source, { frameRate: 15 });
  await output.start();
  for (let index = 0; index < 120; index += 1) {
    if (signal.aborted) throw new DOMException("aborted", "AbortError");
    const [width, height] = dimensionsForFrame(index);
    drawSweepFrame(canvas, width, height, index);
    await source.add(index / 15, 1 / 15, { keyFrame: true });
  }
  await output.finalize();
  if (!target.buffer) throw new Error("sweep output unavailable");
  return URL.createObjectURL(new Blob([target.buffer], { type: "video/webm" }));
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

export default function S810Stage(props: StageComponentProps) {
  const problems = (
    ["S-810-B01", "S-810-B02", "S-810-B03", "S-810-B04"] as const
  ).map((id) => props.problem(id));
  const videoRef = useRef<HTMLVideoElement>(null);
  const callbackId = useRef<number | undefined>(undefined);
  const generationRef = useRef<AbortController | undefined>(undefined);
  const [videoUrl, setVideoUrl] = useState<string>();
  const [observed, setObserved] = useState<Partial<Record<SweepKey, boolean>>>(
    {},
  );
  const [dimensions, setDimensions] = useState<[number, number]>();
  const [status, setStatus] = useState("Generate the changing-size video.");

  const observe = (width: number, height: number) => {
    setDimensions([width, height]);
    const key = classifyDimensions(width, height);
    if (!key || observed[key]) return;
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
          setStatus("Generating frame-size sweep…");
          void createSweepVideo(controller.signal)
            .then((url) => {
              setVideoUrl((previous) => {
                if (previous) URL.revokeObjectURL(previous);
                return url;
              });
              setObserved({});
              setStatus(
                "Play and seek through the changing native video size.",
              );
            })
            .catch((error: unknown) => {
              if ((error as Error).name !== "AbortError")
                setStatus(
                  `Generation failed: ${error instanceof Error ? error.message : "unknown error"}`,
                );
            });
        }}
      >
        {props.locale === "ja"
          ? "スウィープ動画を生成"
          : "Generate sweep video"}
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
              setStatus("This browser cannot observe presented video frames.");
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
            label="No captions"
          />
        </video>
      ) : null}
      <p className="measurement" aria-live="polite">
        {dimensions
          ? `${dimensions[0]} × ${dimensions[1]} — ${status}`
          : status}
      </p>
      <div className="s810-observed" aria-live="polite">
        {(Object.keys(sweepLabels) as SweepKey[]).map((key) => (
          <span key={key} data-observed={observed[key] ? "true" : "false"}>
            {observed[key] ? "✓" : "○"} {sweepLabels[key][props.locale]}
          </span>
        ))}
      </div>
    </div>
  );
}
