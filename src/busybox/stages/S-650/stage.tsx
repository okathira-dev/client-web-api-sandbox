import DesktopWindowsOutlined from "@mui/icons-material/DesktopWindowsOutlined";
import NotificationsOutlined from "@mui/icons-material/NotificationsOutlined";
import RouteOutlined from "@mui/icons-material/RouteOutlined";
import VolumeUpOutlined from "@mui/icons-material/VolumeUpOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useEffect, useState } from "react";
import { statusText } from "../../ui/statusLocale";
import { stageText } from "../locale";
import { locale } from "./locale";

type PermissionKey = "geolocation" | "notifications" | "camera" | "microphone";
type PermissionValue = PermissionState | "unknown";

function permissionStateText(
  currentLocale: Props["locale"],
  state: PermissionValue,
) {
  return state === "unknown"
    ? stageText(currentLocale, locale.unknown)
    : statusText(currentLocale, state);
}

const keys: readonly PermissionKey[] = [
  "geolocation",
  "notifications",
  "camera",
  "microphone",
];

function permissionLabel(key: PermissionKey, currentLocale: Props["locale"]) {
  return stageText(currentLocale, locale[key]);
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
function S650Stage(props: Props) {
  const problems = [
    props.boxes.B01,
    props.boxes.B02,
    props.boxes.B03,
    props.boxes.B04,
  ] as const;
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
      if (states[key] === "granted") problems[index]?.solve();
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
        `${permissionLabel(key, props.locale)}: ${stageText(props.locale, locale.requested)}`,
      );
    } catch {
      setStatus(
        `${permissionLabel(key, props.locale)}: ${stageText(props.locale, locale.denied)}`,
      );
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        {problems.map((problem) => (
          <StageProblemGiftBox
            key={problem.id}
            box={problem}
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

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: RouteOutlined,
      color: "#22c55e",
      label: locale.B01,
    },
    [manifest.box.B02]: {
      icon: NotificationsOutlined,
      color: "#16a34a",
      label: locale.B02,
    },
    [manifest.box.B03]: {
      icon: DesktopWindowsOutlined,
      color: "#15803d",
      label: locale.B03,
    },
    [manifest.box.B04]: {
      icon: VolumeUpOutlined,
      color: "#166534",
      label: locale.B04,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      "permissions" in navigator ? "permission-required" : "unsupported",
    ),
  Component: S650Stage,
});
