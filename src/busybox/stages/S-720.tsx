import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  CanvasSink,
  CanvasSource,
  Input,
  Output,
  WebMOutputFormat,
} from "mediabunny";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  type VideoRecoveryRoute,
  videoRecoveryAssets,
  videoRecoveryFlags,
  videoRecoveryRoutes,
} from "../fixtures/video-recovery/fixtures";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s720Locale } from "./S-720.locale";

type SourceNode = "source1" | "source2" | "source3";
type TransformNode = "t1a" | "t2a" | "t3a" | "t1b" | "t2b" | "t3b";
type NodeId = SourceNode | TransformNode | "output";
type TransformKind = "t1" | "t2" | "t3";

/**
 * S-720 — 動画ノードと変換ノードをBezierケーブルで配線するpatch bay。
 * 目的: 動画を実際に変換し、QRが読める正しい経路だけを発見する。
 * 最初の一手: sourceのoutを変換in、変換outを次のin、最後をoutputへ順に接続する。
 * 箱ごとの成功条件: B01〜B04は正規routeを実行して出力QRを読み、共通flagを入力する。
 * 開かない操作: 分岐、cycle、入力側から始める接続、変換を表示だけで済ませた入力では開かない。
 * API/権限: SVG/Canvasケーブル、HTMLMediaElement、MediaBunny、Canvas。権限・送信・回答保存はない。
 * cleanup/環境: 変換中のAbortSignalとblob URLを破棄し、出力videoを停止する。H-001/H-002/H-003/H-004/H-014/H-019/H-020/H-023/H-025/H-043を確認する。
 */
export interface VideoPatchCable {
  from: Exclude<NodeId, "output">;
  to: Exclude<NodeId, SourceNode>;
}

const sourceNodes: readonly SourceNode[] = ["source1", "source2", "source3"];
const transformNodes: readonly TransformNode[] = [
  "t1a",
  "t2a",
  "t3a",
  "t1b",
  "t2b",
  "t3b",
];
const transformKind: Record<TransformNode, TransformKind> = {
  t1a: "t1",
  t2a: "t2",
  t3a: "t3",
  t1b: "t1",
  t2b: "t2",
  t3b: "t3",
};

const portPositions: Record<
  NodeId,
  { input?: [number, number]; output?: [number, number] }
> = {
  source1: { output: [220, 110] },
  source2: { output: [220, 325] },
  source3: { output: [220, 540] },
  t1a: { input: [330, 110], output: [500, 110] },
  t2a: { input: [330, 325], output: [500, 325] },
  t3a: { input: [330, 540], output: [500, 540] },
  t1b: { input: [590, 110], output: [760, 110] },
  t2b: { input: [590, 325], output: [760, 325] },
  t3b: { input: [590, 540], output: [760, 540] },
  output: { input: [840, 325] },
};

function nodeKind(node: TransformNode) {
  return transformKind[node];
}

function semanticPath(path: readonly NodeId[]) {
  return path.map((node) =>
    node in transformKind ? nodeKind(node as TransformNode) : node,
  );
}

function hasCycle(cables: readonly VideoPatchCable[]) {
  const outgoing = new Map<NodeId, NodeId>();
  for (const cable of cables) outgoing.set(cable.from, cable.to);
  for (const start of [...sourceNodes, ...transformNodes]) {
    const visited = new Set<NodeId>();
    let node: NodeId | undefined = start;
    while (node && node !== "output") {
      if (visited.has(node)) return true;
      visited.add(node);
      node = outgoing.get(node);
    }
  }
  return false;
}

function pathForCables(cables: readonly VideoPatchCable[]) {
  const outgoing = new Map<NodeId, NodeId>();
  for (const cable of cables) outgoing.set(cable.from, cable.to);
  for (const source of sourceNodes) {
    const path: NodeId[] = [source];
    const visited = new Set<NodeId>(path);
    let node: NodeId | undefined = source;
    while (node && node !== "output") {
      const next = outgoing.get(node);
      if (!next || visited.has(next)) break;
      path.push(next);
      visited.add(next);
      node = next;
    }
    if (path.at(-1) === "output") return path;
  }
  return undefined;
}

export function findVideoRecoveryRoute(
  cables: readonly VideoPatchCable[],
): VideoRecoveryRoute | undefined {
  const path = pathForCables(cables);
  if (!path) return undefined;
  const candidate = (
    Object.keys(videoRecoveryRoutes) as VideoRecoveryRoute[]
  ).find(
    (route) =>
      semanticPath(path).join(">") === videoRecoveryRoutes[route].join(">"),
  );
  return candidate;
}

