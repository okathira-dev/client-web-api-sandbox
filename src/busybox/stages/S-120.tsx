import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { statusText } from "../ui/statusLocale";
import { stageText } from "./locale";
import { s120Locale } from "./S-120.locale";
import { stopMediaStream } from "./shared/media";

type InteractionState = "idle" | "active" | "denied" | "unavailable";

/**
 * S-120
 *
 * Gimmick: Draw only the loudness shape of a quiet-loud-quiet sound sequence.
 * Uses: getUserMedia, Web Audio AnalyserNode, and requestAnimationFrame.
 * Success: Observe RMS below 0.05, above 0.2, then below 0.06.
 * Privacy/Permission: Request microphone access only from the action; retain no audio samples.
 * Cleanup: Cancel sampling, disconnect audio, stop tracks, and close AudioContext on exit.
 * Human verification: H-006, H-007, H-019, H-025
 */
/**
 * S-120
 *
 * 目的: S-120の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S120Stage(props: StageComponentProps) {
  const problem = props.problem("S-120-B01");
  const [status, setStatus] = useState<InteractionState>("idle");
  const [level, setLevel] = useState(0);
  const cleanupRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    const cleanup = () => cleanupRef.current();
    props.signal.addEventListener("abort", cleanup, { once: true });
    return () => {
      props.signal.removeEventListener("abort", cleanup);
      cleanup();
    };
  }, [props.signal]);

  const start = async () => {
    cleanupRef.current();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      let context: AudioContext | null = null;
      let source: MediaStreamAudioSourceNode | null = null;
      let animationFrame = 0;
      cleanupRef.current = () => {
        cancelAnimationFrame(animationFrame);
        source?.disconnect();
        stopMediaStream(stream);
        if (context) void context.close();
      };
      if (props.signal.aborted) {
        cleanupRef.current();
        return;
      }
      context = new AudioContext();
      source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const samples = new Uint8Array(analyser.fftSize);
      let phase = 0;
      let lastPaint = 0;

      const sample = (time: number) => {
        analyser.getByteTimeDomainData(samples);
        let sum = 0;
        for (const value of samples) {
          const normalized = (value - 128) / 128;
          sum += normalized * normalized;
        }
        const rms = Math.sqrt(sum / samples.length);
        if (time - lastPaint > 100) {
          setLevel(rms);
          lastPaint = time;
        }
        if (phase === 0 && rms < 0.05) phase = 1;
        else if (phase === 1 && rms > 0.2) phase = 2;
        else if (phase === 2 && rms < 0.06) {
          problem.solve(["audio:quiet-loud-quiet"]);
        }
        animationFrame = requestAnimationFrame(sample);
      };
      animationFrame = requestAnimationFrame(sample);

      // Only the RMS scalar reaches React state; samples are never persisted or sent.
      setStatus("active");
    } catch (error) {
      cleanupRef.current();
      if (props.signal.aborted) return;
      setStatus(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "denied"
          : "unavailable",
      );
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <div
        className="sound-ring"
        style={{ transform: `scale(${1 + Math.min(1, level * 3)})` }}
        aria-hidden="true"
      />
      <button
        type="button"
        className="stage-action"
        onClick={() => void start()}
      >
        {stageText(props.locale, s120Locale.seeSound)}
      </button>
      <p className="interaction-status" role="status">
        {statusText(props.locale, status)}
      </p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
