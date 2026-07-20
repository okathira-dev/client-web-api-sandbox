import { useEffect, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/** S-410 — repeat left/right notification actions; the worker returns only after the exact sequence. H-005/H-006/H-023. */
export default function S410Stage(props: StageComponentProps) {
  const problem = props.problem("S-410-B01");
  const [status, setStatus] = useState(Notification.permission);
  useEffect(() => {
    const url = new URL(location.href);
    if (url.searchParams.get("notification-sequence") === "S-410-ok") {
      problem.solve(["notification-actions:sequence"]);
      url.searchParams.delete("notification-sequence");
      history.replaceState(history.state, "", url);
    }
  }, [problem.solve]);
  const begin = async () => {
    const permission = await Notification.requestPermission();
    setStatus(permission);
    if (permission !== "granted" || props.signal.aborted) return;
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification("Busybox · ◀ ▶", {
      body:
        props.locale === "ja" ? "矢印だけで進む" : "Proceed with the arrows",
      tag: "busybox-S-410",
      actions: [
        { action: "left", title: "←" },
        { action: "right", title: "→" },
      ],
      data: { stage: "S-410", sequence: "", target: "LRRL" },
    } as NotificationOptions);
  };
  return (
    <div className="puzzle puzzle--centered">
      <ProblemGiftBox problem={problem} locale={props.locale} />
      <button
        type="button"
        className="stage-action"
        onClick={() => void begin()}
      >
        {props.locale === "ja" ? "通知を始める" : "Begin notifications"}
      </button>
      <p role="status">{status}</p>
    </div>
  );
}
