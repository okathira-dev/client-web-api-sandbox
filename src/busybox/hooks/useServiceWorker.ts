import { useCallback, useEffect, useState } from "react";

export type ServiceWorkerState =
  | "unsupported"
  | "development"
  | "registering"
  | "ready"
  | "update-ready"
  | "error";

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>(
    "serviceWorker" in navigator
      ? import.meta.env.DEV
        ? "development"
        : "registering"
      : "unsupported",
  );
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    let active = true;
    // Development still registers a pass-through worker so notification and PWA
    // stages remain testable without letting Cache Storage hide Vite/HMR updates.
    const workerUrl = import.meta.env.DEV
      ? "./service-worker.js?mode=development"
      : "./service-worker.js";
    void navigator.serviceWorker
      .register(workerUrl, { scope: "./", updateViaCache: "none" })
      .then((nextRegistration) => {
        if (!active) return;
        setRegistration(nextRegistration);
        setState(
          import.meta.env.DEV
            ? "development"
            : nextRegistration.waiting
              ? "update-ready"
              : "ready",
        );
        nextRegistration.addEventListener("updatefound", () => {
          const worker = nextRegistration.installing;
          worker?.addEventListener("statechange", () => {
            if (
              !import.meta.env.DEV &&
              worker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setState("update-ready");
            }
          });
        });
      })
      .catch(() => {
        if (active) setState("error");
      });
    return () => {
      active = false;
    };
  }, []);

  const applyUpdate = useCallback(() => {
    const waiting = registration?.waiting;
    if (!waiting) return;
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      () => window.location.reload(),
      { once: true },
    );
    waiting.postMessage("SKIP_WAITING");
  }, [registration]);

  return { state, applyUpdate };
}
