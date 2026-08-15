import { useEffect, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { statusText } from "../ui/statusLocale";
import { stageText } from "./locale";
import { s090Locale } from "./S-090.locale";

/**
 * S-090
 *
 * Gimmick: A system notification carries the player outside the page and back.
 * Uses: Notifications API and Service Worker notifications.
 * Success: Return through the Service Worker notification-click URL.
 * Privacy/Permission: Request notification permission only from the explicit button.
 * Cleanup: Ignore late permission work, close a late notification, and consume the return query.
 * Human verification: H-005, H-006, H-023, H-025
 */
/**
 * S-090
 *
 * 目的: S-090の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S090Stage(props: StageComponentProps) {
  const problem = props.problem("S-090-B01");
  const [status, setStatus] = useState<NotificationPermission | "unavailable">(
    Notification.permission,
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("notification") === "1") {
      problem.solve(["notification-click"]);
      url.searchParams.delete("notification");
      window.history.replaceState({}, "", url);
    }
  }, [problem.solve]);

  const sendNotification = async () => {
    // Permission and notification creation stay inside this click handler because
    // browsers require a user gesture and surprise prompts would violate the UX policy.
    try {
      const permission = await Notification.requestPermission();
      if (props.signal.aborted) return;
      setStatus(permission);
      if (permission !== "granted") return;
      const registration = await navigator.serviceWorker.ready;
      if (props.signal.aborted) return;
      const tag = "busybox-stage-S-090";
      await registration.showNotification("Busybox", {
        body: stageText(props.locale, s090Locale.outsideBody),
        icon: "./icon.svg",
        tag,
      });
      if (props.signal.aborted) {
        const notifications = await registration.getNotifications({ tag });
        for (const notification of notifications) notification.close();
      }
    } catch {
      if (!props.signal.aborted) setStatus("unavailable");
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="bell-clue" aria-hidden="true">
        ♢
      </div>
      <button
        type="button"
        className="stage-action"
        onClick={() => void sendNotification()}
      >
        {stageText(props.locale, s090Locale.callOutside)}
      </button>
      <p role="status">{statusText(props.locale, status)}</p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
