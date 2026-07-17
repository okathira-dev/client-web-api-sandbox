import { useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/**
 * S-140
 *
 * Gimmick: Grow-only progress crosses devices through Google Drive appDataFolder.
 * Uses: Google Identity Services and Drive appDataFolder through StageServices.
 * Success: Complete a fresh sync, then separately observe a remote installation.
 * Privacy/Permission: Use only the app-private folder and never infer an account identity.
 * Cleanup: The Drive service owns token and request cleanup outside the stage.
 * Human verification: H-015, H-016, H-017, H-018
 */
export default function S140Stage(props: StageComponentProps) {
  const backupProblem = props.problem("S-140-B01");
  const deviceProblem = props.problem("S-140-B02");
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
    backupProblem.solve(["drive:backup"]);
    if (result.remoteDevice) {
      deviceProblem.solve(["drive:remote-device"]);
    }
    setStatus("success");
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="cloud-clue" aria-hidden="true">
        ☁
      </div>
      <div className="problem-row">
        <ProblemGiftBox problem={backupProblem} locale={props.locale} />
        <ProblemGiftBox problem={deviceProblem} locale={props.locale} />
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
