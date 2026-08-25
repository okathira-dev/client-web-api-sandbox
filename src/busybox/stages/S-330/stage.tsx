import KeyboardReturnOutlined from "@mui/icons-material/KeyboardReturnOutlined";
import WbSunnyOutlined from "@mui/icons-material/WbSunnyOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useCallback, useEffect, useRef, useState } from "react";
import { stageText } from "../locale";
import { locale } from "./locale";

/**
 * S-330
 *
 * 目的: 「消えない灯り」で、B01「灯りを保つ箱」、B02「灯りを戻す箱」に対応する実際のブラウザ状態・標準UI・端末入力を観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: S-330の判定に必要な実装内のWeb API。共通runtimeは進捗表示だけを担う。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
function S330Stage(props: Props) {
  const acquireProblem = props.boxes[manifest.box.B01];
  const returnProblem = props.boxes[manifest.box.B02];
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
        (returning ? solveReturn : solveAcquire)();
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
        <StageProblemGiftBox box={acquireProblem} locale={props.locale} />
        <StageProblemGiftBox box={returnProblem} locale={props.locale} />
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
        {stageText(props.locale, locale.keepAwake)}
      </button>
      <p className="measurement">
        {stageText(props.locale, locale.returnAfterAcquire)}
      </p>
      <p className="interaction-status" role="status">
        {stageText(
          props.locale,
          status === "holding"
            ? locale.holding
            : status === "reacquired"
              ? locale.reacquired
              : status === "released"
                ? locale.released
                : locale.unavailable,
        )}
      </p>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: WbSunnyOutlined,
      color: "#facc15",
      label: locale.B01,
    },
    [manifest.box.B02]: {
      icon: KeyboardReturnOutlined,
      color: "#fde68a",
      label: locale.B02,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      isSecureContext && "wakeLock" in navigator ? "available" : "unsupported",
    ),
  Component: S330Stage,
});
