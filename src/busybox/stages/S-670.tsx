import { useCallback, useEffect, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s670Locale } from "./S-670.locale";

const mazeRows = [
  "#######",
  "#S#...#",
  "#.#.#.#",
  "#...#E#",
  "#######",
] as const;
const start = { row: 1, column: 1 };

/**
 * S-670 — Consoleへ出すread-only迷路と、ページ側の入力を分離する。
 * 目的: Console APIを表示面として使い、プレイヤーはページの方向ボタンだけで迷路を解く。
 * 最初の一手: ConsoleのSからEまでを読み、上下左右を順に押す。
 * 箱ごとの成功条件: B01は壁を越えずにEへ到達した状態だけで開く。
 * 開かない操作: Console入力、DevTools編集、盤面文字列の書き換え、壁への移動では開かない。
 * API/権限: console.logと通常のbutton/keydown。権限・保存・送信はない。
 * cleanup/環境: Console表示は再描画時に更新し、listenerはAbortSignalで外す。H-001/H-002/H-003/H-004/H-020/H-025/H-036を確認する。
 */
/**
 * S-670
 *
 * 目的: S-670の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S670Stage(props: StageComponentProps) {
  const problem = props.problem("S-670-B01");
  const [position, setPosition] = useState(start);
  const [status, setStatus] = useState("");

  const renderMaze = useCallback((next: typeof start) => {
    const board = mazeRows.map((row) => [...row]);
    const row = board[next.row];
    if (row) row[next.column] = "@";
    console.info(
      `Busybox S-670 maze\n${board.map((line) => line.join("")).join("\n")}`,
    );
  }, []);

  useEffect(() => {
    renderMaze(start);
  }, [renderMaze]);

  const move = (rowOffset: number, columnOffset: number) => {
    const next = {
      row: position.row + rowOffset,
      column: position.column + columnOffset,
    };
    const target = mazeRows[next.row]?.[next.column];
    if (!target || target === "#") {
      renderMaze(position);
      setStatus(stageText(props.locale, s670Locale.wall));
      return;
    }
    setPosition(next);
    renderMaze(next);
    if (target === "E") {
      problem.solve(["console-maze:exit"]);
      setStatus(stageText(props.locale, s670Locale.exit));
    } else {
      setStatus(stageText(props.locale, s670Locale.printed));
    }
  };

  const reset = () => {
    setPosition(start);
    renderMaze(start);
    setStatus(stageText(props.locale, s670Locale.resetStatus));
  };

  return (
    <div className="puzzle puzzle--centered">
      <ProblemGiftBox problem={problem} locale={props.locale} />
      <p className="measurement">
        {position.row}:{position.column}
      </p>
      <fieldset className="stage-actions">
        <legend>{stageText(props.locale, s670Locale.controls)}</legend>
        <button
          type="button"
          className="stage-action"
          onClick={() => move(-1, 0)}
        >
          ↑
        </button>
        <button
          type="button"
          className="stage-action"
          onClick={() => move(0, -1)}
        >
          ←
        </button>
        <button
          type="button"
          className="stage-action"
          onClick={() => move(1, 0)}
        >
          ↓
        </button>
        <button
          type="button"
          className="stage-action"
          onClick={() => move(0, 1)}
        >
          →
        </button>
        <button type="button" className="stage-action" onClick={reset}>
          {stageText(props.locale, s670Locale.reset)}
        </button>
      </fieldset>
      <p className="interaction-status" role="status">
        {status || stageText(props.locale, s670Locale.initial)}
      </p>
    </div>
  );
}
