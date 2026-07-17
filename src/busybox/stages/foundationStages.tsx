import {
  type ClipboardEvent as ReactClipboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

const visualOrder = { A: 1, B: 2, C: 3 } as const;

export function DocumentOrderStage(props: StageComponentProps) {
  const [order, setOrder] = useState<readonly (keyof typeof visualOrder)[]>([
    "B",
    "C",
    "A",
  ]);
  const structureRef = useRef<HTMLOListElement>(null);
  const boxId = "S-150-B01";

  useEffect(() => {
    const structure = structureRef.current;
    if (!structure) return;
    const inspect = () => {
      const text = Array.from(
        structure.children,
        (item) => item.textContent,
      ).join("");
      if (text === "ABC") props.solve(boxId, ["dom:ordered"]);
    };
    const observer = new MutationObserver(inspect);
    observer.observe(structure, { childList: true });
    inspect();
    return () => observer.disconnect();
  }, [props.solve]);

  const rotate = () => {
    setOrder(([first, ...rest]) => (first ? [...rest, first] : []));
  };

  return (
    <div className="puzzle puzzle--centered">
      <ol className="structure-strip" ref={structureRef} aria-label="DOM order">
        {order.map((token) => (
          <li key={token} style={{ order: visualOrder[token] }}>
            {token}
          </li>
        ))}
      </ol>
      <p className="measurement">
        {props.locale === "ja"
          ? "見た目は動かない。読む順番だけが動く。"
          : "The view stays still. Only reading order moves."}
      </p>
      <button type="button" className="stage-action" onClick={rotate}>
        {props.locale === "ja" ? "文書を回す" : "Rotate document"}
      </button>
      <ProblemGiftBox
        boxId={boxId}
        state={props.problemState(boxId)}
        locale={props.locale}
      />
    </div>
  );
}

interface TracePoint {
  x: number;
  y: number;
  time: number;
}

function pointOnCanvas(canvas: HTMLCanvasElement, event: PointerEvent) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    time: event.timeStamp,
  };
}

export function PointerTraceStage(props: StageComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [distance, setDistance] = useState(0);
  const boxId = "S-160-B01";

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    let points: TracePoint[] = [];
    let drawing = false;

    const down = (event: PointerEvent) => {
      drawing = true;
      points = [pointOnCanvas(canvas, event)];
      setDistance(0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.beginPath();
      context.moveTo(points[0]?.x ?? 0, points[0]?.y ?? 0);
      canvas.setPointerCapture(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      if (!drawing) return;
      const point = pointOnCanvas(canvas, event);
      const previous = points.at(-1);
      if (!previous) return;
      context.lineWidth = 5;
      context.lineCap = "round";
      context.strokeStyle = "#7dd3fc";
      context.lineTo(point.x, point.y);
      context.stroke();
      points.push(point);
      const length = points.slice(1).reduce((total, current, index) => {
        const before = points[index];
        return before
          ? total + Math.hypot(current.x - before.x, current.y - before.y)
          : total;
      }, 0);
      setDistance(Math.round(length));
    };
    const up = (event: PointerEvent) => {
      if (!drawing) return;
      drawing = false;
      canvas.releasePointerCapture(event.pointerId);
      const speeds = points.slice(1).flatMap((point, index) => {
        const previous = points[index];
        if (!previous) return [];
        const elapsed = Math.max(1, point.time - previous.time);
        return [
          Math.hypot(point.x - previous.x, point.y - previous.y) / elapsed,
        ];
      });
      const total = points.slice(1).reduce((length, point, index) => {
        const previous = points[index];
        return previous
          ? length + Math.hypot(point.x - previous.x, point.y - previous.y)
          : length;
      }, 0);
      const duration = (points.at(-1)?.time ?? 0) - (points[0]?.time ?? 0);
      const slow = speeds.some((speed) => speed < 0.25);
      const fast = speeds.some((speed) => speed > 0.75);
      if (total >= 240 && duration >= 450 && slow && fast) {
        props.solve(boxId, ["pointer:slow-fast-trace"]);
      }
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    const cleanup = () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
    };
    props.signal.addEventListener("abort", cleanup, { once: true });
    return cleanup;
  }, [props.signal, props.solve]);

  return (
    <div className="puzzle puzzle--centered">
      <canvas
        ref={canvasRef}
        className="trace-canvas"
        width="360"
        height="180"
        aria-label={
          props.locale === "ja"
            ? "ゆっくりと速く動かす軌跡"
            : "A trace drawn both slowly and quickly"
        }
      />
      <p className="measurement" aria-live="polite">
        {distance}px
      </p>
      <ProblemGiftBox
        boxId={boxId}
        state={props.problemState(boxId)}
        locale={props.locale}
      />
    </div>
  );
}

