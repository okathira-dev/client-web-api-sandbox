import { useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

export function DriveStage(props: StageComponentProps) {
  const [status, setStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");
  const drive = props.services.drive;

  const sync = async () => {
    if (!drive?.configured) return;
    setStatus("syncing");
    // The stage consumes the fresh result instead of persistent observations so
    // reopening a cleared stage still requires a sync during this attempt.
    const result = await drive.sync();
    if (!result.synced) {
      setStatus("error");
      return;
    }
    props.solve("S-140-B01", ["drive:backup"]);
    if (result.remoteDevice) {
      props.solve("S-140-B02", ["drive:remote-device"]);
    }
    setStatus("success");
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="cloud-clue" aria-hidden="true">
        ☁
      </div>
      <div className="problem-row">
        <ProblemGiftBox
          boxId="S-140-B01"
          state={props.problemState("S-140-B01")}
          locale={props.locale}
        />
        <ProblemGiftBox
          boxId="S-140-B02"
          state={props.problemState("S-140-B02")}
          locale={props.locale}
        />
      </div>
      <button
        type="button"
        className="stage-action"
        disabled={!drive?.configured || status === "syncing"}
        onClick={() => void sync()}
      >
        {!drive?.configured
          ? props.locale === "ja"
            ? "Google Drive未設定"
            : "Google Drive is not configured"
          : props.locale === "ja"
            ? "端末をつなぐ"
            : "Connect devices"}
      </button>
      <p className="interaction-status" role="status">
        {status}
      </p>
    </div>
  );
}
