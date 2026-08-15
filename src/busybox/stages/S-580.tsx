import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s580Locale } from "./S-580.locale";

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
/**
 * S-580
 *
 * 目的: S-580の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
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
      setStatus(stageText(props.locale, s580Locale.notRecognized));
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
        setStatus(stageText(props.locale, s580Locale.speechComplete));
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
        setStatus(stageText(props.locale, s580Locale.speechError));
      };
      current.speak(utterance);
    };
    setStatus(stageText(props.locale, s580Locale.speaking));
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
          {stageText(props.locale, s580Locale.listen)}
        </button>
        <button type="button" className="stage-action" onClick={speakShifted}>
          {stageText(props.locale, s580Locale.shifted)}
        </button>
      </div>
      <p className="interaction-status" role="status">
        {status}
      </p>
    </div>
  );
}
