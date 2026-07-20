import { lazy } from "react";
import { safeCapabilityProbe } from "../domain/stageRuntime";
import { type StageId, stageById } from "../domain/stages";
import type { StageRegistration } from "./types";

export const stageDefinitions = {
  "S-000": {
    stage: stageById["S-000"],
    probe: () => "available",
    component: lazy(() => import("../stages/S-000")),
  },
  "S-010": {
    stage: stageById["S-010"],
    probe: () =>
      safeCapabilityProbe(() =>
        "PointerEvent" in window ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-010")),
  },
  "S-020": {
    stage: stageById["S-020"],
    probe: () =>
      safeCapabilityProbe(() =>
        "ResizeObserver" in window ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-020")),
  },
  "S-030": {
    stage: stageById["S-030"],
    probe: () =>
      safeCapabilityProbe(() =>
        typeof document.getSelection === "function"
          ? "available"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-030")),
  },
  "S-040": {
    stage: stageById["S-040"],
    probe: () =>
      safeCapabilityProbe(() =>
        "visibilityState" in document ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-040")),
  },
  "S-050": {
    stage: stageById["S-050"],
    probe: () =>
      safeCapabilityProbe(() =>
        "BroadcastChannel" in window ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-050")),
  },
  "S-060": {
    stage: stageById["S-060"],
    probe: () =>
      safeCapabilityProbe(() =>
        "indexedDB" in window ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-060")),
  },
  "S-070": {
    stage: stageById["S-070"],
    probe: () =>
      safeCapabilityProbe(() =>
        "serviceWorker" in navigator && "caches" in window
          ? "available"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-070")),
  },
  "S-080": {
    stage: stageById["S-080"],
    probe: () =>
      safeCapabilityProbe(() =>
        typeof window.matchMedia === "function" ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-080")),
  },
  "S-090": {
    stage: stageById["S-090"],
    probe: () =>
      safeCapabilityProbe(() =>
        "Notification" in window && "serviceWorker" in navigator
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-090")),
  },
  "S-100": {
    stage: stageById["S-100"],
    probe: () =>
      safeCapabilityProbe(() =>
        "DeviceOrientationEvent" in window
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-100")),
  },
  "S-110": {
    stage: stageById["S-110"],
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "mediaDevices" in navigator
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-110")),
  },
  "S-120": {
    stage: stageById["S-120"],
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
    stage: stageById["S-130"],
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && crypto.subtle ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-130")),
  },
  "S-140": {
    stage: stageById["S-140"],
    probe: () => "available",
    component: lazy(() => import("../stages/S-140")),
  },
  "S-150": {
    stage: stageById["S-150"],
    probe: () =>
      safeCapabilityProbe(() =>
        "MutationObserver" in window ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-150")),
  },
  "S-160": {
    stage: stageById["S-160"],
    probe: () =>
      safeCapabilityProbe(() =>
        "PointerEvent" in window ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-160")),
  },
  "S-170": {
    stage: stageById["S-170"],
    probe: () =>
      safeCapabilityProbe(() =>
        "animate" in Element.prototype ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-170")),
  },
  "S-180": {
    stage: stageById["S-180"],
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "clipboard" in navigator
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-180")),
  },
  "S-190": {
    stage: stageById["S-190"],
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
    stage: stageById["S-200"],
    probe: () =>
      safeCapabilityProbe(() =>
        "getGamepads" in navigator ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-200")),
  },
  "S-210": {
    stage: stageById["S-210"],
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "setAppBadge" in navigator
          ? "available"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-210")),
  },
  "S-220": {
    stage: stageById["S-220"],
    probe: () => "available",
    component: lazy(() => import("../stages/S-220")),
  },
  "S-230": {
    stage: stageById["S-230"],
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
    stage: stageById["S-240"],
    probe: () =>
      safeCapabilityProbe(() =>
        "share" in navigator ? "permission-required" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-240")),
  },
  "S-250": {
    stage: stageById["S-250"],
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "locks" in navigator && "BroadcastChannel" in window
          ? "available"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-250")),
  },
  "S-260": {
    stage: stageById["S-260"],
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "EyeDropper" in window
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-260")),
  },
  "S-270": {
    stage: stageById["S-270"],
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "gpu" in navigator ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-270")),
  },
  "S-280": {
    stage: stageById["S-280"],
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "bluetooth" in navigator
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-280")),
  },
  "S-290": {
    stage: stageById["S-290"],
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "hid" in navigator
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-290")),
  },
  "S-300": {
    stage: stageById["S-300"],
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "usb" in navigator
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-300")),
  },
  "S-310": {
    stage: stageById["S-310"],
    probe: () =>
      safeCapabilityProbe(() =>
        "launchQueue" in window ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-310")),
  },
  "S-320": {
    stage: stageById["S-320"],
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
    stage: stageById["S-330"],
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "wakeLock" in navigator
          ? "available"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-330")),
  },
  "S-340": {
    stage: stageById["S-340"],
    probe: () =>
      safeCapabilityProbe(() =>
        "startViewTransition" in document ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-340")),
  },
  "S-350": {
    stage: stageById["S-350"],
    probe: () => "available",
    component: lazy(() => import("../stages/S-350")),
  },
  "S-360": {
    stage: stageById["S-360"],
    probe: () =>
      safeCapabilityProbe(() =>
        "RTCPeerConnection" in window && "BroadcastChannel" in window
          ? "available"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-360")),
  },
  "S-370": {
    stage: stageById["S-370"],
    probe: () =>
      safeCapabilityProbe(() =>
        "getBattery" in navigator ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-370")),
  },
  "S-380": {
    stage: stageById["S-380"],
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext &&
        "credentials" in navigator &&
        "PublicKeyCredential" in window
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-380")),
  },
  "S-390": {
    stage: stageById["S-390"],
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext &&
        "credentials" in navigator &&
        "PublicKeyCredential" in window
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-390")),
  },
  "S-400": {
    stage: stageById["S-400"],
    probe: () => "available",
    component: lazy(() => import("../stages/S-400")),
  },
  "S-410": {
    stage: stageById["S-410"],
    probe: () =>
      safeCapabilityProbe(() =>
        "Notification" in window && "serviceWorker" in navigator
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-410")),
  },
  "S-420": {
    stage: stageById["S-420"],
    probe: () =>
      safeCapabilityProbe(() =>
        "Notification" in window && "serviceWorker" in navigator
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-420")),
  },
  "S-430": {
    stage: stageById["S-430"],
    probe: () =>
      safeCapabilityProbe(() =>
        "mediaSession" in navigator && "AudioContext" in window
          ? "available"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-430")),
  },
  "S-440": {
    stage: stageById["S-440"],
    probe: () =>
      safeCapabilityProbe(() =>
        "launchQueue" in window ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-440")),
  },
  "S-450": {
    stage: stageById["S-450"],
    probe: () =>
      safeCapabilityProbe(() =>
        "launchQueue" in window ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-450")),
  },
  "S-460": {
    stage: stageById["S-460"],
    probe: () =>
      safeCapabilityProbe(() =>
        "windowControlsOverlay" in navigator ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-460")),
  },
  "S-480": {
    stage: stageById["S-480"],
    probe: () => "available",
    component: lazy(() => import("../stages/S-480")),
  },
  "S-490": {
    stage: stageById["S-490"],
    probe: () => "available",
    component: lazy(() => import("../stages/S-490")),
  },
  "S-500": {
    stage: stageById["S-500"],
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "clipboard" in navigator
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-500")),
  },
  "S-510": {
    stage: stageById["S-510"],
    probe: () =>
      safeCapabilityProbe(() =>
        "DataTransfer" in window && "File" in window
          ? "available"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-510")),
  },
  "S-520": {
    stage: stageById["S-520"],
    probe: () =>
      safeCapabilityProbe(() =>
        "ProximitySensor" in window ? "permission-required" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-520")),
  },
  "S-530": {
    stage: stageById["S-530"],
    probe: () =>
      safeCapabilityProbe(() =>
        "LinearAccelerationSensor" in window
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-530")),
  },
  "S-540": {
    stage: stageById["S-540"],
    probe: () =>
      safeCapabilityProbe(() =>
        "AmbientLightSensor" in window ? "permission-required" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-540")),
  },
  "S-550": {
    stage: stageById["S-550"],
    probe: () =>
      safeCapabilityProbe(() =>
        "Accelerometer" in window ? "permission-required" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-550")),
  },
  "S-560": {
    stage: stageById["S-560"],
    probe: () =>
      safeCapabilityProbe(() =>
        "Gyroscope" in window ? "permission-required" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-560")),
  },
  "S-570": {
    stage: stageById["S-570"],
    probe: () =>
      safeCapabilityProbe(() =>
        "RelativeOrientationSensor" in window
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-570")),
  },
  "S-580": {
    stage: stageById["S-580"],
    probe: () =>
      safeCapabilityProbe(() =>
        "SpeechRecognition" in window || "webkitSpeechRecognition" in window
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-580")),
  },
  "S-590": {
    stage: stageById["S-590"],
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "geolocation" in navigator
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-590")),
  },
  "S-600": {
    stage: stageById["S-600"],
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "geolocation" in navigator
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-600")),
  },
} satisfies Readonly<Record<StageId, StageRegistration>>;
