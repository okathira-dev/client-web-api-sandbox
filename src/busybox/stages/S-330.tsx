import { useCallback, useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s330Locale } from "./S-330.locale";

/**
 * S-330
 *
 * Gimmick: Acquire a screen wake lock, hide the page, then reacquire after returning.
 * Uses: Screen Wake Lock and Page Visibility APIs.
 * Success: Acquire once, then reacquire after a visibility-triggered release.
 * Privacy/Permission: Request wake lock only from the action; retain no device data.
 * Cleanup: Remove visibility listeners and release any held sentinel on abort or unmount.
 * Human verification: H-005, H-022, H-023, H-025
 */
/**
 * S-330
 *
 * 目的: S-330の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S330Stage(props: StageComponentProps) {
  const acquireProblem = props.problem("S-330-B01");
  const returnProblem = props.problem("S-330-B02");
  const solveAcquire = acquireProblem.solve;
  const solveReturn = returnProblem.solve;
  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const releasedOnce = useRef(false);
  const activeRef = useRef(true);
  const [status, setStatus] = useState("idle");

  const acquire = useCallback(
    async (returning: boolean) => {
      if (document.visibilityState !== "visible" || sentinelRef.current) return;
      try {
        const sentinel = await navigator.wakeLock.request("screen");
        if (!activeRef.current) {
          await sentinel.release();
          return;
        }
        sentinelRef.current = sentinel;
        setStatus(returning ? "reacquired" : "holding");
        (returning ? solveReturn : solveAcquire)([
          returning ? "wake-lock:reacquired" : "wake-lock:acquired",
        ]);
        sentinel.addEventListener(
          "release",
          () => {
            sentinelRef.current = null;
            if (!activeRef.current) return;
            releasedOnce.current = true;
            setStatus("released");
          },
          { once: true },
        );
      } catch {
        if (activeRef.current) setStatus("unavailable");
      }
    },
    [solveAcquire, solveReturn],
  );

  useEffect(() => {
    activeRef.current = true;
    const visibility = () => {
      if (document.visibilityState === "visible" && releasedOnce.current) {
        void acquire(true);
      }
    };
    document.addEventListener("visibilitychange", visibility);
    const cleanup = () => {
      activeRef.current = false;
      document.removeEventListener("visibilitychange", visibility);
      if (sentinelRef.current) void sentinelRef.current.release();
      sentinelRef.current = null;
    };
    props.signal.addEventListener("abort", cleanup, { once: true });
    return () => {
      props.signal.removeEventListener("abort", cleanup);
      cleanup();
    };
  }, [acquire, props.signal]);

  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        <ProblemGiftBox problem={acquireProblem} locale={props.locale} />
        <ProblemGiftBox problem={returnProblem} locale={props.locale} />
      </div>
      <div
        className="wake-light"
        data-active={status === "holding" || status === "reacquired"}
        aria-hidden="true"
      />
      <button
        type="button"
        className="stage-action"
        onClick={() => void acquire(false)}
      >
        {stageText(props.locale, s330Locale.keepAwake)}
      </button>
      <p className="measurement">
        {stageText(props.locale, s330Locale.returnAfterAcquire)}
      </p>
      <p className="interaction-status" role="status">
        {stageText(
          props.locale,
          status === "holding"
            ? s330Locale.holding
            : status === "reacquired"
              ? s330Locale.reacquired
              : status === "released"
                ? s330Locale.released
                : s330Locale.unavailable,
        )}
      </p>
    </div>
  );
}
