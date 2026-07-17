import { lazy } from "react";
import { safeCapabilityProbe } from "../domain/stageRuntime";
import { stageCatalogue } from "../domain/stages";
import type { StageDefinition } from "./types";

const summaries = Object.fromEntries(
  stageCatalogue.map((stage) => [stage.id, stage]),
);

function summary(id: keyof typeof summaries) {
  const value = summaries[id];
  if (!value) throw new Error(`Missing stage summary: ${id}`);
  return value;
}

const core = () => import("../stages/coreStages");
const webApp = () => import("../stages/webAppStages");
const device = () => import("../stages/deviceStages");
const drive = () => import("../stages/driveStage");
const foundation = () => import("../stages/foundationStages");
const context = () => import("../stages/contextStages");
const peripheral = () => import("../stages/peripheralStages");

export const stageDefinitions: Readonly<Record<string, StageDefinition>> = {
  "S-000": {
    summary: summary("S-000"),
    probe: () => "available",
    component: lazy(() =>
      core().then((module) => ({ default: module.FirstBoxStage })),
    ),
  },
  "S-010": {
    summary: summary("S-010"),
    probe: () =>
      safeCapabilityProbe(() =>
        "PointerEvent" in window ? "available" : "unsupported",
      ),
    component: lazy(() =>
      core().then((module) => ({ default: module.PointerStage })),
    ),
  },
  "S-020": {
    summary: summary("S-020"),
    probe: () =>
      safeCapabilityProbe(() =>
        "ResizeObserver" in window ? "available" : "unsupported",
      ),
    component: lazy(() =>
      core().then((module) => ({ default: module.ResizeStage })),
    ),
  },
  "S-030": {
    summary: summary("S-030"),
    probe: () =>
      safeCapabilityProbe(() =>
        typeof document.getSelection === "function"
          ? "available"
          : "unsupported",
      ),
    component: lazy(() =>
      core().then((module) => ({ default: module.SelectionStage })),
    ),
  },
  "S-040": {
    summary: summary("S-040"),
    probe: () =>
      safeCapabilityProbe(() =>
        "visibilityState" in document ? "available" : "unsupported",
      ),
    component: lazy(() =>
      core().then((module) => ({ default: module.VisibilityStage })),
    ),
  },
  "S-050": {
    summary: summary("S-050"),
    probe: () =>
      safeCapabilityProbe(() =>
        "BroadcastChannel" in window ? "available" : "unsupported",
      ),
    component: lazy(() =>
      core().then((module) => ({ default: module.BroadcastStage })),
    ),
  },
  "S-060": {
    summary: summary("S-060"),
    probe: () =>
      safeCapabilityProbe(() =>
        "indexedDB" in window ? "available" : "unsupported",
      ),
    component: lazy(() =>
      core().then((module) => ({ default: module.ReturnStage })),
    ),
  },
  "S-070": {
    summary: summary("S-070"),
    probe: () =>
      safeCapabilityProbe(() =>
        "serviceWorker" in navigator && "caches" in window
          ? "available"
          : "unsupported",
      ),
    component: lazy(() =>
      webApp().then((module) => ({ default: module.OfflineStage })),
    ),
  },
  "S-080": {
    summary: summary("S-080"),
    probe: () =>
      safeCapabilityProbe(() =>
        typeof window.matchMedia === "function" ? "available" : "unsupported",
      ),
    component: lazy(() =>
      webApp().then((module) => ({ default: module.DisplayModeStage })),
    ),
  },
  "S-090": {
    summary: summary("S-090"),
    probe: () =>
      safeCapabilityProbe(() =>
        "Notification" in window && "serviceWorker" in navigator
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() =>
      webApp().then((module) => ({ default: module.NotificationStage })),
    ),
  },
  "S-100": {
    summary: summary("S-100"),
    probe: () =>
      safeCapabilityProbe(() =>
        "DeviceOrientationEvent" in window
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() =>
      device().then((module) => ({ default: module.OrientationStage })),
    ),
  },
  "S-110": {
    summary: summary("S-110"),
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "mediaDevices" in navigator
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() =>
      device().then((module) => ({ default: module.CameraLightStage })),
    ),
  },
  "S-120": {
    summary: summary("S-120"),
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext &&
        "mediaDevices" in navigator &&
        "AudioContext" in window
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() =>
      device().then((module) => ({ default: module.SoundShapeStage })),
    ),
  },
  "S-130": {
    summary: summary("S-130"),
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && crypto.subtle ? "available" : "unsupported",
      ),
    component: lazy(() =>
      device().then((module) => ({ default: module.FileKeyStage })),
    ),
  },
  "S-140": {
    summary: summary("S-140"),
    probe: () => "available",
    component: lazy(() =>
      drive().then((module) => ({ default: module.DriveStage })),
    ),
  },
  "S-150": {
    summary: summary("S-150"),
    probe: () =>
      safeCapabilityProbe(() =>
        "MutationObserver" in window ? "available" : "unsupported",
      ),
    component: lazy(() =>
      foundation().then((module) => ({ default: module.DocumentOrderStage })),
    ),
  },
  "S-160": {
    summary: summary("S-160"),
    probe: () =>
      safeCapabilityProbe(() =>
        "PointerEvent" in window ? "available" : "unsupported",
      ),
    component: lazy(() =>
      foundation().then((module) => ({ default: module.PointerTraceStage })),
    ),
  },
  "S-170": {
    summary: summary("S-170"),
    probe: () =>
      safeCapabilityProbe(() =>
        "animate" in Element.prototype ? "available" : "unsupported",
      ),
    component: lazy(() =>
      foundation().then((module) => ({ default: module.AnimationTimeStage })),
    ),
  },
  "S-180": {
    summary: summary("S-180"),
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "clipboard" in navigator
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() =>
      foundation().then((module) => ({ default: module.ClipboardPassStage })),
    ),
  },
  "S-190": {
    summary: summary("S-190"),
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext &&
        "mediaDevices" in navigator &&
        "getDisplayMedia" in navigator.mediaDevices
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() =>
      context().then((module) => ({ default: module.RecursiveCaptureStage })),
    ),
  },
  "S-200": {
    summary: summary("S-200"),
    probe: () =>
      safeCapabilityProbe(() =>
        "getGamepads" in navigator ? "available" : "unsupported",
      ),
    component: lazy(() =>
      peripheral().then((module) => ({ default: module.GamepadChordStage })),
    ),
  },
  "S-210": {
    summary: summary("S-210"),
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "setAppBadge" in navigator
          ? "available"
          : "unsupported",
      ),
    component: lazy(() =>
      peripheral().then((module) => ({ default: module.AppBadgeStage })),
    ),
  },
  "S-220": {
    summary: summary("S-220"),
    probe: () => "available",
    component: lazy(() =>
      foundation().then((module) => ({ default: module.HistoryTrailStage })),
    ),
  },
  "S-230": {
    summary: summary("S-230"),
    probe: () =>
      safeCapabilityProbe(() =>
        document.pictureInPictureEnabled &&
        "requestPictureInPicture" in HTMLVideoElement.prototype &&
        "captureStream" in HTMLCanvasElement.prototype
          ? "available"
          : "unsupported",
      ),
    component: lazy(() =>
      context().then((module) => ({ default: module.PictureInPictureStage })),
    ),
  },
  "S-240": {
    summary: summary("S-240"),
    probe: () =>
      safeCapabilityProbe(() =>
        "share" in navigator ? "permission-required" : "unsupported",
      ),
    component: lazy(() =>
      context().then((module) => ({ default: module.ShareMarkStage })),
    ),
  },
  "S-250": {
    summary: summary("S-250"),
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "locks" in navigator && "BroadcastChannel" in window
          ? "available"
          : "unsupported",
      ),
    component: lazy(() =>
      context().then((module) => ({ default: module.WebLockStage })),
    ),
  },
  "S-260": {
    summary: summary("S-260"),
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "EyeDropper" in window
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() =>
      peripheral().then((module) => ({ default: module.EyeDropperStage })),
    ),
  },
  "S-270": {
    summary: summary("S-270"),
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "gpu" in navigator ? "available" : "unsupported",
      ),
    component: lazy(() =>
      peripheral().then((module) => ({ default: module.WebGpuSearchStage })),
    ),
  },
  "S-280": {
    summary: summary("S-280"),
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "bluetooth" in navigator
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() =>
      peripheral().then((module) => ({
        default: module.BluetoothBatteryStage,
      })),
    ),
  },
  "S-290": {
    summary: summary("S-290"),
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "hid" in navigator
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() =>
      peripheral().then((module) => ({ default: module.HidInputStage })),
    ),
  },
  "S-300": {
    summary: summary("S-300"),
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "usb" in navigator
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() =>
      peripheral().then((module) => ({ default: module.UsbTransferStage })),
    ),
  },
  "S-310": {
    summary: summary("S-310"),
    probe: () =>
      safeCapabilityProbe(() =>
        "launchQueue" in window ? "available" : "unsupported",
      ),
    component: lazy(() =>
      context().then((module) => ({ default: module.LaunchHandlerStage })),
    ),
  },
  "S-320": {
    summary: summary("S-320"),
    probe: () =>
      safeCapabilityProbe(() =>
        "devicePosture" in navigator ||
        CSS.supports("top: env(viewport-segment-top 0 0)")
          ? "available"
          : "unsupported",
      ),
    component: lazy(() =>
      peripheral().then((module) => ({ default: module.FoldedViewportStage })),
    ),
  },
  "S-330": {
    summary: summary("S-330"),
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "wakeLock" in navigator
          ? "available"
          : "unsupported",
      ),
    component: lazy(() =>
      context().then((module) => ({ default: module.WakeLockStage })),
    ),
  },
  "S-340": {
    summary: summary("S-340"),
    probe: () =>
      safeCapabilityProbe(() =>
        "startViewTransition" in document ? "available" : "unsupported",
      ),
    component: lazy(() =>
      foundation().then((module) => ({ default: module.ViewTransitionStage })),
    ),
  },
};
