import { useEffect, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { statusText } from "../ui/statusLocale";
import { stageText } from "./locale";
import { s410Locale } from "./S-410.locale";

/** S-410 — repeat left/right notification actions; the worker returns only after the exact sequence. H-005/H-006/H-023. */
/**
 * S-410
 *
 * 目的: S-410の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S410Stage(props: StageComponentProps) {
  const problem = props.problem("S-410-B01");
  const [status, setStatus] = useState(Notification.permission);
  useEffect(() => {
    const url = new URL(location.href);
    if (url.searchParams.get("notification-sequence") === "S-410-ok") {
      problem.solve(["notification-actions:sequence"]);
      url.searchParams.delete("notification-sequence");
      history.replaceState(history.state, "", url);
    }
  }, [problem.solve]);
  const begin = async () => {
    const permission = await Notification.requestPermission();
    setStatus(permission);
    if (permission !== "granted" || props.signal.aborted) return;
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification("Busybox · ◀ ▶", {
      body: stageText(props.locale, s410Locale.notificationBody),
      tag: "busybox-S-410",
      actions: [
        { action: "left", title: "←" },
        { action: "right", title: "→" },
      ],
      data: { stage: "S-410", sequence: "", target: "LRRL" },
    } as NotificationOptions);
  };
  return (
    <div className="puzzle puzzle--centered">
      <ProblemGiftBox problem={problem} locale={props.locale} />
      <button
        type="button"
        className="stage-action"
        onClick={() => void begin()}
      >
        {stageText(props.locale, s410Locale.beginNotifications)}
      </button>
      <p role="status">{statusText(props.locale, status)}</p>
    </div>
  );
}
