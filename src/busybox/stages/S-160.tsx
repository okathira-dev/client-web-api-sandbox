import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

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

/**
 * S-160
 *
 * Gimmick: Draw one continuous trace containing both slow and fast motion.
 * Uses: Pointer Events, pointer capture, and Canvas 2D.
 * Success: Draw at least 240px over 450ms with samples below 0.25 and above 0.75 px/ms.
 * Privacy/Permission: No permission; pointer samples exist only during the current gesture.
 * Cleanup: Remove every pointer listener and the abort listener on exit.
 * Human verification: H-004, H-020, H-024
 */
export default function S160Stage(props: StageComponentProps) {
  const problem = props.problem("S-160-B01");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [distance, setDistance] = useState(0);

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
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
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
        problem.solve(["pointer:slow-fast-trace"]);
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
    return () => {
      props.signal.removeEventListener("abort", cleanup);
      cleanup();
    };
  }, [problem.solve, props.signal]);

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
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
