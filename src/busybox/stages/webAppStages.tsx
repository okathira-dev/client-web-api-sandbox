import { useEffect, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

export function OfflineStage(props: StageComponentProps) {
  const boxId = "S-070-B01";
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const observe = () => {
      setOnline(navigator.onLine);
      if (!navigator.onLine) props.solve(boxId, ["offline"]);
    };
    window.addEventListener("online", observe);
    window.addEventListener("offline", observe);
    observe();
    return () => {
      window.removeEventListener("online", observe);
      window.removeEventListener("offline", observe);
    };
  }, [props]);

  return (
    <div className="puzzle puzzle--centered">
      <div
        className={`signal-clue ${online ? "" : "signal-clue--offline"}`}
        aria-hidden="true"
      >
        ⌁
      </div>
      <p role="status">{online ? "•••" : "×"}</p>
      <ProblemGiftBox
        boxId={boxId}
        state={props.problemState(boxId)}
        locale={props.locale}
      />
    </div>
  );
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches;
}

export function DisplayModeStage(props: StageComponentProps) {
  const boxId = "S-080-B01";
  const [standalone, setStandalone] = useState(isStandalone);

  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)");
    const observe = () => {
      setStandalone(media.matches);
      if (media.matches) props.solve(boxId, ["display-mode:standalone"]);
    };
    media.addEventListener("change", observe);
    observe();
    return () => media.removeEventListener("change", observe);
  }, [props]);

  return (
    <div className="puzzle puzzle--centered">
      <div
        className={`door-clue ${standalone ? "door-clue--open" : ""}`}
        aria-hidden="true"
      >
        ▯
      </div>
      <p>{props.locale === "ja" ? "別の入口から。" : "Enter another way."}</p>
      <ProblemGiftBox
        boxId={boxId}
        state={props.problemState(boxId)}
        locale={props.locale}
      />
    </div>
  );
}

export function NotificationStage(props: StageComponentProps) {
  const boxId = "S-090-B01";
  const [status, setStatus] = useState<NotificationPermission>(
    Notification.permission,
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("notification") === "1") {
      props.solve(boxId, ["notification-click"]);
      url.searchParams.delete("notification");
      window.history.replaceState({}, "", url);
    }
  }, [props]);

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
      <ProblemGiftBox
        boxId={boxId}
        state={props.problemState(boxId)}
        locale={props.locale}
      />
    </div>
  );
}
