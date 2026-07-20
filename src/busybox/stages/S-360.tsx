import { useEffect, useMemo, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

type SignalMessage = {
  round: string;
  sender: string;
  ready?: boolean;
  description?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  close?: boolean;
};

/** S-360 — two tabs negotiate an origin-local WebRTC connection carrying generated audio, then explicitly close its data channel. H-013/H-019/H-023. */
export default function S360Stage(props: StageComponentProps) {
  const connectBox = props.problem("S-360-B01");
  const closeBox = props.problem("S-360-B02");
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
        connectBox.solve(["webrtc:generated-audio-connected"]);
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
        <ProblemGiftBox problem={connectBox} locale={props.locale} />
        <ProblemGiftBox problem={closeBox} locale={props.locale} />
      </div>
      {initiator && (
        <button
          type="button"
          className="stage-action"
          onClick={() => window.open(peerUrl, "_blank")}
        >
          {props.locale === "ja" ? "受信側を開く" : "Open receiver"}
        </button>
      )}
      <button
        type="button"
        className="stage-action"
        disabled={channelRef.current?.readyState !== "open"}
        onClick={() => {
          if (channelRef.current?.readyState === "open") {
            closeBox.solve(["webrtc:data-channel-player-closed"]);
            channelRef.current.close();
          }
        }}
      >
        {props.locale === "ja" ? "接続を閉じる" : "Close connection"}
      </button>
      <p className="interaction-status" role="status">
        {status}
      </p>
    </div>
  );
}
