import VolumeUpOutlined from "@mui/icons-material/VolumeUpOutlined";
import WindowOutlined from "@mui/icons-material/WindowOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useEffect, useMemo, useRef, useState } from "react";
import { statusText } from "../../ui/statusLocale";
import { stageText } from "../locale";
import { locale } from "./locale";

type SignalMessage = {
  round: string;
  sender: string;
  ready?: boolean;
  description?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  close?: boolean;
};

/**
 * S-360
 *
 * 目的: 「窓を渡る音」で、B01「接続の箱」、B02「切断の箱」に対応する実際のブラウザ状態・標準UI・端末入力を観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: S-360の判定に必要な実装内のWeb API。共通runtimeは進捗表示だけを担う。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
function S360Stage(props: Props) {
  const connectBox = props.boxes[manifest.box.B01];
  const closeBox = props.boxes[manifest.box.B02];
  const params = useMemo(() => new URL(location.href).searchParams, []);
  const round = useMemo(
    () => params.get("round") ?? crypto.randomUUID(),
    [params],
  );
  const initiator = params.get("peer") !== "answer";
  const sender = useMemo(() => crypto.randomUUID(), []);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RTCDataChannel | null>(null);
  const [status, setStatus] = useState("waiting");

  useEffect(() => {
    const signaling = new BroadcastChannel(`busybox:S-360:${round}`);
    const peer = new RTCPeerConnection({ iceServers: [] });
    peerRef.current = peer;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const destination = context.createMediaStreamDestination();
    gain.gain.value = 0.04;
    oscillator.connect(gain).connect(destination);
    oscillator.start();
    for (const track of destination.stream.getTracks())
      peer.addTrack(track, destination.stream);
    const attach = (channel: RTCDataChannel) => {
      channelRef.current = channel;
      channel.onopen = () => {
        setStatus("connected");
        connectBox.solve();
      };
      channel.onclose = () => {
        setStatus("closed");
      };
    };
    if (initiator) attach(peer.createDataChannel("busybox"));
    else peer.ondatachannel = (event) => attach(event.channel);
    peer.onicecandidate = (event) => {
      if (event.candidate)
        signaling.postMessage({
          round,
          sender,
          candidate: event.candidate.toJSON(),
        } satisfies SignalMessage);
    };
    const makeOffer = async () => {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      signaling.postMessage({
        round,
        sender,
        description: offer,
      } satisfies SignalMessage);
    };
    const receive = async (event: MessageEvent<SignalMessage>) => {
      const message = event.data;
      if (message.round !== round || message.sender === sender) return;
      try {
        if (message.ready && initiator && peer.signalingState === "stable")
          await makeOffer();
        if (message.description) {
          await peer.setRemoteDescription(message.description);
          if (message.description.type === "offer") {
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            signaling.postMessage({
              round,
              sender,
              description: answer,
            } satisfies SignalMessage);
          }
        }
        if (message.candidate) await peer.addIceCandidate(message.candidate);
      } catch {
        setStatus("error");
      }
    };
    signaling.addEventListener("message", receive);
    if (!initiator)
      signaling.postMessage({
        round,
        sender,
        ready: true,
      } satisfies SignalMessage);
    const cleanup = () => {
      channelRef.current?.close();
      peer.close();
      signaling.close();
      oscillator.stop();
      void context.close();
    };
    props.signal.addEventListener("abort", cleanup, { once: true });
    return () => {
      props.signal.removeEventListener("abort", cleanup);
      cleanup();
    };
  }, [connectBox.solve, initiator, props.signal, round, sender]);

  const peerUrl = new URL(location.href);
  peerUrl.searchParams.set("round", round);
  peerUrl.searchParams.set("peer", "answer");
  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        <StageProblemGiftBox box={connectBox} locale={props.locale} />
        <StageProblemGiftBox box={closeBox} locale={props.locale} />
      </div>
      {initiator && (
        <button
          type="button"
          className="stage-action"
          onClick={() => window.open(peerUrl, "_blank")}
        >
          {stageText(props.locale, locale.openReceiver)}
        </button>
      )}
      <button
        type="button"
        className="stage-action"
        disabled={channelRef.current?.readyState !== "open"}
        onClick={() => {
          if (channelRef.current?.readyState === "open") {
            closeBox.solve();
            channelRef.current.close();
          }
        }}
      >
        {stageText(props.locale, locale.closeConnection)}
      </button>
      <p className="interaction-status" role="status">
        {statusText(props.locale, status)}
      </p>
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
    [manifest.box.B02]: {
      icon: WindowOutlined,
      color: "#fb7185",
      label: locale.B02,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      "RTCPeerConnection" in window && "BroadcastChannel" in window
        ? "available"
        : "unsupported",
    ),
  Component: S360Stage,
});
