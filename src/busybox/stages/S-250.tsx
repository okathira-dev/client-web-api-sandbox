import { useEffect, useMemo, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

type Color = "R" | "G" | "B";
type Message = { type: "alive" | "closing"; color: Color; sender: string };

/** S-250 — keep RGB tabs alive to make white, then close B→G→R. H-013/H-022/H-025. */
export default function S250Stage(props: StageComponentProps) {
  const white = props.problem("S-250-B01");
  const order = props.problem("S-250-B02");
  const params = useMemo(() => new URL(location.href).searchParams, []);
  const color = params.get("color") as Color | null;
  const sender = useMemo(() => crypto.randomUUID(), []);
  const [active, setActive] = useState<Set<Color>>(new Set());
  const closed = useRef<Color[]>([]);
  useEffect(() => {
    const channel = new BroadcastChannel("busybox:S-250:rgb");
    const last = new Map<Color, number>();
    const receive = (event: MessageEvent<Message>) => {
      if (event.data.sender === sender) return;
      if (event.data.type === "alive") last.set(event.data.color, Date.now());
      else {
        closed.current.push(event.data.color);
        if (closed.current.join("") === "BGR") order.solve(["rgb:closed-bgr"]);
        else if (!"BGR".startsWith(closed.current.join("")))
          closed.current = [];
      }
    };
    channel.addEventListener("message", receive);
    const heartbeat = color
      ? window.setInterval(
          () =>
            channel.postMessage({
              type: "alive",
              color,
              sender,
            } satisfies Message),
          500,
        )
      : undefined;
    if (color)
      channel.postMessage({ type: "alive", color, sender } satisfies Message);
    const inspect = color
      ? undefined
      : window.setInterval(() => {
          const now = Date.now();
          const next = new Set(
            [...last]
              .filter(([, at]) => now - at < 1800)
              .map(([value]) => value),
          );
          setActive(next);
          if (next.size === 3) white.solve(["rgb:white"]);
        }, 400);
    const closing = () => {
      if (color)
        channel.postMessage({
          type: "closing",
          color,
          sender,
        } satisfies Message);
    };
    window.addEventListener("pagehide", closing);
    return () => {
      window.removeEventListener("pagehide", closing);
      if (heartbeat) clearInterval(heartbeat);
      if (inspect) clearInterval(inspect);
      channel.close();
    };
  }, [color, order.solve, sender, white.solve]);
  if (color)
    return (
      <div
        className={`puzzle puzzle--centered rgb-page rgb-page--${color.toLowerCase()}`}
      >
        <p className="measurement">{color}</p>
      </div>
    );
  const openNext = () => {
    const sequence: Color[] = ["R", "G", "B"];
    const index = Number(sessionStorage.getItem("busybox:S-250:next") ?? 0) % 3;
    sessionStorage.setItem("busybox:S-250:next", String(index + 1));
    const url = new URL(location.href);
    url.searchParams.set("color", sequence[index] ?? "R");
    window.open(url, "_blank");
  };
  return (
    <div
      className={`puzzle puzzle--centered ${active.size === 3 ? "rgb-monitor--white" : ""}`}
    >
      <div className="problem-row">
        <ProblemGiftBox problem={white} locale={props.locale} />
        <ProblemGiftBox problem={order} locale={props.locale} />
      </div>
      <button type="button" className="stage-action" onClick={openNext}>
        {props.locale === "ja" ? "次の色を開く" : "Open the next color"}
      </button>
      <p className="measurement">{[...active].sort().join(" + ") || "…"}</p>
    </div>
  );
}
