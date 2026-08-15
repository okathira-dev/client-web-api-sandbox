import { useEffect } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s030Locale } from "./S-030.locale";

/**
 * S-030 — DOM Selectionそのものを回答として使う。
 * 目的: 入力欄へ入力するのではなく、文章中の指定語をnative Selectionで選ぶ。
 * 最初の一手: 角括弧内の一語をマウスまたはキーボードで選択する。
 * 箱ごとの成功条件: B01はlocalizedな対象語だけが選択範囲になった時に開く。
 * 開かない操作: 入力欄への入力、script製ハイライト、句読点を含む選択、DevTools編集では開かない。
 * API/権限: Selection APIとselectionchange。権限・保存・送信はない。
 * cleanup/環境: selectionchange listenerを離脱時に外し、選択文字列を保存しない。H-001/H-003/H-020/H-025を確認する。
 */
/**
 * S-030
 *
 * 目的: S-030の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S030Stage(props: StageComponentProps) {
  const answer = stageText(props.locale, s030Locale.answer);
  const problem = props.problem("S-030-B01");

  useEffect(() => {
    const observeSelection = () => {
      if (document.getSelection()?.toString().trim().toLowerCase() === answer) {
        problem.solve(["selection"]);
      }
    };
    document.addEventListener("selectionchange", observeSelection);
    props.signal.addEventListener(
      "abort",
      () => document.removeEventListener("selectionchange", observeSelection),
      { once: true },
    );
    return () =>
      document.removeEventListener("selectionchange", observeSelection);
  }, [answer, problem.solve, props.signal]);

  return (
    <div className="puzzle puzzle--centered selection-puzzle">
      <p>
        [ <strong>{answer}</strong> ]
      </p>
      <p>{stageText(props.locale, s030Locale.sentence)}</p>
      <div className="problem-row">
        <ProblemGiftBox problem={problem} locale={props.locale} />
      </div>
    </div>
  );
}
