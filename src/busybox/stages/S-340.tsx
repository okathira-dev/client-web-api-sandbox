import { useState } from "react";
import { flushSync } from "react-dom";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s340Locale } from "./S-340.locale";

/**
 * S-340
 *
 * Gimmick: Reorder three shapes across browser-managed view transitions.
 * Uses: View Transition API and synchronous React commit inside its callback.
 * Success: Finish three transitions during the current attempt.
 * Privacy/Permission: No permission or retained transition state.
 * Cleanup: Await each transition; the browser owns transition pseudo-elements.
 * Human verification: H-001, H-002, H-003, H-020, H-025
 */
/**
 * S-340
 *
 * 目的: S-340の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S340Stage(props: StageComponentProps) {
  const problem = props.problem("S-340-B01");
  const [step, setStep] = useState(0);
  const tokens = ["◆", "●", "▲"];

  const move = async () => {
    const next = step + 1;
    const transition = document.startViewTransition(() => {
      flushSync(() => setStep(next));
    });
    await transition.finished;
    if (props.signal.aborted) return;
    if (next >= 3) problem.solve(["view-transition:three-moves"]);
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="transition-tiles" data-step={step % 3} aria-hidden="true">
        {tokens.map((token, index) => (
          <span key={token} style={{ order: (index + step) % 3 }}>
            {token}
          </span>
        ))}
      </div>
      <button
        type="button"
        className="stage-action"
        onClick={() => void move()}
      >
        {stageText(props.locale, s340Locale.connectShapes)}
      </button>
      <p className="measurement">{Math.min(step, 3)} / 3</p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
