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
