import { useEffect, useMemo, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";

function isSolved(props: StageComponentProps, boxId: string) {
  return props.boxes[boxId] !== undefined;
}

function ProblemBox({ solved, label }: { solved: boolean; label: string }) {
  return (
    <div
      className={`problem-box ${solved ? "problem-box--solved" : ""}`}
      role="img"
      aria-label={label}
    >
      <span aria-hidden="true">{solved ? "✓" : "?"}</span>
    </div>
  );
}

export function FirstBoxStage(props: StageComponentProps) {
  const boxId = "S-000-B01";
  const solved = isSolved(props, boxId);
  return (
    <div className="puzzle puzzle--centered">
      <button
        type="button"
        className={`puzzle-gift ${solved ? "puzzle-gift--open" : ""}`}
        aria-label={props.locale === "ja" ? "箱" : "Box"}
        onClick={() => props.solve(boxId, ["activation"])}
      >
        <span aria-hidden="true">{solved ? "✦" : "🎁"}</span>
      </button>
    </div>
  );
}

const pointerBoxes = {
  mouse: "S-010-B01",
  touch: "S-010-B02",
  pen: "S-010-B03",
} as const;

export function PointerStage(props: StageComponentProps) {
  const touchStoneRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const touchStone = touchStoneRef.current;
    if (!touchStone) return;
    const handlePointer = (event: PointerEvent) => {
      const boxId =
        pointerBoxes[event.pointerType as keyof typeof pointerBoxes];
      if (boxId) props.solve(boxId, [`pointer:${event.pointerType}`]);
    };
    touchStone.addEventListener("pointerdown", handlePointer);
    return () => touchStone.removeEventListener("pointerdown", handlePointer);
  }, [props]);

  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row" aria-live="polite">
        {Object.entries(pointerBoxes).map(([pointerType, boxId]) => (
          <ProblemBox
            key={boxId}
            solved={isSolved(props, boxId)}
            label={`${pointerType} input`}
          />
        ))}
      </div>
      <button type="button" ref={touchStoneRef} className="touch-stone">
        <span aria-hidden="true">☝︎</span>
        <span className="sr-only">
          {props.locale === "ja"
            ? "異なるポインターで触れる"
            : "Touch with different pointers"}
        </span>
      </button>
    </div>
  );
}

export function ResizeStage(props: StageComponentProps) {
  const initialWidth = useRef(window.innerWidth);
  const targetWidth = useMemo(
    () =>
      initialWidth.current <= 420
        ? initialWidth.current + 80
        : initialWidth.current - 80,
    [],
  );
  const [width, setWidth] = useState(window.innerWidth);
  const boxId = "S-020-B01";

  useEffect(() => {
    const observe = () => {
      const nextWidth = window.innerWidth;
      setWidth(nextWidth);
      if (Math.abs(nextWidth - targetWidth) <= 18) {
        props.solve(boxId, ["viewport-resized"]);
      }
    };
    window.addEventListener("resize", observe);
    props.signal.addEventListener(
      "abort",
      () => window.removeEventListener("resize", observe),
      {
        once: true,
      },
    );
    return () => window.removeEventListener("resize", observe);
  }, [props, targetWidth]);

  return (
    <div className="puzzle puzzle--centered">
      <div className="resize-ruler" aria-hidden="true">
        <span
          className="resize-ruler__fill"
          style={{ width: `${Math.min(100, (width / targetWidth) * 100)}%` }}
        />
      </div>
      <p className="measurement" aria-live="polite">
        {width} → {targetWidth}
      </p>
      <ProblemBox solved={isSolved(props, boxId)} label="viewport box" />
    </div>
  );
}

export function SelectionStage(props: StageComponentProps) {
  const answer = props.locale === "ja" ? "あいだ" : "between";
  const boxId = "S-030-B01";

  useEffect(() => {
    const observeSelection = () => {
      if (document.getSelection()?.toString().trim().toLowerCase() === answer) {
        props.solve(boxId, ["selection"]);
      }
    };
    document.addEventListener("selectionchange", observeSelection);
    props.signal.addEventListener(
      "abort",
      () => document.removeEventListener("selectionchange", observeSelection),
      { once: true },
    );
    return () =>
      document.removeEventListener("selectionchange", observeSelection);
  }, [answer, props]);

  return (
    <div className="puzzle puzzle--centered selection-puzzle">
      <p>
        [ <strong>{answer}</strong> ]
      </p>
      <ProblemBox solved={isSolved(props, boxId)} label="selection box" />
    </div>
  );
}