type PixelFrame = {
  data: Uint8ClampedArray;
  duration: number;
  timestamp: number;
};

const WIDTH = 360;
const HEIGHT = 360;

function swapHalves(frame: PixelFrame): PixelFrame {
  const result = new Uint8ClampedArray(frame.data.length);
  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      const sourceX = x < WIDTH / 2 ? x + WIDTH / 2 : x - WIDTH / 2;
      const target = (y * WIDTH + x) * 4;
      const source = (y * WIDTH + sourceX) * 4;
      result.set(frame.data.slice(source, source + 4), target);
    }
  }
  return { ...frame, data: result };
}

function selectHalf(frame: PixelFrame, index: number): PixelFrame {
  const result = new Uint8ClampedArray(frame.data.length).fill(255);
  const left = index % 2 === 0;
  const start = left ? 0 : WIDTH / 2;
  const end = left ? WIDTH / 2 : WIDTH;
  for (let y = 0; y < HEIGHT; y += 1) {
    const rowStart = (y * WIDTH + start) * 4;
    const rowEnd = (y * WIDTH + end) * 4;
    result.set(frame.data.slice(rowStart, rowEnd), rowStart);
  }
  return { ...frame, data: result };
}

function multiplyFrames(frames: readonly PixelFrame[]) {
  if (frames.length === 0) return [];
  const first = frames[0];
  if (!first) return [];
  const composite = new Uint8ClampedArray(first.data.length).fill(255);
  for (const frame of frames) {
    for (let index = 0; index < composite.length; index += 1) {
      composite[index] = Math.min(
        composite[index] ?? 255,
        frame.data[index] ?? 255,
      );
    }
  }
  return frames.map((frame) => ({
    ...frame,
    data: new Uint8ClampedArray(composite),
  }));
}

function applyTransform(
  frames: readonly PixelFrame[],
  kind: TransformKind,
): PixelFrame[] {
  if (kind === "t1") return frames.map(swapHalves);
  if (kind === "t2") return multiplyFrames(frames);
  return frames.map(selectHalf);
}

async function renderVideoRoute(
  source: SourceNode,
  transforms: readonly TransformKind[],
  signal: AbortSignal,
) {
  const response = await fetch(videoRecoveryAssets[source], { signal });
  const input = new Input({
    source: new BlobSource(await response.blob()),
    formats: ALL_FORMATS,
  });
  try {
    const track = await input.getPrimaryVideoTrack();
    if (!track || !(await track.canDecode()))
      throw new Error("source cannot decode");
    const sink = new CanvasSink(track, {
      width: WIDTH,
      height: HEIGHT,
      fit: "contain",
    });
    const frames: PixelFrame[] = [];
    for await (const wrapped of sink.canvases(0, 10)) {
      if (signal.aborted) throw new DOMException("aborted", "AbortError");
      const canvas = wrapped.canvas;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("canvas unavailable");
      const image = context.getImageData(0, 0, WIDTH, HEIGHT);
      frames.push({
        data: new Uint8ClampedArray(image.data),
        duration: wrapped.duration || 1 / 12,
        timestamp: wrapped.timestamp,
      });
    }
    let transformed = frames;
    for (const kind of transforms)
      transformed = applyTransform(transformed, kind);
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const sourceEncoder = new CanvasSource(canvas, {
      codec: "vp8",
      bitrate: 600_000,
      keyFrameInterval: 1,
      sizeChangeBehavior: "deny",
    });
    const target = new BufferTarget();
    const output = new Output({ format: new WebMOutputFormat(), target });
    output.addVideoTrack(sourceEncoder, { frameRate: 12 });
    await output.start();
    const context = canvas.getContext("2d");
    if (!context) throw new Error("canvas unavailable");
    for (const frame of transformed) {
      if (signal.aborted) throw new DOMException("aborted", "AbortError");
      const image = context.createImageData(WIDTH, HEIGHT);
      image.data.set(frame.data);
      context.putImageData(image, 0, 0);
      await sourceEncoder.add(frame.timestamp, frame.duration);
    }
    await output.finalize();
    if (!target.buffer) throw new Error("encoded output unavailable");
    return new Blob([target.buffer], { type: "video/webm" });
  } finally {
    input.dispose();
  }
}

function routeDetails(path: readonly NodeId[]) {
  const source = path[0];
  if (!source || !sourceNodes.includes(source as SourceNode)) return undefined;
  return {
    source: source as SourceNode,
    transforms: path
      .slice(1, -1)
      .filter((node): node is TransformNode => node in transformKind)
      .map(nodeKind),
  };
}

