import { useEffect, useMemo, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import {
  type S710EligibilityMessage,
  type S710FlagKind,
  s710Flags,
} from "./s710Protocol";

const flagKinds = Object.keys(s710Flags) as S710FlagKind[];

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
    return url.href;
  }, [session]);

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
        title={
          props.locale === "ja"
            ? "外部動画圧縮ツール"
            : "Embedded video compression tool"
        }
        allow="camera"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-downloads"
      />
      <label className="parallel-answer s710-answer">
        {props.locale === "ja" ? "合言葉" : "Password"}
        <input
          value={answer}
          placeholder="BUSYBOX{…}"
          disabled={!flagKinds.some((kind) => eligible[kind])}
          onChange={(event) => {
            const next = event.currentTarget.value;
            setAnswer(next);
            const kind = flagKinds.find(
              (candidate) =>
                eligible[candidate] && s710Flags[candidate] === next,
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
