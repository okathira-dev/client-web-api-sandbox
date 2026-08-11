import { useEffect, useMemo, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

type PermissionKey = "geolocation" | "notifications" | "camera" | "microphone";
type PermissionValue = PermissionState | "unknown";

const keys: readonly PermissionKey[] = [
  "geolocation",
  "notifications",
  "camera",
  "microphone",
];

function permissionLabel(
  key: PermissionKey,
  locale: StageComponentProps["locale"],
) {
  const labels = {
    geolocation: { ja: "位置情報", en: "geolocation" },
    notifications: { ja: "通知", en: "notifications" },
    camera: { ja: "カメラ", en: "camera" },
    microphone: { ja: "マイク", en: "microphone" },
  } as const;
  return labels[key][locale];
}

export default function S650Stage(props: StageComponentProps) {
  const problems = useMemo(
    () =>
      [
        props.problem("S-650-B01"),
        props.problem("S-650-B02"),
        props.problem("S-650-B03"),
        props.problem("S-650-B04"),
      ] as const,
    [props.problem],
  );
  const [states, setStates] = useState<Record<PermissionKey, PermissionValue>>(
    () =>
      Object.fromEntries(keys.map((key) => [key, "unknown"])) as Record<
        PermissionKey,
        PermissionValue
      >,
  );
  const [status, setStatus] = useState("");

  useEffect(() => {
    let active = true;
    const statusObjects: PermissionStatus[] = [];
    const listeners = new Map<PermissionStatus, () => void>();
    const refresh = (key: PermissionKey, permission: PermissionStatus) => {
      if (!active) return;
      setStates((previous) => ({ ...previous, [key]: permission.state }));
      const handleChange = () => {
        if (!active) return;
        setStates((previous) => ({ ...previous, [key]: permission.state }));
      };
      listeners.set(permission, handleChange);
      permission.addEventListener("change", handleChange);
    };
    void Promise.all(
      keys.map(async (key) => {
        try {
          const permission = await navigator.permissions.query({
            name: key as PermissionName,
          });
          statusObjects.push(permission);
          refresh(key, permission);
        } catch {
          if (active)
            setStates((previous) => ({ ...previous, [key]: "unknown" }));
        }
      }),
    );
    return () => {
      active = false;
      for (const permission of statusObjects) {
        const handleChange = listeners.get(permission);
        if (handleChange)
          permission.removeEventListener("change", handleChange);
      }
      listeners.clear();
    };
  }, []);

  useEffect(() => {
    for (const [index, key] of keys.entries()) {
      if (states[key] === "granted") problems[index]?.solve([`${key}:granted`]);
    }
  }, [problems, states]);

  const request = async (key: PermissionKey) => {
    try {
      if (key === "geolocation") {
        await new Promise<void>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(
            () => resolve(),
            (error) => reject(error),
            { maximumAge: 0, timeout: 10_000 },
          ),
        );
      } else if (key === "notifications") {
        if ("Notification" in window) await Notification.requestPermission();
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: key === "camera",
          audio: key === "microphone",
        });
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      }
      setStatus(`${permissionLabel(key, props.locale)}: requested`);
    } catch {
      setStatus(`${permissionLabel(key, props.locale)}: denied or unavailable`);
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        {problems.map((problem) => (
          <ProblemGiftBox
            key={problem.definition.id}
            problem={problem}
            locale={props.locale}
          />
        ))}
      </div>
      <div className="stage-actions">
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            className="stage-action"
            onClick={() => void request(key)}
          >
            {permissionLabel(key, props.locale)}: {states[key]}
          </button>
        ))}
      </div>
      <p className="interaction-status" role="status">
        {status}
      </p>
    </div>
  );
}
