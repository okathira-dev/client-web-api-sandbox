import { useEffect, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/**
 * S-250
 *
 * Gimmick: One tab holds an origin lock while another proves it was blocked.
 * Uses: Web Locks API and BroadcastChannel.
 * Success: Hold the named lock and receive a blocked fact from a contender tab.
 * Privacy/Permission: No permission; channel messages are fixed status words only.
 * Cleanup: Release the lock hold, remove the listener, and close the channel on exit.
 * Human verification: H-013, H-022, H-025
 */
export default function S250Stage(props: StageComponentProps) {
  const holderProblem = props.problem("S-250-B01");
  const waiterProblem = props.problem("S-250-B02");
  const [status, setStatus] = useState("waiting");

  useEffect(() => {
    const channel = new BroadcastChannel("busybox-stage-S-250");
    let active = true;
    let releaseHold: () => void = () => undefined;
    const hold = new Promise<void>((resolve) => {
      releaseHold = resolve;
    });
    const receive = (event: MessageEvent<unknown>) => {
      if (active && event.data === "blocked") {
        waiterProblem.solve(["web-lock:peer-blocked"]);
      }
    };
    channel.addEventListener("message", receive);
    void navigator.locks
      .request("busybox-stage-S-250", { ifAvailable: true }, async (lock) => {
        if (!active) return;
        if (!lock) {
          setStatus("blocked");
          channel.postMessage("blocked");
          return;
        }
        setStatus("holding");
        holderProblem.solve(["web-lock:holding"]);
        channel.postMessage("holding");
        await hold;
      })
      .catch(() => {
        if (active) setStatus("unavailable");
      });
    const cleanup = () => {
      active = false;
      releaseHold();
      channel.removeEventListener("message", receive);
      channel.close();
    };
    props.signal.addEventListener("abort", cleanup, { once: true });
    return () => {
      props.signal.removeEventListener("abort", cleanup);
      cleanup();
    };
  }, [holderProblem.solve, props.signal, waiterProblem.solve]);

  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        <ProblemGiftBox problem={holderProblem} locale={props.locale} />
        <ProblemGiftBox problem={waiterProblem} locale={props.locale} />
      </div>
      <button
        type="button"
        className="stage-action"
        onClick={() => window.open(window.location.href, "_blank", "noopener")}
      >
        {props.locale === "ja" ? "競争相手を開く" : "Open a contender"}
      </button>
      <p className="interaction-status" role="status">
        {status}
      </p>
    </div>
  );
}
