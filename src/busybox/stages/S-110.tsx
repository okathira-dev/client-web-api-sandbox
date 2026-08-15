import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { statusText } from "../ui/statusLocale";
import { stageText } from "./locale";
import { s110Locale } from "./S-110.locale";
import { stopMediaStream } from "./shared/media";

type InteractionState = "idle" | "active" | "denied" | "unavailable";

/**
 * S-110
 *
 * Gimmick: Cover the camera, then reveal a bright scene without showing an image.
 * Uses: getUserMedia, an off-DOM video, and coarse canvas luminance sampling.
 * Success: Observe luminance below 55 followed by luminance above 165.
 * Privacy/Permission: Request camera access only from the action; retain no pixels or frames.
 * Cleanup: Stop sampling, every media track, and the video source on retry or exit.
 * Human verification: H-006, H-007, H-019, H-025
 */
/**
 * S-110
 *
 * 目的: S-110の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S110Stage(props: StageComponentProps) {
  const problem = props.problem("S-110-B01");
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
          problem.solve(["camera:dark-light"]);
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
        {stageText(props.locale, s110Locale.seeOnlyLight)}
      </button>
      <p className="interaction-status" role="status">
        {statusText(props.locale, status)}
      </p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
