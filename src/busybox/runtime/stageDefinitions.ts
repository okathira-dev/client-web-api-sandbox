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
};
