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
import { statusText } from "../../ui/statusLocale";
import { stageText } from "../locale";
import { stopMediaStream } from "../shared/media";
import { locale } from "./locale";

type InteractionState = "idle" | "active" | "denied" | "unavailable";

/**
 * S-120
 *
 * 目的: 「音のかたち」で、B01「音の箱」に対応する実際のブラウザ状態・標準UI・端末入力を観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: S-120の判定に必要な実装内のWeb API。共通runtimeは進捗表示だけを担う。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
function S120Stage(props: Props) {
  const problem = props.boxes[manifest.box.B01];
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
          problem.solve();
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
        {stageText(props.locale, locale.seeSound)}
      </button>
      <p className="interaction-status" role="status">
        {statusText(props.locale, status)}
      </p>
      <StageProblemGiftBox box={problem} locale={props.locale} />
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: VolumeUpOutlined,
      color: "#22d3ee",
      label: locale.B01,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      isSecureContext && "mediaDevices" in navigator && "AudioContext" in window
        ? "permission-required"
        : "unsupported",
    ),
  Component: S120Stage,
});
