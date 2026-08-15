import { useEffect, useRef } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s150Locale } from "./S-150.locale";

const selectOptions = [
  ...Array.from(
    { length: 24 },
    (_, index) => `item-${String(index + 1).padStart(2, "0")}`,
  ),
  "open busybox",
  ...Array.from(
    { length: 24 },
    (_, index) => `item-${String(index + 25).padStart(2, "0")}`,
  ),
];

/**
 * S-150 — keyboard paths.
 *
 * B01 is a visible native button that does not receive pointer activation.
 * A player must reach it with the browser's focus navigation. The box opens
 * from the trusted focus event; script focus and pointer clicks are not part
 * of the intended solution.
 *
 * B02 is a native select with one meaningful option hidden among decoys. Its
 * incremental-search/typeahead behavior is the puzzle: focus the select and
 * type `open` until the target option is selected. The box opens only after
 * the native select reports that selection.
 *
 * B03 keeps the browser's native named-details exclusivity. Open more than
 * one disclosure in sequence and observe that the browser closes the prior
 * one, leaving exactly one open at a time.
 *
 * No permissions or persistent data are used. All listeners are removed when
 * the stage is left. Human verification: H-001, H-002, H-003, H-020, H-025.
 */
/**
 * S-150
 *
 * 目的: S-150の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S150Stage(props: StageComponentProps) {
  const focusProblem = props.problem("S-150-B01");
  const selectProblem = props.problem("S-150-B02");
  const detailsProblem = props.problem("S-150-B03");
  const detailsRef = useRef<HTMLDivElement>(null);
  const detailToggleCount = useRef(0);

  useEffect(() => {
    const container = detailsRef.current;
    if (!container) return;
    const details = Array.from(container.querySelectorAll("details"));
    const inspect = () => {
      detailToggleCount.current += 1;
      const openCount = details.filter((item) => item.open).length;
      if (detailToggleCount.current > 1 && openCount === 1)
        detailsProblem.solve(["details:exclusive-toggle"]);
    };
    details.forEach((item) => {
      item.addEventListener("toggle", inspect);
    });
    return () => {
      details.forEach((item) => {
        item.removeEventListener("toggle", inspect);
      });
    };
  }, [detailsProblem.solve]);

  return (
    <div className="puzzle puzzle--centered accessibility-puzzle">
      <p className="measurement">{stageText(props.locale, s150Locale.clue)}</p>
      <button
        type="button"
        className="stage-action accessibility-keyboard-button"
        onFocus={() => focusProblem.solve(["focus:native"])}
        onClick={() => focusProblem.solve(["activation:keyboard"])}
      >
        {stageText(props.locale, s150Locale.focusButton)}
      </button>
      <label className="accessibility-select">
        {stageText(props.locale, s150Locale.selectLabel)}
        <select
          defaultValue=""
          onChange={(event) => {
            if (event.currentTarget.value === "open busybox")
              selectProblem.solve(["select:typeahead"]);
          }}
        >
          <option value="" disabled>
            {stageText(props.locale, s150Locale.selectPlaceholder)}
          </option>
          {selectOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <div ref={detailsRef} className="accessibility-details">
        {(["A", "B", "C"] as const).map((name) => (
          <details key={name} name="busybox-exclusive-details">
            <summary>{name}</summary>
            <p>{name}</p>
          </details>
        ))}
      </div>
      <div className="problem-row">
        <ProblemGiftBox problem={focusProblem} locale={props.locale} />
        <ProblemGiftBox problem={selectProblem} locale={props.locale} />
        <ProblemGiftBox problem={detailsProblem} locale={props.locale} />
      </div>
    </div>
  );
}
