import SportsEsportsOutlined from "@mui/icons-material/SportsEsportsOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useEffect, useState } from "react";
import { stageText } from "../locale";
import { locale } from "./locale";

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
 * 目的: 「同時に押す」で、B01「同時入力の箱」に対応する実際のブラウザ状態・標準UI・端末入力を観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: S-200の判定に必要な実装内のWeb API。共通runtimeは進捗表示だけを担う。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
function S200Stage(props: Props) {
  const problem = props.boxes[manifest.box.B01];
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
        problem.solve();
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
        {stageText(props.locale, locale.pressed)} {gesture.pressed} ·{" "}
        {stageText(props.locale, locale.axis)} {gesture.axis.toFixed(2)}
      </p>
      <p className="interaction-status" role="status">
        {stageText(props.locale, locale.gestureHint)}
      </p>
      <StageProblemGiftBox box={problem} locale={props.locale} />
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: SportsEsportsOutlined,
      color: "#fb7185",
      label: locale.B01,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      "getGamepads" in navigator ? "available" : "unsupported",
    ),
  Component: S200Stage,
});
