import type { CSSProperties, MouseEventHandler } from "react";
import { useEffect, useRef } from "react";
import type { ProblemBoxVisualState } from "../domain/stageRuntime";
import {
  type ProblemBoxId,
  type ProblemSpec,
  problemById,
} from "../domain/stages";
import { type Locale, messages } from "../i18n";
import type { ProblemHandle } from "../runtime/types";
import { ClueIcon } from "./ClueIcon";

export type GiftBoxState = "ribboned" | "closed" | "open";

interface GiftBoxProps {
  state: GiftBoxState;
  color: string;
  label: string;
  size?: "problem" | "stage";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  onPointerDown?: (event: PointerEvent) => void;
}

export function GiftBox({
  state,
  color,
  label,
  size = "problem",
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
    >
      {interactive ? (
        <span className="gift-box__visual" aria-hidden="true">
          {visual}
        </span>
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

interface ProblemGiftBoxProps {
  problem?: ProblemHandle;
  /** @deprecated Pass a ProblemHandle while grouped stage modules migrate. */
  boxId?: ProblemBoxId;
  /** @deprecated Pass a ProblemHandle while grouped stage modules migrate. */
  state?: ProblemBoxVisualState;
  locale: Locale;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  onPointerDown?: (event: PointerEvent) => void;
}

export function ProblemGiftBox({
  problem,
  boxId,
  state,
  locale,
  onClick,
  onPointerDown,
}: ProblemGiftBoxProps) {
  let presentation: ProblemSpec;
  let resolvedState: ProblemBoxVisualState;
  if (problem) {
    presentation = problem.definition;
    resolvedState = problem.state;
  } else {
    if (!boxId || !state) {
      throw new Error("ProblemGiftBox requires a problem handle");
    }
    presentation = problemById[boxId];
    resolvedState = state;
  }
  const copy = messages[locale];
  const stateLabel = {
    ribboned: copy.problemNeverSolved,
    closed: copy.problemReplayReady,
    open: copy.problemSolvedThisVisit,
  }[resolvedState];
  const label = `${presentation.label[locale]}: ${stateLabel}`;

  return (
    <figure className="problem-gift">
      <GiftBox
        state={resolvedState}
        color={presentation.color}
        label={label}
        onClick={onClick}
        onPointerDown={onPointerDown}
      />
      <figcaption className="problem-gift__clue">
        <ClueIcon name={presentation.clue} />
        <span className="sr-only">{presentation.label[locale]}</span>
      </figcaption>
    </figure>
  );
}
