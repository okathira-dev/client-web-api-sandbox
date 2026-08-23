import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { statusText } from "../ui/statusLocale";
import { stageText } from "./locale";
import { s390Locale } from "./S-390.locale";
import { randomBytes } from "./webauthn";

/**
 * S-390
 *
 * 目的: 「待つ資格情報」で、B01「一致なしの箱」、B02「中断の箱」に対応する実際のブラウザ状態・標準UI・端末入力を観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: S-390の判定に必要な実装内のWeb API。共通runtimeは進捗表示だけを担う。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
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
          {stageText(props.locale, s390Locale.noMatchKey)}
        </button>
        <button type="button" className="stage-action" onClick={begin}>
          {stageText(props.locale, s390Locale.beginWaiting)}
        </button>
        <button
          type="button"
          className="stage-action"
          disabled={!pending.current}
          onClick={() => pending.current?.abort()}
        >
          {stageText(props.locale, s390Locale.abort)}
        </button>
      </div>
      <p className="interaction-status" role="status">
        {status === "no-match"
          ? stageText(props.locale, s390Locale.noMatchKey)
          : statusText(props.locale, status)}
      </p>
    </div>
  );
}
