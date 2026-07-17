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
 * Cleanup: Replace the one-shot return query without retaining notification data.
 * Human verification: H-005, H-006, H-023, H-025
 */
export default function S090Stage(props: StageComponentProps) {
  const problem = props.problem("S-090-B01");
  const [status, setStatus] = useState<NotificationPermission>(
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
    const permission = await Notification.requestPermission();
    setStatus(permission);
    if (permission !== "granted") return;
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification("Busybox", {
      body:
        props.locale === "ja"
          ? "箱が外で待っています。"
          : "A box is waiting outside.",
      icon: "./icon.svg",
      tag: "busybox-stage-S-090",
    });
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
