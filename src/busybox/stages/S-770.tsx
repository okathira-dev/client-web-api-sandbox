import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { type GoogleFedCmResult, isManualGoogleFedCm } from "./S-770.functions";
import { s770Locale } from "./S-770.locale";

type GoogleIdentityServices = {
  accounts: {
    id: {
      initialize(options: {
        client_id: string;
        auto_select: false;
        callback(response: GoogleFedCmResult): void;
      }): void;
      prompt(): void;
      cancel(): void;
    };
  };
};

let googleScriptPromise: Promise<void> | undefined;

function loadGoogleIdentityServices(): Promise<void> {
  if ((window as Window & { google?: GoogleIdentityServices }).google)
    return Promise.resolve();
  googleScriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      googleScriptPromise = undefined;
      reject(new Error("Google Identity Services failed"));
    };
    document.head.append(script);
  });
  return googleScriptPromise;
}

/**
 * S-770
 *
 * 目的: 通常OAuth loginではなく、公式managed IdPとbrowserが仲介するFedCM account chooserで身分証を一度だけ手動提示する。
 * 最初の一手: 公開originに専用Google Web client IDが設定された状態で「Googleの身分証を提示」を押し、browser所有UIのContinueを手動で完了する。
 * 箱ごとの解法: 公式Google Identity Services callbackが非空credentialと厳密な`select_by === "fedcm"`をcurrent attemptへ返した時だけB01を開く。token内容は読まない。
 * 開かない操作: `fedcm_auto`、`auto`、`user`、`btn`等、popup / redirect OAuth、Drive認可、mock provider、空token、取消、late callback、game製chooserでは開かない。
 * 使用API: FedCM、Google Identity Services JavaScript API、IdentityCredentialのbrowser mediation。
 * 権限・privacy: tokenをdecode、検証、表示、console出力、storage、Drive、analytics、backend、別endpointへ渡さず、callback内のboolean判定後に参照を破棄する。account属性を取得しない。
 * cleanup: cancel、reset、stage離脱、abortでGIS promptをcancelしattempt generationを更新してlate / duplicate callbackを拒否する。provider側grantは自動revokeしない。
 * 対応環境: FedCM対応browser、Google account、online接続、公開originへ登録した専用client IDが必要。通常OAuthへfallbackしない。
 * 人手確認: H-003/H-004/H-019/H-023/H-025/H-049でclient登録、native UI、manual Continue、cancel、automatic拒否、解除案内、token非保存を確認する。
 */
export default function S770Stage(props: StageComponentProps) {
  const problem = props.problem("S-770-B01");
  const generationRef = useRef(0);
  const [status, setStatus] = useState(() =>
    stageText(props.locale, s770Locale.idle),
  );
  const clientId = import.meta.env.VITE_BUSYBOX_FEDCM_GOOGLE_CLIENT_ID as
    | string
    | undefined;

  useEffect(() => {
    const stop = () => {
      generationRef.current += 1;
      (
        window as Window & { google?: GoogleIdentityServices }
      ).google?.accounts.id.cancel();
    };
    props.signal.addEventListener("abort", stop, { once: true });
    return () => {
      props.signal.removeEventListener("abort", stop);
      stop();
    };
  }, [props.signal]);

  const startGoogle = async () => {
    if (!clientId) {
      setStatus(stageText(props.locale, s770Locale.unconfigured));
      return;
    }
    if (!("IdentityCredential" in window)) {
      setStatus(stageText(props.locale, s770Locale.unavailable));
      return;
    }
    const generation = generationRef.current + 1;
    generationRef.current = generation;
    setStatus(stageText(props.locale, s770Locale.loading));
    try {
      await loadGoogleIdentityServices();
      const google = (window as Window & { google?: GoogleIdentityServices })
        .google;
      if (!google) throw new Error("Google Identity Services unavailable");
      google.accounts.id.initialize({
        client_id: clientId,
        auto_select: false,
        callback: (response) => {
          if (generationRef.current !== generation) return;
          const manualFedCm = isManualGoogleFedCm(response);
          if (manualFedCm) {
            problem.solve(["fedcm:google", "fedcm:manual"]);
            setStatus(stageText(props.locale, s770Locale.success));
          } else {
            setStatus(stageText(props.locale, s770Locale.rejected));
          }
        },
      });
      setStatus(stageText(props.locale, s770Locale.waiting));
      google.accounts.id.prompt();
    } catch {
      setStatus(stageText(props.locale, s770Locale.unavailable));
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        <ProblemGiftBox problem={problem} locale={props.locale} />
      </div>
      <button
        type="button"
        className="stage-action"
        onClick={() => void startGoogle()}
      >
        {stageText(props.locale, s770Locale.startGoogle)}
      </button>
      <p>{stageText(props.locale, s770Locale.privacy)}</p>
      <p className="stage-status" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
