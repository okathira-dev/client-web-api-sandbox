import { useEffect, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s200Locale } from "./S-200.locale";

interface GamepadGesture {
  pressed: number;
  axis: number;
  complete: boolean;
}

export function readGamepadGesture(
  gamepads: readonly (Gamepad | null)[],
): GamepadGesture {
  const gamepad = gamepads.find((candidate) => candidate?.connected);
  if (!gamepad) return { pressed: 0, axis: 0, complete: false };
  const pressed = gamepad.buttons.filter(
    (button) => button.pressed || button.value > 0.75,
  ).length;
  const axis = Math.max(0, ...gamepad.axes.map((value) => Math.abs(value)));
  return { pressed, axis, complete: pressed >= 2 && axis >= 0.65 };
}

/**
 * S-200
 *
 * Gimmick: Hold two controller buttons while displacing an analog axis.
 * Uses: Gamepad API polling and requestAnimationFrame.
 * Success: At least two pressed buttons and an absolute axis value of at least 0.65.
 * Privacy/Permission: Retain only the gesture fact, never controller identity or mapping.
 * Cleanup: Cancel the polling frame and detach the abort listener on exit.
 * Human verification: H-009, H-019, H-025
 */
/**
 * S-200
 *
 * 目的: S-200の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S200Stage(props: StageComponentProps) {
  const problem = props.problem("S-200-B01");
  const [gesture, setGesture] = useState<GamepadGesture>({
    pressed: 0,
    axis: 0,
    complete: false,
  });

  useEffect(() => {
    let frame = 0;
    let previousUpdate = 0;
    const poll = (now: number) => {
      const next = readGamepadGesture(navigator.getGamepads());
      if (now - previousUpdate >= 80 || next.complete) {
        setGesture(next);
        previousUpdate = now;
      }
      if (next.complete) {
        problem.solve(["gamepad:two-buttons-and-axis"]);
        return;
      }
      frame = window.requestAnimationFrame(poll);
    };
    frame = window.requestAnimationFrame(poll);
    const cleanup = () => window.cancelAnimationFrame(frame);
    props.signal.addEventListener("abort", cleanup, { once: true });
    return () => {
      props.signal.removeEventListener("abort", cleanup);
      cleanup();
    };
  }, [problem.solve, props.signal]);

  return (
    <div className="puzzle puzzle--centered">
      <div className="gamepad-meter" aria-hidden="true">
        <span style={{ width: `${Math.min(100, gesture.pressed * 40)}%` }} />
        <span style={{ width: `${Math.round(gesture.axis * 100)}%` }} />
      </div>
      <p className="measurement">
        {stageText(props.locale, s200Locale.pressed)} {gesture.pressed} ·{" "}
        {stageText(props.locale, s200Locale.axis)} {gesture.axis.toFixed(2)}
      </p>
      <p className="interaction-status" role="status">
        {stageText(props.locale, s200Locale.gestureHint)}
      </p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
