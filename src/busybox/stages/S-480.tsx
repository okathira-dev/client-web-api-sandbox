import { useEffect, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/** S-480 — classify browser preferred default text size into four stable bands. H-003/H-004/H-023. */
/**
 * S-480
 *
 * 目的: S-480の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S480Stage(props: StageComponentProps) {
  const problems = [
    props.problem("S-480-B01"),
    props.problem("S-480-B02"),
    props.problem("S-480-B03"),
    props.problem("S-480-B04"),
  ] as const;
  const [solveSmall, solveStandard, solveLarge, solveExtraLarge] = problems.map(
    (problem) => problem.solve,
  );
  const [size, setSize] = useState(0);
  useEffect(() => {
    const probe = document.createElement("span");
    probe.style.cssText =
      "position:absolute;visibility:hidden;font-size:1rem;line-height:1";
    probe.textContent = "M";
    document.body.append(probe);
    const inspect = () => {
      const pixels = Number.parseFloat(getComputedStyle(probe).fontSize);
      setSize(pixels);
      const band = pixels < 15 ? 0 : pixels < 18 ? 1 : pixels < 22 ? 2 : 3;
      if (band === 0) solveSmall?.(["text-scale:band-1"]);
      if (band === 1) solveStandard?.(["text-scale:band-2"]);
      if (band === 2) solveLarge?.(["text-scale:band-3"]);
      if (band === 3) solveExtraLarge?.(["text-scale:band-4"]);
    };
    inspect();
    const observer = new ResizeObserver(inspect);
    observer.observe(probe);
    return () => {
      observer.disconnect();
      probe.remove();
    };
  }, [solveExtraLarge, solveLarge, solveSmall, solveStandard]);
  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        {problems.map((problem) => (
          <ProblemGiftBox
            key={problem.definition.id}
            problem={problem}
            locale={props.locale}
          />
        ))}
      </div>
      <p className="measurement">{size.toFixed(1)}px</p>
    </div>
  );
}
