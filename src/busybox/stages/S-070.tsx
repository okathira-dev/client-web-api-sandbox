import { useEffect, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/**
 * S-070
 *
 * Gimmick: Network absence becomes a valid browser state rather than an error.
 * Uses: navigator.onLine, online/offline events, and the installed Service Worker.
 * Success: Observe navigator.onLine becoming false.
 * Privacy/Permission: No permission; network contents are never inspected.
 * Cleanup: Remove online and offline listeners on unmount.
 * Human verification: H-005, H-021, H-022, H-025
 */
/**
 * S-070
 *
 * 目的: S-070の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S070Stage(props: StageComponentProps) {
  const problem = props.problem("S-070-B01");
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const observe = () => {
      setOnline(navigator.onLine);
      if (!navigator.onLine) problem.solve(["offline"]);
    };
    window.addEventListener("online", observe);
    window.addEventListener("offline", observe);
    observe();
    return () => {
      window.removeEventListener("online", observe);
      window.removeEventListener("offline", observe);
    };
  }, [problem.solve]);

  return (
    <div className="puzzle puzzle--centered">
      <div
        className={`signal-clue ${online ? "" : "signal-clue--offline"}`}
        aria-hidden="true"
      >
        ⌁
      </div>
      <p role="status">{online ? "•••" : "×"}</p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
