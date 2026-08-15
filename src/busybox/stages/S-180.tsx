import { useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s180Locale } from "./S-180.locale";

type ClipboardStatus =
  | ""
  | "sentReversed"
  | "copyUnavailable"
  | "returnedUpright"
  | "clipboardUnreadable";

/**
 * S-180
 *
 * Gimmick: Copy a reversed name, repair it outside the page, then let the box inspect the clipboard.
 * Uses: Async Clipboard read/write.
 * Success: A click on the box-side check reads exactly `busybox` after this page wrote `xobysub`.
 * Privacy/Permission: Clipboard access is user-initiated; clipboard text is never persisted.
 * Cleanup: The entry-scoped armed flag disappears on exit.
 * Human verification: H-006, H-014, H-020, H-025
 */
/**
 * S-180
 *
 * 目的: S-180の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S180Stage(props: StageComponentProps) {
  const problem = props.problem("S-180-B01");
  const [armed, setArmed] = useState(false);
  const [status, setStatus] = useState<ClipboardStatus>("");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText("xobysub");
      if (props.signal.aborted) return;
      setArmed(true);
      setStatus("sentReversed");
    } catch {
      if (!props.signal.aborted) setStatus("copyUnavailable");
    }
  };

  const inspect = async () => {
    try {
      const value = await navigator.clipboard.readText();
      if (props.signal.aborted) return;
      if (armed && value === "busybox") {
        problem.solve(["clipboard:reversed-repaired"]);
        setStatus("returnedUpright");
      }
    } catch {
      if (!props.signal.aborted) setStatus("clipboardUnreadable");
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <ProblemGiftBox problem={problem} locale={props.locale} />
      <button
        type="button"
        className="stage-action"
        onClick={() => void copy()}
      >
        {stageText(props.locale, s180Locale.copyReversed)}
      </button>
      <button
        type="button"
        className="stage-action"
        onClick={() => void inspect()}
      >
        {stageText(props.locale, s180Locale.inspect)}
      </button>
      <p className="interaction-status" role="status">
        {status
          ? stageText(
              props.locale,
              s180Locale[status as Exclude<ClipboardStatus, "">],
            )
          : null}
      </p>
    </div>
  );
}
