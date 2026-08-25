import HourglassEmptyOutlined from "@mui/icons-material/HourglassEmptyOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useEffect, useRef, useState } from "react";
import { stageText } from "../locale";
import { locale } from "./locale";

/**
 * S-830 — IdleDetectorが返す実idle/unlockedとscreen lockedを別々の箱へ記録する。
 * 目的: timerやvisibilityでは代用できない、OSとbrowserが共同で判断する端末の離席状態を体験する。
 * 最初の一手: 見守りを始めるbuttonからIdle Detectionを許可し、60秒thresholdの実detectorを開始する。
 * 箱ごとの解法: B01は実`userState === "idle"`かつ`screenState === "unlocked"`、B02は実`screenState === "locked"`をchange eventで観測した時だけ開く。順序は問わない。
 * 開かない操作: 60秒timer満了、Page Visibility、blur、画面の見た目だけのlock、synthetic change eventでは開かない。permission拒否は成功にしない。
 * 使用API: Idle Detection API、`IdleDetector.requestPermission()`、`IdleDetector.start()`、AbortSignal。detector stateだけを訪問中に読む。
 * 権限・privacy: Idle Detection許可を明示操作の後だけ求める。離席時刻、入力内容、端末識別子は保存・送信しない。
 * cleanup: stage離脱・再開始でAbortControllerをabortし、change listenerを解除する。lockを観測済みなら既存progressへ直ちに成功を渡す。
 * 対応環境: secure contextでIdleDetectorを提供するbrowser。permission policyやuser拒否ではunsupported / denied状態を説明する。
 * 人手確認: H-057でallow / deny、60秒idle-unlocked、OS lock、復帰、abort、foreground timerだけの負例を確認する。
 */
function S830Stage(props: Props) {
  const idleProblem = props.boxes[manifest.box.B01];
  const lockProblem = props.boxes[manifest.box.B02];
  const controllerRef = useRef<AbortController | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const stop = () => controllerRef.current?.abort();
    props.signal.addEventListener("abort", stop, { once: true });
    return () => {
      props.signal.removeEventListener("abort", stop);
      stop();
    };
  }, [props.signal]);

  const start = async () => {
    const Idle = window.IdleDetector;
    if (!Idle) return;
    controllerRef.current?.abort();
    setStatus(stageText(props.locale, locale.requesting));
    try {
      const permission = await Idle.requestPermission();
      if (permission !== "granted") {
        setStatus(stageText(props.locale, locale.denied));
        return;
      }
      const controller = new AbortController();
      controllerRef.current = controller;
      const detector = new Idle();
      const observe = () => {
        if (controller.signal.aborted) return;
        if (detector.screenState === "locked") {
          lockProblem.solve();
          setStatus(stageText(props.locale, locale.screenLocked));
          return;
        }
        if (
          detector.userState === "idle" &&
          detector.screenState === "unlocked"
        ) {
          idleProblem.solve();
          setStatus(stageText(props.locale, locale.idleUnlocked));
        }
      };
      detector.addEventListener("change", observe);
      controller.signal.addEventListener(
        "abort",
        () => detector.removeEventListener("change", observe),
        { once: true },
      );
      if (!controller.signal.aborted) {
        setStatus(stageText(props.locale, locale.watching));
      }
      await detector.start({ threshold: 60_000, signal: controller.signal });
      observe();
    } catch (error: unknown) {
      if ((error as DOMException).name !== "AbortError") {
        setStatus(stageText(props.locale, locale.failed));
      }
    }
  };

  return (
    <div className="puzzle puzzle--centered s830-stage">
      <div className="problem-row">
        <StageProblemGiftBox box={idleProblem} locale={props.locale} />
        <StageProblemGiftBox box={lockProblem} locale={props.locale} />
      </div>
      <p>{stageText(props.locale, locale.intro)}</p>
      <button
        type="button"
        className="stage-action"
        onClick={() => void start()}
      >
        {stageText(props.locale, locale.start)}
      </button>
      <output className="interaction-status" aria-live="polite">
        {status}
      </output>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: HourglassEmptyOutlined,
      color: "#94a3b8",
      label: locale.B01,
    },
    [manifest.box.B02]: {
      icon: LockOutlined,
      color: "#334155",
      label: locale.B02,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      isSecureContext && window.IdleDetector
        ? "permission-required"
        : "unsupported",
    ),
  Component: S830Stage,
});
