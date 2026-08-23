import { useEffect, useMemo, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { statusText } from "../ui/statusLocale";
import { stageText } from "./locale";
import { s650Locale } from "./S-650.locale";

type PermissionKey = "geolocation" | "notifications" | "camera" | "microphone";
type PermissionValue = PermissionState | "unknown";

function permissionStateText(
  locale: StageComponentProps["locale"],
  state: PermissionValue,
) {
  return state === "unknown"
    ? stageText(locale, s650Locale.unknown)
    : statusText(locale, state);
}

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
  return stageText(locale, s650Locale[key]);
}

/**
 * S-650 — PermissionStatusの状態を、許可要求そのものと分けて観測する。
 * 目的: 位置情報・通知・カメラ・マイクの4権限についてbrowserの実状態変化を読む。
 * 最初の一手: 各権限の要求を明示的に行い、設定変更後に再照会する。
 * 箱ごとの成功条件: B01〜B04は対応PermissionStatusがgrantedになった時だけ開く。
 * 開かない操作: request成功だけ、promptのまま、game側の仮表示、初期値の書き換えでは開かない。
 * API/権限: Permissions API、getUserMedia、Geolocation、Notification。streamは即停止し、位置・音声・映像・履歴は保存しない。
 * cleanup/環境: change/focus listenerとmedia trackを離脱時に破棄する。H-004/H-006/H-007/H-019/H-023/H-025/H-034を確認する。
 */
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
      setStatus(
        `${permissionLabel(key, props.locale)}: ${stageText(props.locale, s650Locale.requested)}`,
      );
    } catch {
      setStatus(
        `${permissionLabel(key, props.locale)}: ${stageText(props.locale, s650Locale.denied)}`,
      );
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
            {permissionLabel(key, props.locale)}:{" "}
            {permissionStateText(props.locale, states[key])}
          </button>
        ))}
      </div>
      <p className="interaction-status" role="status">
        {status}
      </p>
    </div>
  );
}
