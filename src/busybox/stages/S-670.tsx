import { useCallback, useEffect, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

const mazeRows = [
  "#######",
  "#S#...#",
  "#.#.#.#",
  "#...#E#",
  "#######",
] as const;
const start = { row: 1, column: 1 };

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
      setStatus(
        props.locale === "ja"
          ? "壁。盤面をConsoleへ再表示した。"
          : "Wall; the board was printed again.",
      );
      return;
    }
    setPosition(next);
    renderMaze(next);
    if (target === "E") {
      problem.solve(["console-maze:exit"]);
      setStatus(props.locale === "ja" ? "出口に到達。" : "Exit reached.");
    } else {
      setStatus(
        props.locale === "ja"
          ? "盤面をConsoleへ再表示した。"
          : "Board printed to Console.",
      );
    }
  };

  const reset = () => {
    setPosition(start);
    renderMaze(start);
    setStatus(
      props.locale === "ja" ? "開始位置へ戻した。" : "Reset to the start.",
    );
  };

  return (
    <div className="puzzle puzzle--centered">
      <ProblemGiftBox problem={problem} locale={props.locale} />
      <p className="measurement">
        {position.row}:{position.column}
      </p>
      <fieldset className="stage-actions">
        <legend>{props.locale === "ja" ? "迷路操作" : "Maze controls"}</legend>
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
          {props.locale === "ja" ? "リセット" : "Reset"}
        </button>
      </fieldset>
      <p className="interaction-status" role="status">
        {status ||
          (props.locale === "ja"
            ? "Consoleを開いて盤面を見る。"
            : "Open Console to see the board.")}
      </p>
    </div>
  );
}
