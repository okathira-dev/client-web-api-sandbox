import RouteOutlined from "@mui/icons-material/RouteOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useEffect, useRef, useState } from "react";
import { stageText } from "../locale";
import { locale } from "./locale";

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
 * 目的: 「速さの軌跡」で、B01「入力軌跡の箱」に対応する実際のブラウザ状態・標準UI・端末入力を観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: S-160の判定に必要な実装内のWeb API。共通runtimeは進捗表示だけを担う。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
function S160Stage(props: Props) {
  const problem = props.boxes[manifest.box.B01];
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
        problem.solve();
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
        aria-label={stageText(props.locale, locale.traceLabel)}
      />
      <p className="measurement" aria-live="polite">
        {distance}px
      </p>
      <StageProblemGiftBox box={problem} locale={props.locale} />
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: RouteOutlined,
      color: "#38bdf8",
      label: locale.B01,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      "PointerEvent" in window ? "available" : "unsupported",
    ),
  Component: S160Stage,
});
