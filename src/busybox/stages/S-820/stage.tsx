import MouseOutlined from "@mui/icons-material/MouseOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useEffect, useMemo, useRef, useState } from "react";
import { stageText } from "../locale";
import { locale } from "./locale";

const targetDefinitions = [
  { boxId: manifest.box.B01, x: 800, y: -600 },
  { boxId: manifest.box.B02, x: -3000, y: 4000 },
  { boxId: manifest.box.B03, x: 6000, y: 8000 },
] as const satisfies readonly { boxId: string; x: number; y: number }[];

const hitRadius = 64;

function distanceBetween(
  from: { x: number; y: number },
  to: { x: number; y: number },
) {
  return Math.hypot(to.x - from.x, to.y - from.y);
}

function directionArrow(dx: number, dy: number) {
  const angle = Math.atan2(dy, dx);
  const index = Math.round(angle / (Math.PI / 4) + 8) % 8;
  return ["→", "↘", "↓", "↙", "←", "↖", "↑", "↗"][index] ?? "•";
}

/**
 * S-820 — Pointer Lock中のmovementX/Yだけで二次元平面を移動し、遠方の箱を中心reticleで押す。
 * 目的: 通常pointer座標が端で止まる操作ではなく、pointer lockが返す相対移動量で無限の空間を歩く感覚を作る。
 * 最初の一手: 「ポインターを固定する」を押し、Escで解除できる状態でマウスを動かす。周囲の矢印と距離が各箱への向きを示す。
 * 箱ごとの解法: B01は(800,-600)、B02は(-3000,4000)、B03は(6000,8000)の中心64px以内まで`movementX/Y`だけで到達し、lock中のtrusted clickで中央に現れた実ProblemGiftBoxを押すと開く。
 * 開かない操作: lock前のpointer座標、wheel、keyboard、script生成mousemove/click、距離だけを表示上で合わせる、中心外のclickでは開かない。迷路やgame製の移動buttonは置かない。
 * 使用API: Pointer Lock API、`movementX`、`movementY`、`pointerlockchange`。位置は訪問内memoryにだけ持ち、再訪問時は原点へ戻る。
 * 権限・privacy: browserのpointer lock以外の権限、保存、送信は行わない。mouse移動の履歴を保存しない。
 * cleanup: Esc、blur、pointerlockerror、stage abortでlistenerを外し、stageのplaneがlock中なら`exitPointerLock()`する。
 * 対応環境: desktop mouseでPointer Lockを許可できるbrowser。touch-only環境ではStageHostがunsupported表示にする。
 * 人手確認: H-056で3座標、lock外click、Esc、blur、再入場、各距離表示を確認する。
 */
function S820Stage(props: Props) {
  const planeRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [locked, setLocked] = useState(false);
  const problems = targetDefinitions.map((target) => ({
    ...target,
    problem: props.boxes[target.boxId],
  }));
  const nearby = useMemo(
    () =>
      problems.find((target) => distanceBetween(position, target) <= hitRadius),
    [position, problems],
  );

  useEffect(() => {
    const handleChange = () =>
      setLocked(document.pointerLockElement === planeRef.current);
    const handleMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== planeRef.current) return;
      setPosition((current) => ({
        x: current.x + event.movementX,
        y: current.y + event.movementY,
      }));
    };
    const handleError = () => setLocked(false);
    const handleBlur = () => {
      if (document.pointerLockElement === planeRef.current) {
        document.exitPointerLock();
      }
    };
    document.addEventListener("pointerlockchange", handleChange);
    document.addEventListener("pointerlockerror", handleError);
    document.addEventListener("mousemove", handleMove);
    window.addEventListener("blur", handleBlur);
    props.signal.addEventListener("abort", handleBlur, { once: true });
    return () => {
      document.removeEventListener("pointerlockchange", handleChange);
      document.removeEventListener("pointerlockerror", handleError);
      document.removeEventListener("mousemove", handleMove);
      window.removeEventListener("blur", handleBlur);
      props.signal.removeEventListener("abort", handleBlur);
      handleBlur();
    };
  }, [props.signal]);

  return (
    <div className="puzzle puzzle--centered s820-stage">
      <div className="problem-row">
        {problems.map(({ boxId, problem }) => (
          <StageProblemGiftBox
            key={boxId}
            box={problem}
            locale={props.locale}
          />
        ))}
      </div>
      <p>{stageText(props.locale, locale.intro)}</p>
      <button
        type="button"
        className="stage-action"
        onClick={() => planeRef.current?.requestPointerLock()}
      >
        {stageText(props.locale, locale.begin)}
      </button>
      <section
        ref={planeRef}
        className="s820-plane"
        data-locked={locked ? "true" : "false"}
        aria-label={stageText(
          props.locale,
          locked ? locale.locked : locale.unlocked,
        )}
      >
        <span className="s820-reticle" aria-hidden={!nearby}>
          {nearby ? (
            <StageProblemGiftBox
              box={nearby.problem}
              locale={props.locale}
              onClick={(event) => {
                if (
                  event.isTrusted &&
                  document.pointerLockElement === planeRef.current &&
                  distanceBetween(position, nearby) <= hitRadius
                ) {
                  nearby.problem.solve();
                }
              }}
            />
          ) : (
            "+"
          )}
        </span>
      </section>
      <output className="s820-position" aria-live="polite">
        {stageText(props.locale, locale.position)}: ({Math.round(position.x)},{" "}
        {Math.round(position.y)})
      </output>
      <ul className="s820-targets">
        {problems.map((target) => {
          const dx = target.x - position.x;
          const dy = target.y - position.y;
          return (
            <li key={target.boxId}>
              {directionArrow(dx, dy)} {stageText(props.locale, locale.target)}{" "}
              {Math.round(Math.hypot(dx, dy))}px
            </li>
          );
        })}
      </ul>
      <p className="interaction-status">
        {stageText(props.locale, nearby ? locale.nearby : locale.noBox)}
      </p>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: MouseOutlined,
      color: "#fb7185",
      label: locale.B01,
    },
    [manifest.box.B02]: {
      icon: MouseOutlined,
      color: "#f97316",
      label: locale.B02,
    },
    [manifest.box.B03]: {
      icon: MouseOutlined,
      color: "#facc15",
      label: locale.B03,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      "requestPointerLock" in Element.prototype ? "available" : "unsupported",
    ),
  Component: S820Stage,
});
