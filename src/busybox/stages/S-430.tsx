import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s430Locale } from "./S-430.locale";

/** S-430 — only the registered Media Session pause action opens the box. H-004/H-019/H-023. */
/**
 * S-430
 *
 * 目的: S-430の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S430Stage(props: StageComponentProps) {
  const problem = props.problem("S-430-B01");
  const context = useRef<AudioContext | null>(null);
  const oscillator = useRef<OscillatorNode | null>(null);
  const [status, setStatus] = useState("idle");
  const start = async () => {
    try {
      oscillator.current?.stop();
    } catch {}
    await context.current?.close();
    const audio = new AudioContext();
    const tone = audio.createOscillator();
    const gain = audio.createGain();
    gain.gain.value = 0.035;
    tone.connect(gain).connect(audio.destination);
    tone.start();
    context.current = audio;
    oscillator.current = tone;
    setStatus("playing");
    navigator.mediaSession.metadata = new MediaMetadata({
      title: "Busybox",
      artist: stageText(props.locale, s430Locale.outsideControl),
    });
    navigator.mediaSession.playbackState = "playing";
    navigator.mediaSession.setActionHandler("pause", () => {
      tone.stop();
      void audio.close();
      navigator.mediaSession.playbackState = "paused";
      setStatus("pausedOutside");
      problem.solve(["media-session:pause-handler"]);
    });
  };
  useEffect(() => {
    const cleanup = () => {
      navigator.mediaSession.setActionHandler("pause", null);
      try {
        oscillator.current?.stop();
      } catch {}
      void context.current?.close();
    };
    props.signal.addEventListener("abort", cleanup, { once: true });
    return () => {
      props.signal.removeEventListener("abort", cleanup);
      cleanup();
    };
  }, [props.signal]);
  return (
    <div className="puzzle puzzle--centered">
      <ProblemGiftBox problem={problem} locale={props.locale} />
      <button
        type="button"
        className="stage-action"
        onClick={() => void start()}
      >
        {stageText(props.locale, s430Locale.startSound)}
      </button>
      <p role="status">
        {status === "pausedOutside"
          ? stageText(props.locale, s430Locale.pausedOutside)
          : status === "playing"
            ? stageText(props.locale, s430Locale.playing)
            : stageText(props.locale, s430Locale.idle)}
      </p>
    </div>
  );
}
