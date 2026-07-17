import {
  type ClipboardEvent as ReactClipboardEvent,
  useMemo,
  useState,
} from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/**
 * S-180
 *
 * Gimmick: Send an attempt token through the system clipboard and paste it back.
 * Uses: Async Clipboard write and a trusted React paste event.
 * Success: Write the token, then paste the exact token into the target.
 * Privacy/Permission: Clipboard write occurs only from the action; pasted text is not retained.
 * Cleanup: The attempt token is discarded with the stage component.
 * Human verification: H-006, H-014, H-020, H-025
 */
export default function S180Stage(props: StageComponentProps) {
  const copyProblem = props.problem("S-180-B01");
  const pasteProblem = props.problem("S-180-B02");
  const token = useMemo(
    () => `BOX-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    [],
  );
  const [status, setStatus] = useState("");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(token);
      if (props.signal.aborted) return;
      copyProblem.solve(["clipboard:written"]);
      setStatus(props.locale === "ja" ? "外へ渡した" : "Sent outside");
    } catch {
      if (!props.signal.aborted) {
        setStatus(
          props.locale === "ja" ? "コピーできない" : "Copy unavailable",
        );
      }
    }
  };

  const paste = (event: ReactClipboardEvent<HTMLInputElement>) => {
    if (event.clipboardData.getData("text/plain").trim() === token) {
      pasteProblem.solve(["clipboard:pasted"]);
      setStatus(props.locale === "ja" ? "同じ印が戻った" : "The mark returned");
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        <ProblemGiftBox problem={copyProblem} locale={props.locale} />
        <ProblemGiftBox problem={pasteProblem} locale={props.locale} />
      </div>
      <code className="clipboard-token">{token}</code>
      <button
        type="button"
        className="stage-action"
        onClick={() => void copy()}
      >
        {props.locale === "ja" ? "印をコピー" : "Copy the mark"}
      </button>
      <label className="paste-target">
        {props.locale === "ja" ? "ここへ貼り付ける" : "Paste it here"}
        <input type="text" onPaste={paste} autoComplete="off" />
      </label>
      <p className="interaction-status" role="status">
        {status}
      </p>
    </div>
  );
}
