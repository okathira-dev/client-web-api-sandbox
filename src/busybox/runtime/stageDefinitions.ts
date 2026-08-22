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
  "S-610": {
    stage: stageById["S-610"],
    probe: () =>
      safeCapabilityProbe(() =>
        "HTMLDialogElement" in window ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-610")),
  },
  "S-620": {
    stage: stageById["S-620"],
    probe: () =>
      safeCapabilityProbe(() =>
        "FontFace" in window && "CSS" in window ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-620")),
  },
  "S-630": {
    stage: stageById["S-630"],
    probe: () =>
      safeCapabilityProbe(() => {
        const connection = (
          navigator as Navigator & { connection?: { type?: string } }
        ).connection;
        return typeof connection?.type === "string"
          ? "available"
          : "unsupported";
      }),
    component: lazy(() => import("../stages/S-630")),
  },
  "S-640": {
    stage: stageById["S-640"],
    probe: () =>
      safeCapabilityProbe(() =>
        "TextDecoder" in window ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-640")),
  },
  "S-650": {
    stage: stageById["S-650"],
    probe: () =>
      safeCapabilityProbe(() =>
        "permissions" in navigator ? "permission-required" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-650")),
  },
  "S-660": {
    stage: stageById["S-660"],
    probe: () =>
      safeCapabilityProbe(() =>
        window.PressureObserver?.knownSources.includes("cpu")
          ? "available"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-660")),
  },
  "S-670": {
    stage: stageById["S-670"],
    probe: () => "available",
    component: lazy(() => import("../stages/S-670")),
  },
  "S-690": {
    stage: stageById["S-690"],
    probe: () => "available",
    component: lazy(() => import("../stages/S-690")),
  },
  "S-700": {
    stage: stageById["S-700"],
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext &&
        ("PresentationRequest" in window ||
          "remote" in HTMLMediaElement.prototype)
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-700")),
  },
  "S-710": {
    stage: stageById["S-710"],
    probe: () =>
      safeCapabilityProbe(() =>
        "MediaRecorder" in window && "HTMLVideoElement" in window
          ? "available"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-710")),
  },
  "S-720": {
    stage: stageById["S-720"],
    probe: () => "available",
    component: lazy(() => import("../stages/S-720")),
  },
  "S-730": {
    stage: stageById["S-730"],
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "xr" in navigator
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-730")),
  },
  "S-740": {
    stage: stageById["S-740"],
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "serviceWorker" in navigator
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-740")),
  },
  "S-750": {
    stage: stageById["S-750"],
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "credentials" in navigator
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-750")),
  },
  "S-760": {
    stage: stageById["S-760"],
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "contacts" in navigator
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-760")),
  },
  "S-770": {
    stage: stageById["S-770"],
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "IdentityCredential" in window
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-770")),
  },
  "S-780": {
    stage: stageById["S-780"],
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext &&
        "PaymentRequest" in window &&
        "serviceWorker" in navigator
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-780")),
  },
  "S-790": {
    stage: stageById["S-790"],
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "queryLocalFonts" in window
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-790")),
  },
  "S-810": {
    stage: stageById["S-810"],
    probe: () =>
      safeCapabilityProbe(() =>
        "onresize" in HTMLVideoElement.prototype &&
        "requestVideoFrameCallback" in HTMLVideoElement.prototype
          ? "available"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-810")),
  },
  "S-820": {
    stage: stageById["S-820"],
    probe: () =>
      safeCapabilityProbe(() =>
        "requestPointerLock" in Element.prototype ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-820")),
  },
  "S-830": {
    stage: stageById["S-830"],
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && window.IdleDetector
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-830")),
  },
  "S-850": {
    stage: stageById["S-850"],
    probe: () =>
      safeCapabilityProbe(() =>
        window.documentPictureInPicture ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-850")),
  },
  "S-860": {
    stage: stageById["S-860"],
    probe: () =>
      safeCapabilityProbe(() =>
        window.EditContext ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-860")),
  },
  "S-870": {
    stage: stageById["S-870"],
    probe: () =>
      safeCapabilityProbe(() =>
        isSecureContext && "showDirectoryPicker" in window
          ? "permission-required"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-870")),
  },
  "S-880": {
    stage: stageById["S-880"],
    probe: () =>
      safeCapabilityProbe(() =>
        "DecompressionStream" in window ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-880")),
  },
  "S-900": {
    stage: stageById["S-900"],
    probe: () =>
      safeCapabilityProbe(() =>
        "MediaSource" in window &&
        MediaSource.isTypeSupported('video/webm; codecs="vp8"')
          ? "available"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-900")),
  },
  "S-910": {
    stage: stageById["S-910"],
    probe: () =>
      safeCapabilityProbe(() =>
        "VTTCue" in window ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-910")),
  },
  "S-800": {
    stage: stageById["S-800"],
    probe: () =>
      safeCapabilityProbe(() =>
        "onbeforematch" in HTMLElement.prototype ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-800")),
  },
  "S-840": {
    stage: stageById["S-840"],
    probe: () =>
      safeCapabilityProbe(() =>
        "IntersectionObserver" in window ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-840")),
  },
  "S-890": {
    stage: stageById["S-890"],
    probe: () =>
      safeCapabilityProbe(() =>
        "requestFullscreen" in Element.prototype ? "available" : "unsupported",
      ),
    component: lazy(() => import("../stages/S-890")),
  },
  "S-920": {
    stage: stageById["S-920"],
    probe: () =>
      safeCapabilityProbe(() =>
        "showPopover" in HTMLElement.prototype &&
        CSS.supports("position-area", "right") &&
        CSS.supports("position-try-fallbacks", "flip-inline")
          ? "available"
          : "unsupported",
      ),
    component: lazy(() => import("../stages/S-920")),
  },
} satisfies Readonly<Record<StageId, StageRegistration>>;
