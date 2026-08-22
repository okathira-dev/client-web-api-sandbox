import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s750Locale } from "./S-750.locale";

type OTPCredentialLike = Credential & { readonly code: string };

function makeCode(): string {
  const value = crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
  return String(value % 1_000_000).padStart(6, "0");
}

/**
 * S-750
 *
 * 目的: 実SMSからbrowser所有のWebOTPまたはOS Security Code AutoFillが空のOTP専用欄へ自動入力する挙動を、一つのOR条件の箱として扱う。
 * 最初の一手: 画面のcurrent codeとorigin-bound最終行を含むSMS本文を、別の携帯電話または協力者からこの端末へ送ってもらい「SMSを待つ」を押す。
 * 箱ごとの解法: current attemptの実`OTPCredential.code`がcurrent codeと一致するか、最初から空だった`autocomplete=one-time-code`欄へtrusted一括入力され、実`:autofill`状態とcurrent code一致を同時に確認するとB01が開く。
 * 開かない操作: 手入力、paste、drop、composition、script代入、事前入力、別attempt code、空credential、input event列だけの推定では開かない。
 * 使用API: WebOTP、Credentials Management、OTPCredential、`autocomplete="one-time-code"`、`:autofill`。
 * 権限・privacy: 電話番号、送信者、SMS本文、code、到着時刻、入力履歴を保存・同期・送信しない。codeはattempt memoryだけに置く。
 * cleanup: 新しい封書、取消、stage離脱、abortでpending credentials requestをabortし、入力値、code参照、listenerを破棄する。
 * 対応環境: WebOTP対応browser、または実`:autofill`を公開するSafari / WebKit等。手入力fallbackを成功経路にしない。
 * 人手確認: H-003/H-004/H-019/H-020/H-023/H-025/H-046で実SMS、native確認UI、iOS AutoFill、取消、replay、連絡先条件、料金説明を確認する。
 */
export default function S750Stage(props: StageComponentProps) {
  const problem = props.problem("S-750-B01");
  const [code, setCode] = useState(makeCode);
  const inputRef = useRef<HTMLInputElement>(null);
  const controllerRef = useRef<AbortController | undefined>(undefined);
  const contaminatedRef = useRef(false);
  const startedEmptyRef = useRef(true);
  const [status, setStatus] = useState(() =>
    stageText(props.locale, s750Locale.idle),
  );
  const sms = `${props.locale === "ja" ? "Busyboxの封書です。" : "Busybox letter."}\n\n@${location.host} #${code}`;

  const reset = () => {
    controllerRef.current?.abort();
    controllerRef.current = undefined;
    if (inputRef.current) inputRef.current.value = "";
    contaminatedRef.current = false;
    startedEmptyRef.current = true;
    setCode(makeCode());
    setStatus(stageText(props.locale, s750Locale.idle));
  };

  useEffect(() => {
    const stop = () => controllerRef.current?.abort();
    props.signal.addEventListener("abort", stop, { once: true });
    return () => {
      props.signal.removeEventListener("abort", stop);
      stop();
    };
  }, [props.signal]);

  const requestOtp = async () => {
    const credentials = navigator.credentials as unknown as {
      get(options: {
        otp: { transport: ["sms"] };
        signal: AbortSignal;
      }): Promise<Credential | null>;
    };
    if (!("OTPCredential" in window) || !credentials?.get) {
      setStatus(stageText(props.locale, s750Locale.unavailable));
      return;
    }
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setStatus(stageText(props.locale, s750Locale.waiting));
    try {
      const credential = (await credentials.get({
        otp: { transport: ["sms"] },
        signal: controller.signal,
      })) as OTPCredentialLike | null;
      if (!credential || credential.code !== code) {
        setStatus(stageText(props.locale, s750Locale.manual));
        return;
      }
      if (inputRef.current) inputRef.current.value = credential.code;
      problem.solve(["otp:webotp", "otp:current-code"]);
      setStatus(stageText(props.locale, s750Locale.received));
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStatus(stageText(props.locale, s750Locale.cancelled));
    }
  };

  const onInput = (event: React.FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    let autofilled = false;
    try {
      autofilled = input.matches(":autofill");
    } catch {
      autofilled = false;
    }
    if (
      event.nativeEvent.isTrusted &&
      startedEmptyRef.current &&
      !contaminatedRef.current &&
      autofilled &&
      input.value === code
    ) {
      problem.solve(["otp:autofill", "otp:current-code"]);
      setStatus(stageText(props.locale, s750Locale.received));
      return;
    }
    setStatus(stageText(props.locale, s750Locale.manual));
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        <ProblemGiftBox problem={problem} locale={props.locale} />
      </div>
      <p>{stageText(props.locale, s750Locale.instruction)}</p>
      <pre className="s750-sms">{sms}</pre>
      <label className="stage-field">
        <span>{stageText(props.locale, s750Locale.inputLabel)}</span>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          title={stageText(props.locale, s750Locale.inputLabel)}
          onBeforeInput={(event) => {
            if (event.nativeEvent.isTrusted) {
              startedEmptyRef.current = event.currentTarget.value.length === 0;
            }
          }}
          onPaste={() => {
            contaminatedRef.current = true;
          }}
          onDrop={() => {
            contaminatedRef.current = true;
          }}
          onCompositionStart={() => {
            contaminatedRef.current = true;
          }}
          onInput={onInput}
        />
      </label>
      <div className="stage-action-row">
        <button
          type="button"
          className="stage-action"
          onClick={() => void requestOtp()}
        >
          {stageText(props.locale, s750Locale.request)}
        </button>
        <button
          type="button"
          className="stage-action"
          onClick={() => {
            void navigator.clipboard
              .writeText(sms)
              .then(() => setStatus(stageText(props.locale, s750Locale.copied)))
              .catch(() =>
                setStatus(stageText(props.locale, s750Locale.cancelled)),
              );
          }}
        >
          {stageText(props.locale, s750Locale.copy)}
        </button>
        <button type="button" className="stage-action" onClick={reset}>
          {stageText(props.locale, s750Locale.reset)}
        </button>
      </div>
      <p className="stage-status" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
