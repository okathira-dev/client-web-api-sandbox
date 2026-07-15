import { useEffect } from "react";
import type { StageComponentProps } from "../runtime/types";

export function DriveStage(props: StageComponentProps) {
  const backup = props.observations["drive:backup"] !== undefined;
  const remoteDevice = props.observations["drive:remote-device"] !== undefined;

  useEffect(() => {
    if (backup) props.solve("S-140-B01", ["drive:backup"]);
    if (remoteDevice) props.solve("S-140-B02", ["drive:remote-device"]);
  }, [backup, props, remoteDevice]);

  return (
    <div className="puzzle puzzle--centered">
      <div className="cloud-clue" aria-hidden="true">
        ☁
      </div>
      <div className="problem-row">
        <div
          className={`device-status ${backup ? "device-status--solved" : ""}`}
        >
          {backup ? "✓" : "A"}
        </div>
        <div
          className={`device-status ${remoteDevice ? "device-status--solved" : ""}`}
        >
          {remoteDevice ? "✓" : "B"}
        </div>
      </div>
      <button
        type="button"
        className="stage-action"
        onClick={() =>
          window.dispatchEvent(new CustomEvent("busybox:show-settings"))
        }
      >
        {props.locale === "ja" ? "端末をつなぐ" : "Connect devices"}
      </button>
    </div>
  );
}