export function AnimationTimeStage(props: StageComponentProps) {
  const markerRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const boxId = "S-170-B01";

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    const animation = marker.animate(
      [{ transform: "translateX(0)" }, { transform: "translateX(16rem)" }],
      {
        duration: 2400,
        iterations: Number.POSITIVE_INFINITY,
        direction: "alternate",
      },
    );
    animationRef.current = animation;
    return () => animation.cancel();
  }, []);

  const toggle = () => {
    const animation = animationRef.current;
    if (!animation) return;
    if (animation.playState === "paused") {
      animation.play();
      setProgress(null);
      return;
    }
    animation.pause();
    const value = animation.effect?.getComputedTiming().progress;
    const nextProgress = typeof value === "number" ? value : 0;
    setProgress(nextProgress);
    if (Math.abs(nextProgress - 0.5) <= 0.1) {
      props.solve(boxId, ["animation:paused-midpoint"]);
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="timeline-clue" aria-hidden="true">
        <span ref={markerRef} />
      </div>
      <p className="measurement" aria-live="polite">
        {progress === null ? "…" : `${Math.round(progress * 100)}%`}
      </p>
      <button type="button" className="stage-action" onClick={toggle}>
        {props.locale === "ja" ? "止める / 動かす" : "Pause / play"}
      </button>
      <ProblemGiftBox
        boxId={boxId}
        state={props.problemState(boxId)}
        locale={props.locale}
      />
    </div>
  );
}

export function ClipboardPassStage(props: StageComponentProps) {
  const token = useMemo(
    () => `BOX-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    [],
  );
  const [status, setStatus] = useState("");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(token);
      props.solve("S-180-B01", ["clipboard:written"]);
      setStatus(props.locale === "ja" ? "外へ渡した" : "Sent outside");
    } catch {
      setStatus(props.locale === "ja" ? "コピーできない" : "Copy unavailable");
    }
  };

  const paste = (event: ReactClipboardEvent<HTMLInputElement>) => {
    if (event.clipboardData.getData("text/plain").trim() === token) {
      props.solve("S-180-B02", ["clipboard:pasted"]);
      setStatus(props.locale === "ja" ? "同じ印が戻った" : "The mark returned");
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        <ProblemGiftBox
          boxId="S-180-B01"
          state={props.problemState("S-180-B01")}
          locale={props.locale}
        />
        <ProblemGiftBox
          boxId="S-180-B02"
          state={props.problemState("S-180-B02")}
          locale={props.locale}
        />
      </div>
      <code className="clipboard-token">{token}</code>
      <button
        type="button"
        className="stage-action"
        onClick={() => void copy()}
      >
        {props.locale === "ja" ? "印をコピー" : "Copy the mark"}
      </button>
      <label className="paste-target">
        {props.locale === "ja" ? "ここへ貼り付ける" : "Paste it here"}
        <input type="text" onPaste={paste} autoComplete="off" />
      </label>
      <p className="interaction-status" role="status">
        {status}
      </p>
    </div>
  );
}

interface TrailState {
  busyboxTrail?: { depth: number; ready: boolean };
}

function currentTrail() {
  const state = window.history.state as TrailState | null;
  return state?.busyboxTrail;
}

export function HistoryTrailStage(props: StageComponentProps) {
  const [depth, setDepth] = useState(() => currentTrail()?.depth ?? 0);
  const boxId = "S-220-B01";

  useEffect(() => {
    const trail = currentTrail();
    setDepth(trail?.depth ?? 0);
    if (trail?.ready && trail.depth === 0) {
      props.solve(boxId, ["history:returned-to-base"]);
    }
  }, [props.solve]);

  const buildTrail = () => {
    const baseUrl = new URL(window.location.href);
    baseUrl.searchParams.delete("trail");
    const baseState = {
      ...(window.history.state as object),
      busyboxTrail: { depth: 0, ready: true },
    };
    window.history.replaceState(baseState, "", baseUrl);
    for (let nextDepth = 1; nextDepth <= 3; nextDepth += 1) {
      const url = new URL(baseUrl);
      url.searchParams.set("trail", String(nextDepth));
      window.history.pushState(
        { ...baseState, busyboxTrail: { depth: nextDepth, ready: true } },
        "",
        url,
      );
    }
    setDepth(3);
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="history-trail" aria-hidden="true">
        {["first", "second", "third"].map((stepName, index) => (
          <span key={stepName} data-active={index < depth} />
        ))}
      </div>
      <button type="button" className="stage-action" onClick={buildTrail}>
        {props.locale === "ja" ? "道を3つ積む" : "Build three steps"}
      </button>
      <p className="measurement">
        {depth === 3
          ? props.locale === "ja"
            ? "ブラウザの戻るを3回"
            : "Use browser Back three times"
          : `${depth} / 3`}
      </p>
      <ProblemGiftBox
        boxId={boxId}
        state={props.problemState(boxId)}
        locale={props.locale}
      />
    </div>
  );
}

export function ViewTransitionStage(props: StageComponentProps) {
  const [step, setStep] = useState(0);
  const boxId = "S-340-B01";
  const tokens = ["◆", "●", "▲"];

  const move = async () => {
    const next = step + 1;
    const transition = document.startViewTransition(() => {
      flushSync(() => setStep(next));
    });
    await transition.finished;
    if (next >= 3) props.solve(boxId, ["view-transition:three-moves"]);
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="transition-tiles" data-step={step % 3} aria-hidden="true">
        {tokens.map((token, index) => (
          <span key={token} style={{ order: (index + step) % 3 }}>
            {token}
          </span>
        ))}
      </div>
      <button
        type="button"
        className="stage-action"
        onClick={() => void move()}
      >
        {props.locale === "ja" ? "形をつなぐ" : "Connect the shapes"}
      </button>
      <p className="measurement">{Math.min(step, 3)} / 3</p>
      <ProblemGiftBox
        boxId={boxId}
        state={props.problemState(boxId)}
        locale={props.locale}
      />
    </div>
  );
}
