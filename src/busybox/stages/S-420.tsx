import { useEffect, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/** S-420 — enter a left/right action sequence in notifications, then submit by clicking its body. H-005/H-006/H-020/H-023. */
export default function S420Stage(props: StageComponentProps) {
  const problem = props.problem("S-420-B01");
  const [status, setStatus] = useState<string>(Notification.permission);
  useEffect(() => {
    const url = new URL(location.href);
    const attempt = url.searchParams.get("vault-attempt");
    if (attempt !== null) {
      setStatus(attempt === "RLLR" ? "✓" : "×");
      if (attempt === "RLLR")
        window.setTimeout(
          () => problem.solve(["notification-vault:correct"]),
          600,
        );
      url.searchParams.delete("vault-attempt");
      history.replaceState(history.state, "", url);
    }
  }, [problem.solve]);
  const begin = async () => {
    const permission = await Notification.requestPermission();
    setStatus(permission);
    if (permission !== "granted" || props.signal.aborted) return;
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification("Busybox · vault", {
      body:
        props.locale === "ja"
          ? "← → で入力し、本文で提出"
          : "Enter with ← →, submit with the body",
      tag: "busybox-S-420",
      actions: [
        { action: "left", title: "←" },
        { action: "right", title: "→" },
      ],
      data: { stage: "S-420", sequence: "", target: "RLLR" },
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
        {props.locale === "ja" ? "金庫を外へ出す" : "Send the vault outside"}
      </button>
      <p className="vault-result" role="status">
        {status}
      </p>
    </div>
  );
}
