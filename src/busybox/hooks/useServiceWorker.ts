import { useCallback, useEffect, useState } from "react";

export type ServiceWorkerState =
  | "unsupported"
  | "registering"
  | "ready"
  | "update-ready"
  | "error";

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>(
    "serviceWorker" in navigator ? "registering" : "unsupported",
  );
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    let active = true;
    void navigator.serviceWorker
      .register("./service-worker.js", { scope: "./" })
      .then((nextRegistration) => {
        if (!active) return;
        setRegistration(nextRegistration);
        setState(nextRegistration.waiting ? "update-ready" : "ready");
        nextRegistration.addEventListener("updatefound", () => {
          const worker = nextRegistration.installing;
          worker?.addEventListener("statechange", () => {
            if (
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