export function VisibilityStage(props: StageComponentProps) {
  const hiddenAt = useRef<number | null>(null);
  const [hiddenSeconds, setHiddenSeconds] = useState(0);
  const boxId = "S-040-B01";

  useEffect(() => {
    const observeVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt.current = Date.now();
        return;
      }
      if (hiddenAt.current !== null) {
        const duration = Date.now() - hiddenAt.current;
        setHiddenSeconds(Math.floor(duration / 1000));
        if (duration >= 2000) props.solve(boxId, ["hidden:2s"]);
        hiddenAt.current = null;
      }
    };
    document.addEventListener("visibilitychange", observeVisibility);
    props.signal.addEventListener(
      "abort",
      () => document.removeEventListener("visibilitychange", observeVisibility),
      { once: true },
    );
    return () =>
      document.removeEventListener("visibilitychange", observeVisibility);
  }, [props]);

  return (
    <div className="puzzle puzzle--centered">
      <div className="eye-clue" aria-hidden="true">
        ◉
      </div>
      <p className="measurement" aria-live="polite">
        {hiddenSeconds || "…"}
      </p>
      <ProblemBox solved={isSolved(props, boxId)} label="hidden-time box" />
    </div>
  );
}

type ChannelMessage = { type: "hello" | "ack"; sender: string };

function isChannelMessage(value: unknown): value is ChannelMessage {
  if (typeof value !== "object" || value === null) return false;
  const message = value as Partial<ChannelMessage>;
  return (
    (message.type === "hello" || message.type === "ack") &&
    typeof message.sender === "string"
  );
}

export function BroadcastStage(props: StageComponentProps) {
  const sender = useMemo(() => crypto.randomUUID(), []);
  const [peer, setPeer] = useState(false);
  const boxId = "S-050-B01";

  useEffect(() => {
    const channel = new BroadcastChannel("busybox-stage-S-050");
    const receive = (event: MessageEvent<unknown>) => {
      if (!isChannelMessage(event.data) || event.data.sender === sender) return;
      setPeer(true);
      props.solve(boxId, ["broadcast-peer"]);
      if (event.data.type === "hello")
        channel.postMessage({ type: "ack", sender });
    };
    channel.addEventListener("message", receive);
    channel.postMessage({ type: "hello", sender });
    const close = () => channel.close();
    props.signal.addEventListener("abort", close, { once: true });
    return close;
  }, [props, sender]);

  return (
    <div className="puzzle puzzle--centered">
      <div className="window-clue" aria-hidden="true">
        <span className="window-clue__pane">1</span>
        <span className="window-clue__pane">{peer ? "2" : "?"}</span>
      </div>
      <button
        type="button"
        className="stage-action"
        onClick={() => window.open(window.location.href, "_blank", "noopener")}
      >
        {props.locale === "ja" ? "もう一つ開く" : "Open another"}
      </button>
      <ProblemBox solved={isSolved(props, boxId)} label="two-window box" />
    </div>
  );
}

export function ReturnStage(props: StageComponentProps) {
  const boxId = "S-060-B01";
  const observationId = "S-060:entered";
  const seenBefore = useRef(props.observations[observationId] !== undefined);

  useEffect(() => {
    if (seenBefore.current) props.solve(boxId, ["returned"]);
    else props.observe(observationId, ["entered"]);
  }, [props]);

  return (
    <div className="puzzle puzzle--centered">
      <div className="return-clue" aria-hidden="true">
        ↪
      </div>
      <p>{props.locale === "ja" ? "また、ここで。" : "See you here again."}</p>
      <ProblemBox solved={isSolved(props, boxId)} label="return box" />
    </div>
  );
}
