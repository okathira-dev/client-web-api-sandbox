import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s660Locale } from "./S-660.locale";

function boxIndexFor(state: PressureState) {
  if (state === "nominal") return 0;
  if (state === "critical") return 2;
  return 1;
}

/**
 * S-660 — Compute Pressureの状態を負荷計ではなくbrowserの状態hintとして読む。
 * 目的: nominal、fair/serious、criticalの3箱を、ゲーム側の負荷なしで観測する。
 * 最初の一手: stageへ入ったまま自動購読を待ち、必要なら別作業負荷の変化を観察する。
 * 箱ごとの成功条件: B01はnominal、B02はfairまたはserious、B03はcriticalをPressureObserverから受けた時に開く。
 * 開かない操作: CPUをbusybox側で意図的に消費する、割合を推定する、status文字列を書き換える操作では開かない。
 * API/権限: PressureObserverのcpu source。権限・入力値・状態履歴は保存・送信しない。
 * cleanup/環境: hiddenでdisconnectし、visibleで再購読する。対応環境とPermissions Policyを含めH-004/H-019/H-023/H-025/H-035を確認する。
 */
/**
 * S-660
 *
 * 目的: S-660の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S660Stage(props: StageComponentProps) {
  const problems = useMemo(
    () =>
      [
        props.problem("S-660-B01"),
        props.problem("S-660-B02"),
        props.problem("S-660-B03"),
      ] as const,
    [props.problem],
  );
  const observer = useRef<PressureObserver | null>(null);
  const [state, setState] = useState<PressureState | "waiting">("waiting");
  const [status, setStatus] = useState("");

  const stop = useCallback(() => {
    observer.current?.disconnect();
    observer.current = null;
  }, []);

  useEffect(() => {
    let disposed = false;
    const observe = async () => {
      if (disposed || observer.current || document.visibilityState === "hidden")
        return;
      const Constructor = window.PressureObserver;
      if (!Constructor?.knownSources.includes("cpu")) {
        setStatus(stageText(props.locale, s660Locale.unavailable));
        return;
      }
      const instance = new Constructor((records) => {
        const latest = records.at(-1)?.state;
        if (!latest) return;
        setState(latest);
        problems[boxIndexFor(latest)]?.solve([`cpu:${latest}`]);
        setStatus(`${stageText(props.locale, s660Locale.cpuPrefix)}=${latest}`);
      });
      observer.current = instance;
      setStatus(stageText(props.locale, s660Locale.observing));
      try {
        await instance.observe("cpu", { sampleInterval: 1_000 });
      } catch {
        if (observer.current === instance) stop();
        setStatus(stageText(props.locale, s660Locale.observeFailed));
      }
    };
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        stop();
        return;
      }
      void observe();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    void observe();
    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      observer.current?.disconnect();
      observer.current = null;
    };
  }, [problems, props.locale, stop]);

  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        {problems.map((problem) => (
          <ProblemGiftBox
            key={problem.definition.id}
            problem={problem}
            locale={props.locale}
          />
        ))}
      </div>
      <p className="measurement">{state}</p>
      <p className="interaction-status" role="status">
        {status || stageText(props.locale, s660Locale.idle)}
      </p>
    </div>
  );
}
