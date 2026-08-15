import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s170Locale } from "./S-170.locale";

/**
 * S-170
 *
 * Gimmick: Pause a browser-owned animation near its temporal midpoint.
 * Uses: Web Animations API and computed timing progress.
 * Success: Pause while the iteration progress is within 0.1 of 0.5.
 * Privacy/Permission: No permission or retained timing samples.
 * Cleanup: Cancel the Animation object on unmount.
 * Human verification: H-001, H-002, H-003, H-020, H-025
 */
/**
 * S-170
 *
 * 目的: S-170の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S170Stage(props: StageComponentProps) {
  const problem = props.problem("S-170-B01");
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
      problem.solve(["animation:paused-midpoint"]);
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
        {stageText(props.locale, s170Locale.pausePlay)}
      </button>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
