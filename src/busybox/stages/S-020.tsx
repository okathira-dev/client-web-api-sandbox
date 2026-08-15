import { useEffect, useMemo, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/**
 * S-020
 *
 * Gimmick: The browser viewport itself is the input.
 * Uses: innerWidth and the window resize event.
 * Success: Resize within 18px of a target 80px away from the entry width.
 * Privacy/Permission: No permission; only the success fact is retained.
 * Cleanup: Remove the resize listener on unmount or stage abort.
 * Human verification: H-001, H-002, H-003, H-025
 */
/**
 * S-020
 *
 * 目的: S-020の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S020Stage(props: StageComponentProps) {
  const initialWidth = useRef(window.innerWidth);
  const targetWidth = useMemo(
    () =>
      initialWidth.current <= 420
        ? initialWidth.current + 80
        : initialWidth.current - 80,
    [],
  );
  const [width, setWidth] = useState(window.innerWidth);
  const problem = props.problem("S-020-B01");
  const meterMin = Math.min(initialWidth.current, targetWidth) - 100;
  const meterMax = Math.max(initialWidth.current, targetWidth) + 100;

  useEffect(() => {
    const observe = () => {
      const nextWidth = window.innerWidth;
      setWidth(nextWidth);
      if (Math.abs(nextWidth - targetWidth) <= 18) {
        problem.solve(["viewport-resized"]);
      }
    };
    window.addEventListener("resize", observe);
    props.signal.addEventListener(
      "abort",
      () => window.removeEventListener("resize", observe),
      { once: true },
    );
    return () => window.removeEventListener("resize", observe);
  }, [problem.solve, props.signal, targetWidth]);

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
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
