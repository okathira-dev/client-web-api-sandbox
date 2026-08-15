import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s160Locale } from "./S-160.locale";

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
 * Human verification: H-004, H-020, H-024, H-025
 */
/**
 * S-160
 *
 * 目的: S-160の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
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
        aria-label={stageText(props.locale, s160Locale.traceLabel)}
      />
      <p className="measurement" aria-live="polite">
        {distance}px
      </p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
