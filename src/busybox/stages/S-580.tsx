import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

function normalizeSpeech(value: string) {
  return value.toLowerCase().replace(/[\s\p{P}\p{S}]/gu, "");
}

/** S-580 — recognize the spoken word busybox; there is no text-input route. H-006/H-007/H-027. */
export default function S580Stage(props: StageComponentProps) {
  const problem = props.problem("S-580-B01");
  const synthesisProblem = props.problem("S-580-B02");
  const recognition = useRef<SpeechRecognition | null>(null);
  const synthesis = useRef<SpeechSynthesis | null>(null);
  const [status, setStatus] = useState("");
  const start = () => {
    const Constructor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Constructor) return;
    const instance = new Constructor();
    recognition.current = instance;
    // The answer is the English product name; UI localization must not change
    // the recognition language used by this browser API puzzle.
    instance.lang = "en-US";
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
  const speakShifted = () => {
    const current = window.speechSynthesis;
    if (!current || typeof SpeechSynthesisUtterance === "undefined") return;
    current.cancel();
    synthesis.current = current;
    const source = "aspuwiq";
    let index = 0;
    let started = false;
    let failed = false;
    const speakNext = () => {
      const character = source[index];
      if (!character) {
        if (started && !failed)
          synthesisProblem.solve(["speech-synthesis:completed"]);
        setStatus(props.locale === "ja" ? "発話完了" : "Speech complete");
        return;
      }
      const utterance = new SpeechSynthesisUtterance(character);
      utterance.lang = "en-US";
      utterance.onstart = () => {
        started = true;
      };
      utterance.onend = () => {
        index += 1;
        speakNext();
      };
      utterance.onerror = () => {
        failed = true;
        setStatus(props.locale === "ja" ? "発話エラー" : "Speech error");
      };
      current.speak(utterance);
    };
    setStatus(
      props.locale === "ja"
        ? "一文字ずつ発話中…"
        : "Speaking one character at a time…",
    );
    speakNext();
  };
  useEffect(() => {
    const cancel = () => {
      recognition.current?.abort();
      synthesis.current?.cancel();
    };
    props.signal.addEventListener("abort", cancel, { once: true });
    return () => {
      props.signal.removeEventListener("abort", cancel);
      cancel();
    };
  }, [props.signal]);
  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        <ProblemGiftBox problem={problem} locale={props.locale} />
        <ProblemGiftBox problem={synthesisProblem} locale={props.locale} />
      </div>
      <div className="stage-actions">
        <button type="button" className="stage-action" onClick={start}>
          {props.locale === "ja" ? "聞き取る" : "Listen"}
        </button>
        <button type="button" className="stage-action" onClick={speakShifted}>
          {props.locale === "ja" ? "ずれた声を聞く" : "Hear the shifted voice"}
        </button>
      </div>
      <p className="interaction-status" role="status">
        {status}
      </p>
    </div>
  );
}
