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

export const stageDefinitions: Readonly<Record<string, StageDefinition>> = {
  "S-000": {
    summary: summary("S-000"),
    probe: () => "available",
    component: lazy(() => import("../stages/S-000")),
  },
  "S-010": {
    summary: summary("S-010"),
    probe: () =>
      safeCapabilityProbe(() =>
        "PointerEvent" in window ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-010")),
  },
  "S-020": {
    summary: summary("S-020"),
    probe: () =>
      safeCapabilityProbe(() =>
        "ResizeObserver" in window ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-020")),
  },
  "S-030": {
    summary: summary("S-030"),
    probe: () =>
      safeCapabilityProbe(() =>
        typeof document.getSelection === "function"
          ? "available"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-030")),
  },
  "S-040": {
    summary: summary("S-040"),
    probe: () =>
      safeCapabilityProbe(() =>
        "visibilityState" in document ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-040")),
  },
  "S-050": {
    summary: summary("S-050"),
    probe: () =>
      safeCapabilityProbe(() =>
        "BroadcastChannel" in window ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-050")),
  },
  "S-060": {
    summary: summary("S-060"),
    probe: () =>
      safeCapabilityProbe(() =>
        "indexedDB" in window ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-060")),
  },
  "S-070": {
    summary: summary("S-070"),
    probe: () =>
      safeCapabilityProbe(() =>
        "serviceWorker" in navigator && "caches" in window
          ? "available"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-070")),
  },
  "S-080": {
    summary: summary("S-080"),
    probe: () =>
      safeCapabilityProbe(() =>
        typeof window.matchMedia === "function" ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-080")),
  },
  "S-090": {
    summary: summary("S-090"),
    probe: () =>
      safeCapabilityProbe(() =>
        "Notification" in window && "serviceWorker" in navigator
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-090")),
  },
  "S-100": {
    summary: summary("S-100"),
    probe: () =>
      safeCapabilityProbe(() =>
        "DeviceOrientationEvent" in window
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-100")),
  },
  "S-110": {
    summary: summary("S-110"),
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "mediaDevices" in navigator
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-110")),
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
    component: lazy(() => import("../stages/S-120")),
  },
  "S-130": {
    summary: summary("S-130"),
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && crypto.subtle ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-130")),
  },
  "S-140": {
    summary: summary("S-140"),
    probe: () => "available",
    component: lazy(() => import("../stages/S-140")),
  },
  "S-150": {
    summary: summary("S-150"),
    probe: () =>
      safeCapabilityProbe(() =>
        "MutationObserver" in window ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-150")),
  },
  "S-160": {
    summary: summary("S-160"),
    probe: () =>
      safeCapabilityProbe(() =>
        "PointerEvent" in window ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-160")),
  },
  "S-170": {
    summary: summary("S-170"),
    probe: () =>
      safeCapabilityProbe(() =>
        "animate" in Element.prototype ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-170")),
  },
  "S-180": {
    summary: summary("S-180"),
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "clipboard" in navigator
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-180")),
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
    component: lazy(() => import("../stages/S-190")),
  },
  "S-200": {
    summary: summary("S-200"),
    probe: () =>
      safeCapabilityProbe(() =>
        "getGamepads" in navigator ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-200")),
  },
  "S-210": {
    summary: summary("S-210"),
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "setAppBadge" in navigator
          ? "available"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-210")),
  },
  "S-220": {
    summary: summary("S-220"),
    probe: () => "available",
    component: lazy(() => import("../stages/S-220")),
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
    component: lazy(() => import("../stages/S-230")),
  },
  "S-240": {
    summary: summary("S-240"),
    probe: () =>
      safeCapabilityProbe(() =>
        "share" in navigator ? "permission-required" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-240")),
  },
  "S-250": {
    summary: summary("S-250"),
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "locks" in navigator && "BroadcastChannel" in window
          ? "available"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-250")),
  },
  "S-260": {
    summary: summary("S-260"),
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "EyeDropper" in window
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-260")),
  },
  "S-270": {
    summary: summary("S-270"),
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "gpu" in navigator ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-270")),
  },
  "S-280": {
    summary: summary("S-280"),
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "bluetooth" in navigator
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-280")),
  },
  "S-290": {
    summary: summary("S-290"),
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "hid" in navigator
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-290")),
  },
  "S-300": {
    summary: summary("S-300"),
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "usb" in navigator
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-300")),
  },
  "S-310": {
    summary: summary("S-310"),
    probe: () =>
      safeCapabilityProbe(() =>
        "launchQueue" in window ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-310")),
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
    component: lazy(() => import("../stages/S-320")),
  },
  "S-330": {
    summary: summary("S-330"),
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "wakeLock" in navigator
          ? "available"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-330")),
  },
  "S-340": {
    summary: summary("S-340"),
    probe: () =>
      safeCapabilityProbe(() =>
        "startViewTransition" in document ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-340")),
  },
};
