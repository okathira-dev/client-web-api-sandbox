import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

function normalizeSpeech(value: string) {
  return value.toLowerCase().replace(/[\s\p{P}\p{S}]/gu, "");
}

/** S-580 — recognize the spoken word busybox; there is no text-input route. H-006/H-007/H-027. */
export default function S580Stage(props: StageComponentProps) {
  const problem = props.problem("S-580-B01");
  const recognition = useRef<SpeechRecognition | null>(null);
  const [status, setStatus] = useState("");
  const start = () => {
    const Constructor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Constructor) return;
    const instance = new Constructor();
    recognition.current = instance;
    instance.lang = props.locale === "ja" ? "ja-JP" : "en-US";
    instance.interimResults = false;
    instance.onresult = (event) => {
      const alternatives = Array.from(
        { length: event.results.length },
        (_, resultIndex) => event.results[resultIndex],
      ).flatMap((result) =>
        result
          ? Array.from(
              { length: result.length },
              (_, index) => result[index]?.transcript ?? "",
            )
          : [],
      );
      setStatus(alternatives[0] ?? "");
      if (alternatives.some((value) => normalizeSpeech(value) === "busybox"))
        problem.solve(["speech:busybox"]);
    };
    instance.onerror = () =>
      setStatus(props.locale === "ja" ? "認識できない" : "Not recognized");
    instance.start();
  };
  useEffect(() => {
    const cancel = () => recognition.current?.abort();
    props.signal.addEventListener("abort", cancel, { once: true });
    return () => {
      props.signal.removeEventListener("abort", cancel);
      cancel();
    };
  }, [props.signal]);
  return (
    <div className="puzzle puzzle--centered">
      <ProblemGiftBox problem={problem} locale={props.locale} />
      <button type="button" className="stage-action" onClick={start}>
        {props.locale === "ja" ? "聞き取る" : "Listen"}
      </button>
      <p className="interaction-status" role="status">
        {status}
      </p>
    </div>
  );
}
