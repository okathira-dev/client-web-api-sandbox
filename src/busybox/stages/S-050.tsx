import { useEffect, useMemo, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

type ChannelMessage = { type: "hello" | "ack"; sender: string };

function isChannelMessage(value: unknown): value is ChannelMessage {
  if (typeof value !== "object" || value === null) return false;
  const message = value as Partial<ChannelMessage>;
  return (
    (message.type === "hello" || message.type === "ack") &&
    typeof message.sender === "string"
  );
}

/**
 * S-050
 *
 * Gimmick: BroadcastChannel connects two same-origin tabs.
 * Uses: BroadcastChannel with validated same-origin messages.
 * Success: Receive a validated hello or acknowledgement from another sender.
 * Privacy/Permission: No permission; messages contain only an ephemeral sender ID.
 * Cleanup: Close the channel on unmount or stage abort.
 * Human verification: H-013
 */
export default function S050Stage(props: StageComponentProps) {
  const sender = useMemo(() => crypto.randomUUID(), []);
  const [peer, setPeer] = useState(false);
  const problem = props.problem("S-050-B01");

  useEffect(() => {
    const channel = new BroadcastChannel("busybox-stage-S-050");
    const receive = (event: MessageEvent<unknown>) => {
      if (!isChannelMessage(event.data) || event.data.sender === sender) return;
      setPeer(true);
      problem.solve(["broadcast-peer"]);
      if (event.data.type === "hello") {
        channel.postMessage({ type: "ack", sender });
      }
    };
    channel.addEventListener("message", receive);
    channel.postMessage({ type: "hello", sender });
    const close = () => channel.close();
    props.signal.addEventListener("abort", close, { once: true });
    return close;
  }, [problem.solve, props.signal, sender]);

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
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
