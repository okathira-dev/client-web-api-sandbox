import { useEffect, useMemo, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { statusText } from "../ui/statusLocale";
import { stageText } from "./locale";
import { s240Locale } from "./S-240.locale";

type InteractionState = "idle" | "active" | "cancelled" | "unavailable";

/**
 * S-240
 *
 * Gimmick: Hand an ephemeral mark to an OS share target.
 * Uses: Web Share API.
 * Success: navigator.share resolves after the user completes the share flow.
 * Privacy/Permission: Share only the displayed attempt mark from an explicit action.
 * Cleanup: The mark is discarded with the component; cancellation is not success.
 * Human verification: H-004, H-014, H-025
 */
/**
 * S-240
 *
 * 目的: S-240の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S240Stage(props: StageComponentProps) {
  const problem = props.problem("S-240-B01");
  const targetProblem = props.problem("S-240-B02");
  const mark = useMemo(() => crypto.randomUUID().slice(0, 6).toUpperCase(), []);
  const [status, setStatus] = useState<InteractionState>("idle");
  useEffect(() => {
    const url = new URL(location.href);
    if (url.searchParams.get("share-target") === "1") {
      targetProblem.solve(["web-share-target:received"]);
      url.searchParams.delete("share-target");
      history.replaceState(history.state, "", url);
    }
  }, [targetProblem.solve]);

  const share = async () => {
    try {
      await navigator.share({
        title: "Busybox",
        text: `${stageText(props.locale, s240Locale.shareMark)} ${mark}`,
      });
      if (props.signal.aborted) return;
      // Only a resolved OS flow counts; opening and cancelling the sheet does not.
      problem.solve(["web-share:completed"]);
      setStatus("active");
    } catch (error) {
      if (props.signal.aborted) return;
      setStatus(
        error instanceof DOMException && error.name === "AbortError"
          ? "cancelled"
          : "unavailable",
      );
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <code className="clipboard-token">{mark}</code>
      <button
        type="button"
        className="stage-action"
        onClick={() => void share()}
      >
        {stageText(props.locale, s240Locale.share)}
      </button>
      <p className="interaction-status" role="status">
        {statusText(props.locale, status)}
      </p>
      <div className="problem-row">
        <ProblemGiftBox problem={problem} locale={props.locale} />
        <ProblemGiftBox problem={targetProblem} locale={props.locale} />
      </div>
    </div>
  );
}
