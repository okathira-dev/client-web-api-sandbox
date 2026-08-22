import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s830Locale } from "./S-830.locale";

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
export default function S830Stage(props: StageComponentProps) {
  const idleProblem = props.problem("S-830-B01");
  const lockProblem = props.problem("S-830-B02");
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
    setStatus(stageText(props.locale, s830Locale.requesting));
    try {
      const permission = await Idle.requestPermission();
      if (permission !== "granted") {
        setStatus(stageText(props.locale, s830Locale.denied));
        return;
      }
      const controller = new AbortController();
      controllerRef.current = controller;
      const detector = new Idle();
      const observe = () => {
        if (controller.signal.aborted) return;
        if (detector.screenState === "locked") {
          lockProblem.solve(["idle-detector:screen-locked"]);
          setStatus(stageText(props.locale, s830Locale.screenLocked));
          return;
        }
        if (
          detector.userState === "idle" &&
          detector.screenState === "unlocked"
        ) {
          idleProblem.solve(["idle-detector:idle-unlocked"]);
          setStatus(stageText(props.locale, s830Locale.idleUnlocked));
        }
      };
      detector.addEventListener("change", observe);
      controller.signal.addEventListener(
        "abort",
        () => detector.removeEventListener("change", observe),
        { once: true },
      );
      if (!controller.signal.aborted) {
        setStatus(stageText(props.locale, s830Locale.watching));
      }
      await detector.start({ threshold: 60_000, signal: controller.signal });
      observe();
    } catch (error: unknown) {
      if ((error as DOMException).name !== "AbortError") {
        setStatus(stageText(props.locale, s830Locale.failed));
      }
    }
  };

  return (
    <div className="puzzle puzzle--centered s830-stage">
      <div className="problem-row">
        <ProblemGiftBox problem={idleProblem} locale={props.locale} />
        <ProblemGiftBox problem={lockProblem} locale={props.locale} />
      </div>
      <p>{stageText(props.locale, s830Locale.intro)}</p>
      <button
        type="button"
        className="stage-action"
        onClick={() => void start()}
      >
        {stageText(props.locale, s830Locale.start)}
      </button>
      <output className="interaction-status" aria-live="polite">
        {status}
      </output>
    </div>
  );
}
