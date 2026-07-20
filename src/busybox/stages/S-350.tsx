import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/** S-350 — native HTML video controls: seek, mute, and play then pause. H-001/H-020/H-023. */
export default function S350Stage(props: StageComponentProps) {
  const seek = props.problem("S-350-B01");
  const mute = props.problem("S-350-B02");
  const pause = props.problem("S-350-B03");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const played = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (
      !canvas ||
      !video ||
      !("captureStream" in canvas) ||
      !("MediaRecorder" in window)
    )
      return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let frame = 0;
    const draw = window.setInterval(() => {
      context.fillStyle = `hsl(${frame % 360} 75% 45%)`;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "white";
      context.font = "32px sans-serif";
      context.fillText(String(Math.floor(frame / 10)), 20, 55);
      frame += 1;
    }, 100);
    const stream = canvas.captureStream(10);
    const recorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    let url = "";
    let active = true;
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data);
    };
    recorder.onstop = () => {
      const createdUrl = URL.createObjectURL(
        new Blob(chunks, { type: recorder.mimeType }),
      );
      if (!active) {
        URL.revokeObjectURL(createdUrl);
        return;
      }
      url = createdUrl;
      video.src = url;
      setReady(true);
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    };
    recorder.start();
    const stop = window.setTimeout(() => recorder.stop(), 4200);
    return () => {
      active = false;
      window.clearInterval(draw);
      window.clearTimeout(stop);
      if (recorder.state !== "inactive") recorder.stop();
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      if (url) URL.revokeObjectURL(url);
    };
  }, []);

  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        <ProblemGiftBox problem={seek} locale={props.locale} />
        <ProblemGiftBox problem={mute} locale={props.locale} />
        <ProblemGiftBox problem={pause} locale={props.locale} />
      </div>
      <canvas ref={canvasRef} width="320" height="90" hidden />
      <video
        ref={videoRef}
        className="stage-video"
        controls
        aria-label={props.locale === "ja" ? "操作する映像" : "Video to operate"}
        onSeeking={() => seek.solve(["video:seeking"])}
        onVolumeChange={(event) => {
          if (event.currentTarget.muted) mute.solve(["video:muted"]);
        }}
        onPlay={() => {
          played.current = true;
        }}
        onPause={() => {
          if (played.current) pause.solve(["video:played-paused"]);
        }}
      >
        <track
          kind="captions"
          src="data:text/vtt,WEBVTT"
          srcLang="en"
          label="Silent generated clip"
          default
        />
      </video>
      <p className="interaction-status" role="status">
        {ready
          ? props.locale === "ja"
            ? "プレーヤーを操作する"
            : "Use the player controls"
          : props.locale === "ja"
            ? "短い映像を作成中…"
            : "Preparing a short clip…"}
      </p>
    </div>
  );
}
