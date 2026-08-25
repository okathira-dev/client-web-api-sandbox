import type { CSSProperties, MouseEventHandler } from "react";
import { useEffect, useRef } from "react";
import { type Locale, messages } from "../i18n";
import {
  resolveStageBoxColor,
  type StageBoxHandle,
} from "../runtime/stageContract";

export type GiftBoxState = "ribboned" | "closed" | "open";

interface GiftBoxProps {
  state: GiftBoxState;
  color: string;
  label: string;
  size?: "problem" | "stage" | "compact";
  decorative?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  onPointerDown?: (event: PointerEvent) => void;
}

export function GiftBox({
  state,
  color,
  label,
  size = "problem",
  decorative = false,
  onClick,
  onPointerDown,
}: GiftBoxProps) {
  const interactive = onClick !== undefined || onPointerDown !== undefined;
  const controlRef = useRef<HTMLButtonElement>(null);
  const style = { "--gift-color": color } as CSSProperties;
  const visual = (
    <>
      <span className="gift-box__body" />
      <span className="gift-box__lid" />
      <span className="gift-box__ribbon-band" />
      <span className="gift-box__ribbon-bow" />
    </>
  );

  useEffect(() => {
    const control = controlRef.current;
    if (!control || !onPointerDown) return;
    control.addEventListener("pointerdown", onPointerDown);
    return () => control.removeEventListener("pointerdown", onPointerDown);
  }, [onPointerDown]);

  return (
    <div
      className={`gift-box gift-box--${state} gift-box--${size}`}
      style={style}
      data-box-state={state}
      aria-hidden={decorative || undefined}
    >
      {interactive ? (
        <span className="gift-box__visual" aria-hidden="true">
          {visual}
        </span>
      ) : decorative ? (
        <span className="gift-box__visual">{visual}</span>
      ) : (
        <span className="gift-box__visual" role="img" aria-label={label}>
          {visual}
        </span>
      )}
      {interactive ? (
        <button
          ref={controlRef}
          type="button"
          className="gift-box__control"
          aria-label={label}
          onClick={onClick}
        />
      ) : null}
    </div>
  );
}

interface StageProblemGiftBoxProps {
  box: StageBoxHandle;
  locale: Locale;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  onPointerDown?: (event: PointerEvent) => void;
}

/** Box presentation for the colocated lazy-stage contract. */
export function StageProblemGiftBox({
  box,
  locale,
  onClick,
  onPointerDown,
}: StageProblemGiftBoxProps) {
  const copy = messages[locale];
  const stateLabel = {
    ribboned: copy.problemNeverSolved,
    closed: copy.problemReplayReady,
    open: copy.problemSolvedThisVisit,
  }[box.state];
  const label = `${box.definition.label[locale]}: ${stateLabel}`;
  const Icon = box.definition.icon;

  return (
    <figure className="problem-gift">
      <GiftBox
        state={box.state}
        color={resolveStageBoxColor(box.definition)}
        label={label}
        onClick={onClick}
        onPointerDown={onPointerDown}
      />
      <figcaption className="problem-gift__clue">
        <Icon fontSize="inherit" aria-hidden="true" />
        <span className="sr-only">{box.definition.label[locale]}</span>
      </figcaption>
    </figure>
  );
}
