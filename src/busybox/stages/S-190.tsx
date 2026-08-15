import { useEffect, useMemo, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { statusText } from "../ui/statusLocale";
import { stageText } from "./locale";
import { s190Locale } from "./S-190.locale";
import { stopMediaStream } from "./shared/media";

type Signal = {
  sender: string;
  description?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
};
type InteractionState = "idle" | "active" | "cancelled" | "unavailable";

function containsArmedMarker(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
) {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context || video.videoWidth === 0) return false;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
  let cyan = 0,
    magenta = 0,
    yellow = 0,
    black = 0;
  for (let index = 0; index < data.length; index += 4) {
    const r = data[index] ?? 0,
      g = data[index + 1] ?? 0,
      b = data[index + 2] ?? 0;
    if (r < 30 && g > 210 && b > 210) cyan += 1;
    if (r > 210 && g < 30 && b > 210) magenta += 1;
    if (r > 210 && g > 210 && b < 30) yellow += 1;
    if (r < 20 && g < 20 && b < 20) black += 1;
  }
  return Math.min(cyan, magenta, yellow, black) >= 18;
}

/** S-190 — browser-surface frames, local MediaRecorder, cross-tab WebRTC relay, and an armed map marker decoded from real capture pixels. H-006/H-007/H-012/H-013/H-019/H-023. */
/**
 * S-190
 *
 * 目的: S-190の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S190Stage(props: StageComponentProps) {
  const recursive = props.problem("S-190-B01");
  const recording = props.problem("S-190-B02");
  const relay = props.problem("S-190-B03");
  const marker = props.problem("S-190-B04");
  const videoRef = useRef<HTMLVideoElement>(null);
  const scanRef = useRef<HTMLCanvasElement>(null);
  const cleanupRef = useRef<() => void>(() => undefined);
  const params = useMemo(() => new URL(location.href).searchParams, []);
  const round = useMemo(
    () => params.get("round") ?? crypto.randomUUID(),
    [params],
  );
  const observer = params.get("observer") === "1";
  const [status, setStatus] = useState<InteractionState>("idle");
  const [frames, setFrames] = useState(0);

  useEffect(() => {
    const markerChannel = new BroadcastChannel(`busybox:S-190:marker:${round}`);
    const arm = (event: MessageEvent<unknown>) => {
      if (event.data === `hello:${round}`)
        markerChannel.postMessage(`arm:${round}`);
    };
    markerChannel.addEventListener("message", arm);
    const cleanup = () => {
      cleanupRef.current();
      markerChannel.close();
    };
    props.signal.addEventListener("abort", cleanup, { once: true });
    return () => {
      props.signal.removeEventListener("abort", cleanup);
      cleanup();
    };
  }, [props.signal, round]);

  useEffect(() => {
    if (!observer) return;
    const signaling = new BroadcastChannel(`busybox:S-190:relay:${round}`);
    const sender = crypto.randomUUID();
    const peer = new RTCPeerConnection({ iceServers: [] });
    peer.ontrack = async (event) => {
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = event.streams[0] ?? new MediaStream([event.track]);
      await video.play();
      relay.solve(["screen-capture:webrtc-observer"]);
      setStatus("active");
    };
    peer.onicecandidate = (event) => {
      if (event.candidate)
        signaling.postMessage({
          sender,
          candidate: event.candidate.toJSON(),
        } satisfies Signal);
    };
    const receive = async (event: MessageEvent<Signal>) => {
      if (event.data.sender === sender) return;
      if (event.data.description?.type === "offer") {
        await peer.setRemoteDescription(event.data.description);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        signaling.postMessage({ sender, description: answer } satisfies Signal);
      }
      if (event.data.candidate)
        await peer.addIceCandidate(event.data.candidate);
    };
    signaling.addEventListener("message", receive);
    signaling.postMessage({
      sender,
      description: { type: "rollback" },
    } satisfies Signal);
    return () => {
      peer.close();
      signaling.close();
    };
  }, [observer, relay.solve, round]);

  const start = async () => {
    cleanupRef.current();
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
        preferCurrentTab: true,
        selfBrowserSurface: "include",
      } as DisplayMediaStreamOptions);
      const video = videoRef.current;
      if (!video) {
        stopMediaStream(stream);
        return;
      }
      video.srcObject = stream;
      if (props.signal.aborted) {
        stopMediaStream(stream);
        return;
      }
      await video.play();
      const timers: number[] = [];
      const peer = new RTCPeerConnection({ iceServers: [] });
      const signaling = new BroadcastChannel(`busybox:S-190:relay:${round}`);
      const sender = crypto.randomUUID();
      for (const track of stream.getTracks()) peer.addTrack(track, stream);
      peer.createDataChannel("capture-live");
      peer.onicecandidate = (event) => {
        if (event.candidate)
          signaling.postMessage({
            sender,
            candidate: event.candidate.toJSON(),
          } satisfies Signal);
      };
      signaling.addEventListener(
        "message",
        async (event: MessageEvent<Signal>) => {
          if (event.data.sender === sender) return;
          try {
            if (event.data.description?.type === "answer")
              await peer.setRemoteDescription(event.data.description);
            if (event.data.candidate)
              await peer.addIceCandidate(event.data.candidate);
          } catch {}
        },
      );
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      signaling.postMessage({ sender, description: offer } satisfies Signal);
      let recorder: MediaRecorder | undefined;
      if ("MediaRecorder" in window) {
        recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0)
            recording.solve(["screen-capture:recorded-chunk"]);
        };
        recorder.start(1000);
      }
      let observedFrames = 0;
      timers.push(
        window.setInterval(() => {
          if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
          observedFrames += 1;
          setFrames(observedFrames);
          const surface = stream
            .getVideoTracks()[0]
            ?.getSettings().displaySurface;
          if (observedFrames >= 12 && surface === "browser")
            recursive.solve(["display-capture:browser-surface"]);
          const canvas = scanRef.current;
          if (canvas && containsArmedMarker(video, canvas))
            marker.solve(["display-capture:armed-map-marker"]);
        }, 150),
      );
      cleanupRef.current = () => {
        timers.forEach((timer) => {
          clearInterval(timer);
        });
        if (recorder?.state !== "inactive") recorder?.stop();
        peer.close();
        signaling.close();
        stopMediaStream(stream);
        video.srcObject = null;
      };
      stream
        .getVideoTracks()[0]
        ?.addEventListener("ended", cleanupRef.current, { once: true });
      setStatus("active");
    } catch (error) {
      cleanupRef.current();
      if (props.signal.aborted) return;
      setStatus(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "cancelled"
          : "unavailable",
      );
    }
  };
  const observerUrl = new URL(location.href);
  observerUrl.searchParams.set("round", round);
  observerUrl.searchParams.set("observer", "1");
  const mapUrl = new URL(location.href);
  mapUrl.searchParams.delete("stage");
  mapUrl.searchParams.set("map-round", round);
  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        {[recursive, recording, relay, marker].map((problem) => (
          <ProblemGiftBox
            key={problem.definition.id}
            problem={problem}
            locale={props.locale}
          />
        ))}
      </div>
      <video
        ref={videoRef}
        className="capture-preview"
        muted
        playsInline
        aria-label={
          observer
            ? stageText(props.locale, s190Locale.relayedScreen)
            : stageText(props.locale, s190Locale.sharedScreen)
        }
      >
        <track
          kind="captions"
          src="data:text/vtt,WEBVTT"
          srcLang="en"
          label={stageText(props.locale, s190Locale.noAudio)}
          default
        />
      </video>
      <canvas ref={scanRef} width="160" height="90" hidden />
      {!observer && (
        <div className="stage-actions">
          <button
            type="button"
            className="stage-action"
            onClick={() => void start()}
          >
            {stageText(props.locale, s190Locale.captureScreen)}
          </button>
          <button
            type="button"
            className="stage-action"
            onClick={() => window.open(observerUrl, "_blank")}
          >
            {stageText(props.locale, s190Locale.openObserver)}
          </button>
          <button
            type="button"
            className="stage-action"
            onClick={() => window.open(mapUrl, "_blank")}
          >
            {stageText(props.locale, s190Locale.openMap)}
          </button>
        </div>
      )}
      <p className="interaction-status" role="status">
        {statusText(props.locale, status)} · {frames}
      </p>
    </div>
  );
}
