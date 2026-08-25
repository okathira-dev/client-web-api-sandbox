import AspectRatioOutlined from "@mui/icons-material/AspectRatioOutlined";
import { useEffect, useMemo, useRef, useState } from "react";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { locale } from "./locale";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

/**
 * 目的: viewport幅の変化を観測する。
 * 最初の一手: ブラウザ幅を調整する。
 * 箱ごとの解法: B01の目標幅へ合わせる。
 * 開かない操作: 表示値だけの変更や合成イベント。
 * API/権限: viewportとresize eventを使い、権限は不要。
 * cleanup/環境: 離脱時にlistenerを外し、resize可能な環境で動作する。
 * 人手確認: H-001。
 */
function S020Stage(props: Props) {
  const initialWidth = useRef(window.innerWidth);
  const targetWidth = useMemo(
    () =>
      initialWidth.current <= 420
        ? initialWidth.current + 80
        : initialWidth.current - 80,
    [],
  );
  const [width, setWidth] = useState(window.innerWidth);
  const box = props.boxes[manifest.box.B01];
  const meterMin = Math.min(initialWidth.current, targetWidth) - 100;
  const meterMax = Math.max(initialWidth.current, targetWidth) + 100;

  useEffect(() => {
    const observe = () => {
      const nextWidth = window.innerWidth;
      setWidth(nextWidth);
      if (Math.abs(nextWidth - targetWidth) <= 18) box.solve();
    };
    window.addEventListener("resize", observe);
    props.signal.addEventListener(
      "abort",
      () => window.removeEventListener("resize", observe),
      { once: true },
    );
    return () => window.removeEventListener("resize", observe);
  }, [box, props.signal, targetWidth]);

  return (
    <div className="puzzle puzzle--centered">
      <div className="resize-ruler" aria-hidden="true">
        <span
          className="resize-ruler__fill"
          style={{ width: `${Math.min(100, (width / targetWidth) * 100)}%` }}
        />
      </div>
      <p className="measurement" aria-live="polite">
        {width} → {targetWidth}
      </p>
      <meter
        min={meterMin}
        max={meterMax}
        optimum={targetWidth}
        value={Math.min(meterMax, Math.max(meterMin, width))}
      >
        {width}
      </meter>
      <StageProblemGiftBox box={box} locale={props.locale} />
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: AspectRatioOutlined,
      color: "#818cf8",
      label: locale.B01,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      "ResizeObserver" in window ? "available" : "unsupported",
    ),
  Component: S020Stage,
});
