import { useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s380Locale } from "./S-380.locale";
import {
  credentialKey,
  fromBase64Url,
  randomBytes,
  toBase64Url,
} from "./webauthn";

/**
 * S-380
 *
 * 目的: 「三つの資格情報」で、B01「保存の箱」、B02「利用成功の箱」、B03「利用失敗の箱」に対応する実際のブラウザ状態・標準UI・端末入力を観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: S-380の判定に必要な実装内のWeb API。共通runtimeは進捗表示だけを担う。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
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
        aria-label={stageText(props.locale, s380Locale.passkeyAccount)}
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
        {status
          ? `${stageText(props.locale, s380Locale.browserError)}: ${status}`
          : null}
      </p>
      <p className="permission-note">
        {stageText(props.locale, s380Locale.passkeyNote)}
      </p>
    </div>
  );
}
