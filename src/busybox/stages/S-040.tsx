import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/**
 * S-040
 *
 * Gimmick: Page Visibility makes time spent unobserved the input.
 * Uses: Page Visibility API and visibilitychange.
 * Success: Return after the document remained hidden for two seconds and 25 minutes.
 * Privacy/Permission: No permission; only the threshold fact is retained.
 * Cleanup: Remove visibilitychange listeners on unmount or stage abort.
 * Human verification: H-013, H-022, H-025
 */
/**
 * S-040
 *
 * 目的: S-040の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S040Stage(props: StageComponentProps) {
  const hiddenAt = useRef<number | null>(null);
  const [hiddenSeconds, setHiddenSeconds] = useState(0);
  const problem = props.problem("S-040-B01");
  const longProblem = props.problem("S-040-B02");

  useEffect(() => {
    const observeVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt.current = performance.now();
        return;
      }
      if (hiddenAt.current !== null) {
        const duration = performance.now() - hiddenAt.current;
        setHiddenSeconds(Math.floor(duration / 1000));
        if (duration >= 2000) problem.solve(["hidden:2s"]);
        if (duration >= 25 * 60 * 1000) longProblem.solve(["hidden:25m"]);
        hiddenAt.current = null;
      }
    };
    document.addEventListener("visibilitychange", observeVisibility);
    props.signal.addEventListener(
      "abort",
      () => document.removeEventListener("visibilitychange", observeVisibility),
      { once: true },
    );
    return () =>
      document.removeEventListener("visibilitychange", observeVisibility);
  }, [longProblem.solve, problem.solve, props.signal]);

  return (
    <div className="puzzle puzzle--centered">
      <div className="eye-clue" aria-hidden="true">
        ◉
      </div>
      <p className="measurement" aria-live="polite">
        {hiddenSeconds || "…"}
      </p>
      <div className="problem-row">
        <ProblemGiftBox problem={problem} locale={props.locale} />
        <ProblemGiftBox problem={longProblem} locale={props.locale} />
      </div>
    </div>
  );
}
