import VolumeUpOutlined from "@mui/icons-material/VolumeUpOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useEffect, useRef, useState } from "react";
import { stageText } from "../locale";
import { locale } from "./locale";

function normalizeSpeech(value: string) {
  return value.toLowerCase().replace(/[\s\p{P}\p{S}]/gu, "");
}

/**
 * S-580 — SpeechRecognitionとSpeechSynthesisを、文字入力なしで体験する。
 * 目的: UI言語ではなく認識側をen-USに固定し、busyboxという音声を聞き取る。
 * 最初の一手: B01は「聞き取る」でbusyboxを発話し、B02はずれた一文字ずつの音声を聞いて元の語を推理する。
 * 箱ごとの成功条件: B01はrecognized transcriptがbusybox、B02はsynthesis終了後の実utterance列を観測した時だけ開く。
 * 開かない操作: テキスト欄、status文字列の編集、synthesis開始だけ、別言語の発話では開かない。
 * API/権限: SpeechRecognitionとSpeechSynthesis。マイクはB01の明示操作時だけ要求し、音声・認識履歴は保存・送信しない。
 * cleanup/環境: recognitionをabortし、utteranceとspeech synthesisをcancelする。en-US音声が使える環境でH-006/H-007/H-019/H-020/H-023/H-025/H-027を確認する。
 */
function S580Stage(props: Props) {
  const problem = props.boxes[manifest.box.B01];
  const synthesisProblem = props.boxes[manifest.box.B02];
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
        problem.solve();
    };
    instance.onerror = () =>
      setStatus(stageText(props.locale, locale.notRecognized));
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
        if (started && !failed) synthesisProblem.solve();
        setStatus(stageText(props.locale, locale.speechComplete));
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
        setStatus(stageText(props.locale, locale.speechError));
      };
      current.speak(utterance);
    };
    setStatus(stageText(props.locale, locale.speaking));
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
        <StageProblemGiftBox box={problem} locale={props.locale} />
        <StageProblemGiftBox box={synthesisProblem} locale={props.locale} />
      </div>
      <div className="stage-actions">
        <button type="button" className="stage-action" onClick={start}>
          {stageText(props.locale, locale.listen)}
        </button>
        <button type="button" className="stage-action" onClick={speakShifted}>
          {stageText(props.locale, locale.shifted)}
        </button>
      </div>
      <p className="interaction-status" role="status">
        {status}
      </p>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: VolumeUpOutlined,
      color: "#f472b6",
      label: locale.B01,
    },
    [manifest.box.B02]: {
      icon: VolumeUpOutlined,
      color: "#ec4899",
      label: locale.B02,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window
        ? "permission-required"
        : "unsupported",
    ),
  Component: S580Stage,
});
