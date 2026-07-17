import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

type InteractionState = "idle" | "active" | "denied";

interface PermissionAwareOrientationEvent {
  requestPermission?: () => Promise<"granted" | "denied">;
}

/**
 * S-100
 *
 * Gimmick: Hold the device near a 45-degree forward tilt for one second.
 * Uses: Device Orientation Events and the iOS permission extension.
 * Success: beta is near 45 degrees and gamma near zero continuously for one second.
 * Privacy/Permission: Request permission only from the explicit action; retain no angles.
 * Cleanup: Remove the orientation listener on retry, abort, or unmount.
 * Human verification: H-008, H-025
 */
export default function S100Stage(props: StageComponentProps) {
  const problem = props.problem("S-100-B01");
  const [status, setStatus] = useState<InteractionState>("idle");
  const [tilt, setTilt] = useState({ beta: 0, gamma: 0 });
  const cleanupRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    const cleanup = () => cleanupRef.current();
    props.signal.addEventListener("abort", cleanup, { once: true });
    return () => {
      props.signal.removeEventListener("abort", cleanup);
      cleanup();
    };
  }, [props.signal]);

  const start = async () => {
    cleanupRef.current();
    const orientation =
      DeviceOrientationEvent as unknown as PermissionAwareOrientationEvent;
    if (orientation.requestPermission) {
      const permission = await orientation.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }
    }

    let targetSince: number | null = null;
    const observe = (event: DeviceOrientationEvent) => {
      const beta = event.beta ?? 0;
      const gamma = event.gamma ?? 0;
      setTilt({ beta, gamma });
      const onTarget = Math.abs(beta - 45) <= 12 && Math.abs(gamma) <= 12;
      if (!onTarget) {
        targetSince = null;
      } else if (targetSince === null) {
        targetSince = performance.now();
      } else if (performance.now() - targetSince >= 1000) {
        problem.solve(["orientation:held"]);
      }
    };
    window.addEventListener("deviceorientation", observe);
    cleanupRef.current = () =>
      window.removeEventListener("deviceorientation", observe);
    setStatus("active");
  };

  return (
    <div className="puzzle puzzle--centered">
      <div
        className="tilt-clue"
        style={{ transform: `rotate(${tilt.gamma}deg)` }}
        aria-hidden="true"
      >
        ▰
      </div>
      <p className="measurement">
        β {Math.round(tilt.beta)}° · γ {Math.round(tilt.gamma)}°
      </p>
      <button
        type="button"
        className="stage-action"
        onClick={() => void start()}
      >
        {props.locale === "ja" ? "姿勢を感じる" : "Sense orientation"}
      </button>
      <p className="interaction-status" role="status">
        {status}
      </p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
