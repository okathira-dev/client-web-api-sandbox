import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { statusText } from "../ui/statusLocale";
import { stageText } from "./locale";
import { s100Locale } from "./S-100.locale";

type InteractionState = "idle" | "active" | "denied" | "unavailable";

interface PermissionAwareOrientationEvent {
  requestPermission?: () => Promise<"granted" | "denied">;
}

/**
 * S-100
 *
 * 目的: 「傾けて止める」で、B01「端末姿勢の箱」に対応する実際のブラウザ状態・標準UI・端末入力を観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: S-100の判定に必要な実装内のWeb API。共通runtimeは進捗表示だけを担う。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S100Stage(props: StageComponentProps) {
  const problem = props.problem("S-100-B01");
  const [status, setStatus] = useState<InteractionState>("idle");
  const [tilt, setTilt] = useState({ beta: 0, gamma: 0 });
  const cleanupRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    const cleanup = () => cleanupRef.current();
    props.signal.addEventListener("abort", cleanup, { once: true });
    return () => {
      props.signal.removeEventListener("abort", cleanup);
      cleanup();
    };
  }, [props.signal]);

  const start = async () => {
    cleanupRef.current();
    try {
      const orientation =
        DeviceOrientationEvent as unknown as PermissionAwareOrientationEvent;
      if (orientation.requestPermission) {
        const permission = await orientation.requestPermission();
        if (props.signal.aborted) return;
        if (permission !== "granted") {
          setStatus("denied");
          return;
        }
      }

      let targetSince: number | null = null;
      const observe = (event: DeviceOrientationEvent) => {
        const beta = event.beta ?? 0;
        const gamma = event.gamma ?? 0;
        setTilt({ beta, gamma });
        const onTarget = Math.abs(beta - 45) <= 12 && Math.abs(gamma) <= 12;
        if (!onTarget) {
          targetSince = null;
        } else if (targetSince === null) {
          targetSince = performance.now();
        } else if (performance.now() - targetSince >= 1000) {
          problem.solve(["orientation:held"]);
        }
      };
      window.addEventListener("deviceorientation", observe);
      cleanupRef.current = () =>
        window.removeEventListener("deviceorientation", observe);
      setStatus("active");
    } catch {
      if (!props.signal.aborted) setStatus("unavailable");
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <div
        className="tilt-clue"
        style={{ transform: `rotate(${tilt.gamma}deg)` }}
        aria-hidden="true"
      >
        ▰
      </div>
      <p className="measurement">
        β {Math.round(tilt.beta)}° · γ {Math.round(tilt.gamma)}°
      </p>
      <button
        type="button"
        className="stage-action"
        onClick={() => void start()}
      >
        {stageText(props.locale, s100Locale.senseOrientation)}
      </button>
      <p className="interaction-status" role="status">
        {statusText(props.locale, status)}
      </p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
