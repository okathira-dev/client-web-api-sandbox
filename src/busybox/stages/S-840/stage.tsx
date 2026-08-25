import SelectAllOutlined from "@mui/icons-material/SelectAllOutlined";
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

const threshold = 0.98;

/**
 * S-840 — 二次元scrollの実IntersectionObserver ratioを0.98以上へ合わせる。
 * 目的: 縦だけでも横だけでも足りない、observer root内の可視比を自分で整える体験を作る。
 * 最初の一手: 大きな平面を縦横にスクロールし、中央から離れた淡い窓を探す。
 * 箱ごとの解法: B01は640×420px rootの中にある616×396pxのtargetを縦横ともほぼ完全に表示し、実IntersectionObserver entryの`intersectionRatio >= 0.98`になると開く。
 * 開かない操作: scrollLeft / scrollTopの値を直接合わせる、横だけまたは縦だけを合わせる、CSSでtargetを隠す、scriptでobserver entryを作る操作では開かない。
 * 使用API: IntersectionObserver、scroll container、KeyboardEvent。observerのrootはこのstageの実scroll rootに固定する。
 * 権限・privacy: 権限、保存、送信は行わない。現在のratioは表示中のlayoutから得るだけで履歴化しない。
 * cleanup: stage離脱時にobserverをdisconnectし、signal abort後のentryを無視する。timerや外部接続は作らない。
 * 対応環境: IntersectionObserverと通常scrollに対応するbrowser。狭いviewportではrootとtargetを同じ24px差で縮める。
 * 人手確認: H-058で0.97台と0.98以上、横だけ／縦だけ、zoom、keyboard、再入場時disconnectを確認する。
 */
function S840Stage(props: Props) {
  const problem = props.boxes[manifest.box.B01];
  const rootRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState(0);
  const [targetSize, setTargetSize] = useState({ width: 616, height: 396 });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const updateTargetSize = () => {
      setTargetSize({
        width: Math.max(180, root.clientWidth - 24),
        height: Math.max(120, root.clientHeight - 24),
      });
    };
    const observer = new ResizeObserver(updateTargetSize);
    observer.observe(root);
    updateTargetSize();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const target = targetRef.current;
    if (!root || !target) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry || props.signal.aborted) return;
        setRatio(entry.intersectionRatio);
        if (entry.intersectionRatio >= threshold) {
          problem.solve();
        }
      },
      { root, threshold: [0, 0.5, 0.9, threshold, 1] },
    );
    observer.observe(target);
    const disconnect = () => observer.disconnect();
    props.signal.addEventListener("abort", disconnect, { once: true });
    return () => {
      props.signal.removeEventListener("abort", disconnect);
      disconnect();
    };
  }, [problem.solve, props.signal]);

  return (
    <div className="puzzle s840-stage">
      <div className="problem-row">
        <StageProblemGiftBox box={problem} locale={props.locale} />
      </div>
      <p>{stageText(props.locale, locale.intro)}</p>
      <div ref={rootRef} className="s840-scroll-root">
        <div className="s840-plane">
          <div
            ref={targetRef}
            className="s840-target"
            style={{ width: targetSize.width, height: targetSize.height }}
            aria-hidden="true"
          />
        </div>
      </div>
      <p className="measurement" aria-live="polite">
        {stageText(props.locale, locale.ratio)}: {(ratio * 100).toFixed(1)}%
        {ratio >= threshold
          ? ` — ${stageText(props.locale, locale.aligned)}`
          : ""}
      </p>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: SelectAllOutlined,
      color: "#2dd4bf",
      label: locale.B01,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      "IntersectionObserver" in window ? "available" : "unsupported",
    ),
  Component: S840Stage,
});
