import { type ChangeEvent, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

async function hashToken(token: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function isKeyFile(
  value: unknown,
): value is { format: "busybox-key-v1"; token: string } {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as { format?: unknown; token?: unknown };
  return (
    candidate.format === "busybox-key-v1" && typeof candidate.token === "string"
  );
}

/**
 * S-130
 *
 * Gimmick: Export an ephemeral key file and return that exact key to the page.
 * Uses: Web Crypto, Blob URLs, file download, and local file input.
 * Success: Export the key, then import a valid file whose token hash matches this attempt.
 * Privacy/Permission: Store only the token hash; reject oversized or malformed local files.
 * Cleanup: Revoke the download URL immediately; clear the file input after each read.
 * Human verification: H-014, H-020, H-025
 */
export default function S130Stage(props: StageComponentProps) {
  const exportProblem = props.problem("S-130-B01");
  const importProblem = props.problem("S-130-B02");
  const [status, setStatus] = useState("");
  const [attemptKeyHash, setAttemptKeyHash] = useState<string | null>(null);

  const exportKey = async () => {
    const bytes = crypto.getRandomValues(new Uint8Array(18));
    const token = btoa(String.fromCharCode(...bytes));
    const hash = await hashToken(token);
    setAttemptKeyHash(hash);
    props.observe("S-130:key", [hash]);
    exportProblem.solve(["file:exported"]);
    const blob = new Blob(
      [JSON.stringify({ format: "busybox-key-v1", token })],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "busybox-key.busykey";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importKey = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || file.size > 4096) {
      setStatus("invalid");
      return;
    }
    try {
      const value: unknown = JSON.parse(await file.text());
      if (!isKeyFile(value)) throw new Error("invalid key file");
      const hash = await hashToken(value.token);
      if (hash !== attemptKeyHash) throw new Error("different key");
      importProblem.solve(["file:returned"]);
      setStatus("matched");
    } catch {
      setStatus("invalid");
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        <ProblemGiftBox problem={exportProblem} locale={props.locale} />
        <ProblemGiftBox problem={importProblem} locale={props.locale} />
      </div>
      <button
        type="button"
        className="stage-action"
        onClick={() => void exportKey()}
      >
        {props.locale === "ja" ? "鍵を外へ" : "Send key outside"}
      </button>
      <label className="stage-action file-action">
        {props.locale === "ja" ? "鍵を戻す" : "Bring key back"}
        <input
          type="file"
          accept=".busykey,application/json"
          onChange={(event) => void importKey(event)}
        />
      </label>
      <p role="status">{status}</p>
    </div>
  );
}
