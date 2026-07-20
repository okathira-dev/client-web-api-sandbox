import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { randomBytes } from "./webauthn";

/** S-390 — distinguish a real no-match WebAuthn rejection from player-triggered AbortSignal cancellation. H-019/H-020/H-023. */
export default function S390Stage(props: StageComponentProps) {
  const noMatch = props.problem("S-390-B01");
  const abortBox = props.problem("S-390-B02");
  const pending = useRef<AbortController | null>(null);
  const [status, setStatus] = useState("");
  const requestNoMatch = async () => {
    try {
      await navigator.credentials.get({
        publicKey: {
          challenge: randomBytes(),
          rpId: location.hostname,
          allowCredentials: [{ type: "public-key", id: randomBytes(32) }],
          timeout: 30000,
        },
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        noMatch.solve(["webauthn:no-match"]);
        setStatus("no-match");
      }
    }
  };
  const begin = () => {
    const controller = new AbortController();
    pending.current = controller;
    setStatus("pending");
    void navigator.credentials
      .get({
        mediation: "conditional",
        signal: controller.signal,
        publicKey: {
          challenge: randomBytes(),
          rpId: location.hostname,
          timeout: 120000,
        },
      })
      .catch((error) => {
        if (
          error instanceof DOMException &&
          error.name === "AbortError" &&
          controller.signal.aborted &&
          !props.signal.aborted
        ) {
          abortBox.solve(["webauthn:player-abort"]);
          setStatus("aborted");
        }
      });
  };
  useEffect(() => {
    const cancel = () => pending.current?.abort();
    props.signal.addEventListener("abort", cancel, { once: true });
    return () => props.signal.removeEventListener("abort", cancel);
  }, [props.signal]);
  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        <ProblemGiftBox problem={noMatch} locale={props.locale} />
        <ProblemGiftBox problem={abortBox} locale={props.locale} />
      </div>
      <div className="stage-actions">
        <button
          type="button"
          className="stage-action"
          onClick={() => void requestNoMatch()}
        >
          {props.locale === "ja" ? "一致しない鍵" : "No-match key"}
        </button>
        <button type="button" className="stage-action" onClick={begin}>
          {props.locale === "ja" ? "待機開始" : "Begin waiting"}
        </button>
        <button
          type="button"
          className="stage-action"
          disabled={!pending.current}
          onClick={() => pending.current?.abort()}
        >
          {props.locale === "ja" ? "中断" : "Abort"}
        </button>
      </div>
      <p className="interaction-status" role="status">
        {status}
      </p>
    </div>
  );
}
