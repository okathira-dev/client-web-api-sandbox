import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { statusText } from "../ui/statusLocale";
import { stageText } from "./locale";
import { s210Locale } from "./S-210.locale";

type PeripheralStatus = "idle" | "active" | "unavailable";

interface BadgeNavigator extends Navigator {
  setAppBadge(contents?: number): Promise<void>;
  clearAppBadge(): Promise<void>;
}

/**
 * S-210
 *
 * Gimmick: Advance the app's OS-level badge through one, two, and three.
 * Uses: Badging API.
 * Success: Three sequential setAppBadge calls complete in this attempt.
 * Privacy/Permission: No permission or retained badge value.
 * Cleanup: Clear the app badge on abort or unmount.
 * Human verification: H-005, H-023, H-025
 */
/**
 * S-210
 *
 * 目的: S-210の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S210Stage(props: StageComponentProps) {
  const problem = props.problem("S-210-B01");
  const [level, setLevel] = useState(0);
  const [status, setStatus] = useState<PeripheralStatus>("idle");
  const levelRef = useRef(0);

  useEffect(() => {
    const cleanup = () => {
      const badge = navigator as unknown as Partial<BadgeNavigator>;
      void badge.clearAppBadge?.().catch(() => undefined);
    };
    props.signal.addEventListener("abort", cleanup, { once: true });
    return () => {
      props.signal.removeEventListener("abort", cleanup);
      cleanup();
    };
  }, [props.signal]);

  const advance = async () => {
    const badge = navigator as unknown as BadgeNavigator;
    const next = Math.min(3, levelRef.current + 1);
    try {
      await badge.setAppBadge(next);
      if (props.signal.aborted) {
        void badge.clearAppBadge().catch(() => undefined);
        return;
      }
      levelRef.current = next;
      setLevel(next);
      setStatus("active");
      if (next === 3) problem.solve(["badge:one-two-three"]);
    } catch {
      if (!props.signal.aborted) setStatus("unavailable");
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="badge-preview" aria-hidden="true">
        B<span>{level || "·"}</span>
      </div>
      <button
        type="button"
        className="stage-action"
        onClick={() => void advance()}
      >
        {stageText(props.locale, s210Locale.advanceBadge)}
      </button>
      <p className="interaction-status" role="status">
        {statusText(props.locale, status)}
      </p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
