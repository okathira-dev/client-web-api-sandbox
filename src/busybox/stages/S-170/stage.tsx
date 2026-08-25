import ScheduleOutlined from "@mui/icons-material/ScheduleOutlined";
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

/**
 * S-170
 *
 * 目的: 「止まった時間」で、B01「時間の箱」に対応する実際のブラウザ状態・標準UI・端末入力を観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: S-170の判定に必要な実装内のWeb API。共通runtimeは進捗表示だけを担う。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
function S170Stage(props: Props) {
  const problem = props.boxes[manifest.box.B01];
  const markerRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

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
      problem.solve();
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
        {stageText(props.locale, locale.pausePlay)}
      </button>
      <StageProblemGiftBox box={problem} locale={props.locale} />
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: ScheduleOutlined,
      color: "#fbbf24",
      label: locale.B01,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      "animate" in Element.prototype ? "available" : "unsupported",
    ),
  Component: S170Stage,
});
