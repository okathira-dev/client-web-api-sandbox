import { useEffect, useMemo, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s710Locale } from "./S-710.locale";
import {
  type S710EligibilityMessage,
  type S710FlagKind,
  s710Flags,
} from "./s710Protocol";

const flagKinds = Object.keys(s710Flags) as S710FlagKind[];

/**
 * S-710 — same-origin iframeの動画圧縮ツールで、変換結果を観察する。
 * 目的: 普通の変換UIから、特定フレームの差し替えとmetadata再入力を見つける。
 * 最初の一手: 入力動画または10秒録画を選び、右の変換動画を再生・downloadする。
 * 箱ごとの成功条件: B01は暗黒frame、B02はdecode失敗、B03は検出QRの四辺形差し替え、B04はmetadata overlayを確認してflagを入力する。
 * 開かない操作: eligibility通知の偽装、iframe外の直接solve、変換前のflag入力では開かない。
 * API/権限: MediaBunny、MediaRecorder、jsQR、Canvas、postMessage、カメラ（録画時のみ）。媒体は送信・永続保存しない。
 * cleanup/環境: session付きmessage、object URL、録画streamを離脱時に破棄する。H-003/H-004/H-006/H-007/H-014/H-019/H-020/H-023/H-025/H-042を確認する。
 */
export default function S710Stage(props: StageComponentProps) {
  const problems = useMemo(
    () =>
      (["B01", "B02", "B03", "B04"] as const).map((suffix) =>
        props.problem(`S-710-${suffix}`),
      ),
    [props.problem],
  );
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const session = useMemo(() => crypto.randomUUID(), []);
  const [eligible, setEligible] = useState<
    Partial<Record<S710FlagKind, boolean>>
  >({});
  const [answer, setAnswer] = useState("");
  const toolUrl = useMemo(() => {
    const url = new URL("./tools/s710/index.html", document.baseURI);
    url.searchParams.set("session", session);
    url.searchParams.set("locale", props.locale);
    return url.href;
  }, [props.locale, session]);

  useEffect(() => {
    const receive = (event: MessageEvent<unknown>) => {
      if (
        event.origin !== location.origin ||
        event.source !== iframeRef.current?.contentWindow ||
        !event.data ||
        typeof event.data !== "object"
      )
        return;
      const message = event.data as Partial<S710EligibilityMessage>;
      if (
        message.channel !== "busybox-s710-tool" ||
        message.type !== "eligibility" ||
        message.session !== session ||
        !message.eligible
      )
        return;
      setEligible(message.eligible);
      setAnswer("");
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [session]);

  return (
    <div className="puzzle s710-stage">
      <div className="problem-row">
        {problems.map((problem) => (
          <ProblemGiftBox
            key={problem.definition.id}
            problem={problem}
            locale={props.locale}
          />
        ))}
      </div>
      <iframe
        ref={iframeRef}
        className="s710-tool-frame"
        src={toolUrl}
        title={stageText(props.locale, s710Locale.iframeTitle)}
        allow="camera"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-downloads"
      />
      <label className="parallel-answer s710-answer">
        {stageText(props.locale, s710Locale.answer)}
        <input
          value={answer}
          placeholder={stageText(props.locale, s710Locale.placeholder)}
          disabled={!flagKinds.some((kind) => eligible[kind])}
          onChange={(event) => {
            const next = event.currentTarget.value;
            setAnswer(next);
            const normalized = next.trim().toLowerCase();
            const kind = flagKinds.find(
              (candidate) =>
                eligible[candidate] && s710Flags[candidate] === normalized,
            );
            if (!kind) return;
            const index =
              kind === "dark"
                ? 0
                : kind === "broken"
                  ? 1
                  : kind === "qr"
                    ? 2
                    : 3;
            problems[index]?.solve([`embedded-video-tool:${kind}:password`]);
          }}
        />
      </label>
    </div>
  );
}
