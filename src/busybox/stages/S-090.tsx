import { useEffect, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/**
 * S-090
 *
 * Gimmick: A system notification carries the player outside the page and back.
 * Uses: Notifications API and Service Worker notifications.
 * Success: Return through the Service Worker notification-click URL.
 * Privacy/Permission: Request notification permission only from the explicit button.
 * Cleanup: Ignore late permission work, close a late notification, and consume the return query.
 * Human verification: H-005, H-006, H-023, H-025
 */
export default function S090Stage(props: StageComponentProps) {
  const problem = props.problem("S-090-B01");
  const [status, setStatus] = useState<NotificationPermission | "unavailable">(
    Notification.permission,
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("notification") === "1") {
      problem.solve(["notification-click"]);
      url.searchParams.delete("notification");
      window.history.replaceState({}, "", url);
    }
  }, [problem.solve]);

  const sendNotification = async () => {
    // Permission and notification creation stay inside this click handler because
    // browsers require a user gesture and surprise prompts would violate the UX policy.
    try {
      const permission = await Notification.requestPermission();
      if (props.signal.aborted) return;
      setStatus(permission);
      if (permission !== "granted") return;
      const registration = await navigator.serviceWorker.ready;
      if (props.signal.aborted) return;
      const tag = "busybox-stage-S-090";
      await registration.showNotification("Busybox", {
        body:
          props.locale === "ja"
            ? "箱が外で待っています。"
            : "A box is waiting outside.",
        icon: "./icon.svg",
        tag,
      });
      if (props.signal.aborted) {
        const notifications = await registration.getNotifications({ tag });
        for (const notification of notifications) notification.close();
      }
    } catch {
      if (!props.signal.aborted) setStatus("unavailable");
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="bell-clue" aria-hidden="true">
        ♢
      </div>
      <button
        type="button"
        className="stage-action"
        onClick={() => void sendNotification()}
      >
        {props.locale === "ja" ? "外へ呼ぶ" : "Call outside"}
      </button>
      <p role="status">{status}</p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