/**
 * S-720 — 動画ノードと変換ノードをBezierケーブルで配線するpatch bay。
 * 目的: 動画を実際に変換し、QRが読める正しい経路だけを発見する。
 * 最初の一手: sourceのoutを変換in、変換outを次のin、最後をoutputへ順に接続する。
 * 箱ごとの成功条件: B01〜B04は正規routeを実行して出力QRを読み、共通flagを入力する。
 * 開かない操作: 分岐、cycle、入力側から始める接続、変換を表示だけで済ませた入力では開かない。
 * API/権限: SVG/Canvasケーブル、HTMLMediaElement、MediaBunny、Canvas。権限・送信・回答保存はない。
 * cleanup/環境: 変換中のAbortSignalとblob URLを破棄し、出力videoを停止する。H-001/H-002/H-003/H-004/H-014/H-019/H-020/H-023/H-025/H-043を確認する。
 */
export default function S720Stage(props: StageComponentProps) {
  const problems = useMemo(
    () =>
      (["B01", "B02", "B03", "B04"] as const).map((suffix) =>
        props.problem(`S-720-${suffix}`),
      ),
    [props.problem],
  );
  const cableCanvasRef = useRef<HTMLCanvasElement>(null);
  const [cables, setCables] = useState<VideoPatchCable[]>([]);
  const [pendingFrom, setPendingFrom] = useState<VideoPatchCable["from"]>();
  const [available, setAvailable] = useState<
    Partial<Record<VideoRecoveryRoute, boolean>>
  >({});
  const [outputUrl, setOutputUrl] = useState<string>();
  const [status, setStatus] = useState(() =>
    stageText(props.locale, s720Locale.connectPrompt),
  );
  const [answer, setAnswer] = useState("");
  const activePath = useMemo(() => pathForCables(cables), [cables]);
  const activeRoute = useMemo(() => findVideoRecoveryRoute(cables), [cables]);

  useEffect(() => {
    const context = cableCanvasRef.current?.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, 1120, 650);
    context.strokeStyle = "#ffd166";
    context.lineWidth = 7;
    context.lineCap = "round";
    context.shadowColor = "#000b";
    context.shadowBlur = 5;
    context.shadowOffsetY = 3;
    for (const cable of cables) {
      const start = portPositions[cable.from].output;
      const end = portPositions[cable.to].input;
      if (!start || !end) continue;
      const curve = Math.max(60, Math.abs(end[0] - start[0]) * 0.4);
      context.beginPath();
      context.moveTo(start[0], start[1]);
      context.bezierCurveTo(
        start[0] + curve,
        start[1],
        end[0] - curve,
        end[1],
        end[0],
        end[1],
      );
      context.stroke();
    }
  }, [cables]);

  useEffect(() => {
    const details = activePath ? routeDetails(activePath) : undefined;
    if (!details) {
      setOutputUrl((previous) => {
        if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous);
        return undefined;
      });
      setStatus(stageText(props.locale, s720Locale.connectPrompt));
      return;
    }
    const controller = new AbortController();
    let disposed = false;
    const sourceUrl = videoRecoveryAssets[details.source];
    if (details.transforms.length === 0) {
      setOutputUrl(sourceUrl);
      setStatus(stageText(props.locale, s720Locale.direct));
    } else {
      setStatus(stageText(props.locale, s720Locale.applying));
      void renderVideoRoute(
        details.source,
        details.transforms,
        controller.signal,
      )
        .then((blob) => {
          if (disposed) return;
          const next = URL.createObjectURL(blob);
          setOutputUrl((previous) => {
            if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous);
            return next;
          });
          setStatus(stageText(props.locale, s720Locale.ready));
          if (activeRoute) {
            setAvailable((previous) => ({ ...previous, [activeRoute]: true }));
          }
        })
        .catch((error: unknown) => {
          if (!disposed && (error as Error).name !== "AbortError") {
            setStatus(
              `${stageText(props.locale, s720Locale.failed)}: ${error instanceof Error ? error.message : "unknown error"}`,
            );
          }
        });
    }
    return () => {
      disposed = true;
      controller.abort();
    };
  }, [activePath, activeRoute, props.locale]);

  useEffect(
    () => () => {
      setOutputUrl((previous) => {
        if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous);
        return undefined;
      });
    },
    [],
  );

  const connectTo = (to: VideoPatchCable["to"]) => {
    if (!pendingFrom || pendingFrom === to) return;
    setCables((previous) => {
      const withoutConflicts = previous.filter(
        (cable) => cable.from !== pendingFrom && cable.to !== to,
      );
      const next = [...withoutConflicts, { from: pendingFrom, to }];
      return hasCycle(next) ? previous : next;
    });
    setPendingFrom(undefined);
  };

  const transformNodesForColumn = (column: "a" | "b") =>
    [`t1${column}`, `t2${column}`, `t3${column}`] as TransformNode[];

  return (
    <div className="puzzle patchbay-puzzle">
      <div className="problem-row">
        {problems.map((problem) => (
          <ProblemGiftBox
            key={problem.definition.id}
            problem={problem}
            locale={props.locale}
          />
        ))}
      </div>
      <section
        className="video-patchbay"
        aria-label="video transform patch bay"
      >
        <div className="video-patchbay__surface">
          <canvas
            ref={cableCanvasRef}
            className="patch-cables"
            width="1120"
            height="650"
          >
            Connected video cables
          </canvas>
          {sourceNodes.map((id, index) => (
            <section
              key={id}
              className={`patch-node patch-node--source patch-node--source-${index + 1}`}
            >
              <video
                muted
                loop
                autoPlay
                playsInline
                src={videoRecoveryAssets[id]}
                aria-label={`video source ${index + 1}`}
              >
                <track
                  kind="captions"
                  src="data:text/vtt,WEBVTT"
                  srcLang="en"
                  label="Silent fixture"
                />
              </video>
              <span>VIDEO {index + 1}</span>
              <button
                type="button"
                className={`patch-port patch-port--out${pendingFrom === id ? " patch-port--active" : ""}`}
                onClick={() => setPendingFrom(id)}
                aria-label={`connect video ${index + 1} output`}
              />
            </section>
          ))}
          {(["a", "b"] as const).flatMap((column) =>
            transformNodesForColumn(column).map((id, index) => (
              <section
                key={id}
                className={`patch-node patch-node--transform patch-node--transform-${column}-${index + 1}`}
              >
                <button
                  type="button"
                  className="patch-port patch-port--in"
                  onClick={() => connectTo(id)}
                  aria-label={`connect ${id} input`}
                />
                <strong>{nodeKind(id).toUpperCase()}</strong>
                <span>
                  {nodeKind(id) === "t1"
                    ? "⇆"
                    : nodeKind(id) === "t2"
                      ? "∏"
                      : "◐"}
                </span>
                <button
                  type="button"
                  className={`patch-port patch-port--out${pendingFrom === id ? " patch-port--active" : ""}`}
                  onClick={() => setPendingFrom(id)}
                  aria-label={`connect ${id} output`}
                />
              </section>
            )),
          )}
          <section className="patch-node patch-node--output">
            <button
              type="button"
              className="patch-port patch-port--in"
              onClick={() => connectTo("output")}
              aria-label="connect video output input"
            />
            <span>OUTPUT</span>
            {outputUrl ? (
              <video
                key={outputUrl}
                muted
                loop
                autoPlay
                playsInline
                controls
                src={outputUrl}
                aria-label="transformed video output"
              >
                <track
                  kind="captions"
                  src="data:text/vtt,WEBVTT"
                  srcLang="en"
                  label="Silent output"
                />
              </video>
            ) : (
              <div
                className="patch-output-idle"
                role="img"
                aria-label="video output idle"
              >
                ∿
              </div>
            )}
            <small role="status">{status}</small>
          </section>
        </div>
      </section>
      <div className="patchbay-controls">
        <button
          type="button"
          className="stage-action"
          onClick={() => {
            setCables([]);
            setPendingFrom(undefined);
          }}
        >
          {stageText(props.locale, s720Locale.disconnect)}
        </button>
        <label className="parallel-answer">
          flag
          <input
            value={answer}
            placeholder="busybox{…}"
            onChange={(event) => {
              const next = event.currentTarget.value;
              setAnswer(next);
              const normalized = next.trim().toLowerCase();
              const route = (
                Object.keys(videoRecoveryFlags) as VideoRecoveryRoute[]
              ).find(
                (candidate) =>
                  available[candidate] &&
                  videoRecoveryFlags[candidate] === normalized,
              );
              if (!route) return;
              const index =
                route === "t1"
                  ? 0
                  : route === "t2"
                    ? 1
                    : route === "alpha"
                      ? 2
                      : 3;
              problems[index]?.solve([`video-patch:${route}:qr`]);
            }}
          />
        </label>
      </div>
    </div>
  );
}
