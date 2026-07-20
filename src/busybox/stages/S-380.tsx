import { useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import {
  credentialKey,
  fromBase64Url,
  randomBytes,
  toBase64Url,
} from "./webauthn";

/** S-380 — create a passkey, use it through Conditional UI, and observe an unavailable credential. H-006/H-019/H-023. */
export default function S380Stage(props: StageComponentProps) {
  const createBox = props.problem("S-380-B01");
  const successBox = props.problem("S-380-B02");
  const failureBox = props.problem("S-380-B03");
  const [status, setStatus] = useState("");
  const create = async () => {
    try {
      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge: randomBytes(),
          rp: { name: "Busybox", id: location.hostname },
          user: {
            id: randomBytes(16),
            name: `busybox-${crypto.randomUUID()}@local.invalid`,
            displayName: "Busybox player",
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 },
            { type: "public-key", alg: -257 },
          ],
          authenticatorSelection: {
            residentKey: "required",
            userVerification: "preferred",
          },
          timeout: 120000,
          attestation: "none",
        },
      })) as PublicKeyCredential | null;
      if (!credential || props.signal.aborted) return;
      localStorage.setItem(credentialKey, toBase64Url(credential.rawId));
      createBox.solve(["webauthn:created"]);
      setStatus("created");
    } catch (error) {
      if (!props.signal.aborted)
        setStatus(error instanceof DOMException ? error.name : "error");
    }
  };
  const requestConditional = async () => {
    try {
      const credential = await navigator.credentials.get({
        mediation: "conditional",
        publicKey: {
          challenge: randomBytes(),
          rpId: location.hostname,
          timeout: 120000,
          userVerification: "preferred",
        },
      });
      if (credential && !props.signal.aborted) {
        successBox.solve(["webauthn:conditional-success"]);
        setStatus("used");
      }
    } catch (error) {
      if (!props.signal.aborted)
        setStatus(error instanceof DOMException ? error.name : "error");
    }
  };
  const fail = async () => {
    try {
      const stored = localStorage.getItem(credentialKey);
      const wrong = stored
        ? fromBase64Url(stored).map((value, index) =>
            index === 0 ? value ^ 255 : value,
          )
        : randomBytes(32);
      await navigator.credentials.get({
        publicKey: {
          challenge: randomBytes(),
          rpId: location.hostname,
          allowCredentials: [{ type: "public-key", id: wrong }],
          timeout: 30000,
        },
      });
    } catch (error) {
      if (
        !props.signal.aborted &&
        error instanceof DOMException &&
        ["NotAllowedError", "InvalidStateError"].includes(error.name)
      ) {
        failureBox.solve([`webauthn:failure:${error.name}`]);
        setStatus(error.name);
      }
    }
  };
  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        {[createBox, successBox, failureBox].map((problem) => (
          <ProblemGiftBox
            key={problem.definition.id}
            problem={problem}
            locale={props.locale}
          />
        ))}
      </div>
      <input
        className="passkey-field"
        autoComplete="username webauthn"
        aria-label="Passkey account"
      />
      <div className="stage-actions">
        <button
          type="button"
          className="stage-action"
          onClick={() => void create()}
        >
          🔑
        </button>
        <button
          type="button"
          className="stage-action"
          onClick={() => void requestConditional()}
        >
          🔒
        </button>
        <button
          type="button"
          className="stage-action"
          onClick={() => void fail()}
        >
          ⊘
        </button>
      </div>
      <p className="interaction-status" role="status">
        {status}
      </p>
      <p className="permission-note">
        {props.locale === "ja"
          ? "作成したpasskeyは端末のpasskey管理画面に残る。遊び終えたらBusybox用passkeyをそこで削除できる。"
          : "The created passkey remains in your device's passkey manager. You can remove the Busybox passkey there after playing."}
      </p>
    </div>
  );
}
