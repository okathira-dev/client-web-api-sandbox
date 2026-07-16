import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { hasRevisitFlag, setRevisitFlag } from "../infra/synchronousFlags";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

export function FirstBoxStage(props: StageComponentProps) {
  const boxId = "S-000-B01";
  return (
    <div className="puzzle puzzle--centered">
      <ProblemGiftBox
        boxId={boxId}
        state={props.problemState(boxId)}
        locale={props.locale}
        onClick={() => props.solve(boxId, ["activation"])}
      />
    </div>
  );
}

const pointerBoxes = {
  mouse: "S-010-B01",
  touch: "S-010-B02",
  pen: "S-010-B03",
} as const;

export function PointerStage(props: StageComponentProps) {
  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row" aria-live="polite">
        {Object.entries(pointerBoxes).map(([pointerType, boxId]) => (
          <ProblemGiftBox
            key={boxId}
            boxId={boxId}
            state={props.problemState(boxId)}
            locale={props.locale}
            onPointerDown={(event) => {
              if (event.pointerType === pointerType) {
                props.solve(boxId, [`pointer:${event.pointerType}`]);
              }
            }}
          />
        ))}
      </div>
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
      <ProblemGiftBox
        boxId={boxId}
        state={props.problemState(boxId)}
        locale={props.locale}
      />
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
      <ProblemGiftBox
        boxId={boxId}
        state={props.problemState(boxId)}
        locale={props.locale}
      />
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
      <ProblemGiftBox
        boxId={boxId}
        state={props.problemState(boxId)}
        locale={props.locale}
      />
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
      <ProblemGiftBox
        boxId={boxId}
        state={props.problemState(boxId)}
        locale={props.locale}
      />
    </div>
  );
}

export function ReturnStage(props: StageComponentProps) {
  const boxId = "S-060-B01";
  const observationId = "S-060:entered";
  const seenBefore = useRef(
    props.observations[observationId] !== undefined || hasRevisitFlag(),
  );

  useLayoutEffect(() => {
    if (!seenBefore.current) {
      setRevisitFlag();
      props.observe(observationId, ["entered"]);
    }
  }, [props]);

  useEffect(() => {
    // Returning is itself the replay action, but solve after the first paint so
    // the shared box visibly transitions from closed to open on every visit.
    if (seenBefore.current) props.solve(boxId, ["returned"]);
  }, [props]);

  return (
    <div className="puzzle puzzle--centered">
      <div className="return-clue" aria-hidden="true">
        ↪
      </div>
      <p>{props.locale === "ja" ? "また、ここで。" : "See you here again."}</p>
      <ProblemGiftBox
        boxId={boxId}
        state={props.problemState(boxId)}
        locale={props.locale}
      />
    </div>
  );
}
