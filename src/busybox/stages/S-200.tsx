import { useEffect, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

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
 * Human verification: H-019, H-020, H-031
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
        {props.locale === "ja"
          ? `押下 ${gesture.pressed} · 軸 ${gesture.axis.toFixed(2)}`
          : `Pressed ${gesture.pressed} · axis ${gesture.axis.toFixed(2)}`}
      </p>
      <p className="interaction-status" role="status">
        {props.locale === "ja"
          ? "2ボタンを押しながらスティックを倒す。"
          : "Hold two buttons while moving a stick."}
      </p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
