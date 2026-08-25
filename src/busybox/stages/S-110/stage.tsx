import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
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
 * S-110
 *
 * 目的: 「光だけを見る」で、B01「光の箱」に対応する実際のブラウザ状態・標準UI・端末入力を観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: S-110の判定に必要な実装内のWeb API。共通runtimeは進捗表示だけを担う。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
function S110Stage(props: Props) {
  const problem = props.boxes[manifest.box.B01];
  const [status, setStatus] = useState<InteractionState>("idle");
  const [brightness, setBrightness] = useState(0);
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
        video: {
          facingMode: "environment",
          width: { ideal: 320 },
          height: { ideal: 240 },
        },
        audio: false,
      });
      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.srcObject = stream;
      let timer: number | undefined;
      cleanupRef.current = () => {
        if (timer !== undefined) window.clearInterval(timer);
        stopMediaStream(stream);
        video.srcObject = null;
      };
      if (props.signal.aborted) {
        cleanupRef.current();
        return;
      }
      await video.play();
      if (props.signal.aborted) {
        cleanupRef.current();
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 24;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      let darkSeen = false;
      timer = window.setInterval(() => {
        if (!context || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA)
          return;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const pixels = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
        ).data;
        let total = 0;
        for (let index = 0; index < pixels.length; index += 4) {
          total +=
            ((pixels[index] ?? 0) +
              (pixels[index + 1] ?? 0) +
              (pixels[index + 2] ?? 0)) /
            3;
        }
        const nextBrightness = total / (pixels.length / 4);
        setBrightness(nextBrightness);
        if (nextBrightness < 55) darkSeen = true;
        if (darkSeen && nextBrightness > 165) {
          problem.solve();
        }
      }, 200);

      // Derived luminance exists only for this attempt; no pixel leaves memory.
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
      <div className="light-meter" aria-hidden="true">
        <span
          style={{ width: `${Math.min(100, (brightness / 255) * 100)}%` }}
        />
      </div>
      <button
        type="button"
        className="stage-action"
        onClick={() => void start()}
      >
        {stageText(props.locale, locale.seeOnlyLight)}
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
      icon: LightModeOutlined,
      color: "#facc15",
      label: locale.B01,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      isSecureContext && "mediaDevices" in navigator
        ? "permission-required"
        : "unsupported",
    ),
  Component: S110Stage,
});
