import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Conversion,
  Input,
  Output,
  WebMOutputFormat,
} from "mediabunny";
import { StrictMode, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { decodeQrCanvas } from "../../media/qrDecoder";
import { type S710LayoutMessage, s710Flags } from "../../stages/s710Protocol";
import { drawQrIntoQuad } from "../../stages/s710Qr";
import { toolCopy } from "./locale";
import "./styles.css";

class DecodeFailure extends Error {}

function drawMessage(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  message: string,
) {
  context.fillStyle = "#000";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#fff";
  context.textAlign = "center";
  context.textBaseline = "middle";
  const maxWidth = width * 0.94;
  const maxHeight = height * 0.7;
  const baseSize = 100;
  context.font = `bold ${baseSize}px sans-serif`;
  const measuredWidth = context.measureText(message).width;
  const fontSize = Math.max(
    16,
    Math.floor(
      baseSize *
        Math.min(maxWidth / Math.max(1, measuredWidth), maxHeight / baseSize),
    ),
  );
  context.font = `bold ${fontSize}px sans-serif`;
  context.fillText(message, width / 2, height / 2);
}

function isDarkFrame(image: ImageData) {
  for (let index = 0; index < image.data.length; index += 4)
    if (
      (image.data[index] ?? 255) > 0x10 ||
      (image.data[index + 1] ?? 255) > 0x10 ||
      (image.data[index + 2] ?? 255) > 0x10
    )
      return false;
  return true;
}

function revoke(url: string | undefined) {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
}

function Tool() {
  const locale =
    new URL(location.href).searchParams.get("locale") === "ja" ? "ja" : "en";
  const copy = toolCopy(locale);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = copy.documentTitle;
  }, [copy.documentTitle, locale]);
  const [source, setSource] = useState<File>();
  const [outputUrl, setOutputUrl] = useState<string>();
  const [outputSize, setOutputSize] = useState<number>();
  const [status, setStatus] = useState(copy.initial);
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState<number>();
  const [recordingStream, setRecordingStream] = useState<MediaStream>();
  const recordingVideoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | undefined>(undefined);
  const recordingTimerRef = useRef<number | undefined>(undefined);
  const recordingIntervalRef = useRef<number | undefined>(undefined);
  const session = useMemo(
    () => new URL(location.href).searchParams.get("session") ?? "",
    [],
  );
  const brokenOutput = new URL(
    "../../fixtures/s710/assets/decode-failure-output.webm",
    import.meta.url,
  ).href;
  const sourceUrl = useMemo(
    () => (source ? URL.createObjectURL(source) : undefined),
    [source],
  );

  useEffect(() => {
    let frame: number | undefined;
    const publishHeight = () => {
      frame = undefined;
      const message: S710LayoutMessage = {
        channel: "busybox-s710-tool",
        height: Math.ceil(
          Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
          ),
        ),
        session,
        type: "layout",
      };
      parent.postMessage(message, location.origin);
    };
    const schedule = () => {
      if (frame !== undefined) return;
      frame = requestAnimationFrame(publishHeight);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, [session]);

  useEffect(() => () => revoke(sourceUrl), [sourceUrl]);
  useEffect(() => () => revoke(outputUrl), [outputUrl]);
  useEffect(() => {
    const video = recordingVideoRef.current;
    if (!video) return;
    video.srcObject = recordingStream ?? null;
    if (recordingStream) void video.play().catch(() => undefined);
    return () => {
      if (video.srcObject === recordingStream) video.srcObject = null;
    };
  }, [recordingStream]);
  useEffect(
    () => () => {
      if (recordingTimerRef.current)
        window.clearTimeout(recordingTimerRef.current);
      if (recordingIntervalRef.current)
        window.clearInterval(recordingIntervalRef.current);
    },
    [],
  );

  const stopRecording = () => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  };

  const record = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 360 },
          frameRate: { ideal: 15 },
        },
        audio: false,
      });
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
        setSource(
          new File(chunks, "camera.webm", {
            type: recorder.mimeType || "video/webm",
          }),
        );
        setRecordingStream(undefined);
        setRecording(false);
        setCountdown(undefined);
        if (recordingIntervalRef.current)
          window.clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = undefined;
        recordingTimerRef.current = undefined;
        recorderRef.current = undefined;
        setBusy(false);
        setStatus(copy.cameraReady);
      };
      setRecordingStream(stream);
      setBusy(true);
      setRecording(true);
      setCountdown(10);
      recorder.start();
      const startedAt = performance.now();
      recordingIntervalRef.current = window.setInterval(() => {
        setCountdown(
          Math.max(0, 10 - Math.ceil((performance.now() - startedAt) / 1000)),
        );
      }, 200);
      recordingTimerRef.current = window.setTimeout(
        () => stopRecording(),
        10_000,
      );
    } catch {
      setBusy(false);
      setRecording(false);
      setCountdown(undefined);
      setStatus(copy.cameraUnavailable);
    }
  };

  const transform = async () => {
    if (!source) return;
    setBusy(true);
    setStatus(copy.compressing);
    let conversion: Conversion | undefined;
    try {
      const input = new Input({
        source: new BlobSource(source),
        formats: ALL_FORMATS,
      });
      if (!(await input.canRead()) || !(await input.getPrimaryVideoTrack()))
        throw new DecodeFailure("input cannot be decoded");
      const tags = await input.getMetadataTags().catch(() => undefined);
      const secondPass = tags?.raw?.BUSYBOX_TRANSFORMER === "S710_V1";
      const target = new BufferTarget();
      const output = new Output({ format: new WebMOutputFormat(), target });
      const frameCanvas = document.createElement("canvas");
      const scanCanvas = document.createElement("canvas");
      conversion = await Conversion.init({
        input,
        output,
        trim: { start: 0, end: 10 },
        video: {
          frameRate: 15,
          width: 640,
          height: 360,
          fit: "contain",
          codec: "vp8",
          bitrate: 160_000,
          process: async (sample) => {
            frameCanvas.width = sample.displayWidth;
            frameCanvas.height = sample.displayHeight;
            const context = frameCanvas.getContext("2d", {
              willReadFrequently: true,
            });
            if (!context) return sample;
            sample.draw(context, 0, 0, frameCanvas.width, frameCanvas.height);
            const image = context.getImageData(
              0,
              0,
              frameCanvas.width,
              frameCanvas.height,
            );
            if (isDarkFrame(image)) {
              drawMessage(
                context,
                frameCanvas.width,
                frameCanvas.height,
                s710Flags.dark,
              );
            }
            scanCanvas.width = Math.max(1, Math.floor(frameCanvas.width / 2));
            scanCanvas.height = Math.max(1, Math.floor(frameCanvas.height / 2));
            scanCanvas
              .getContext("2d")
              ?.drawImage(
                frameCanvas,
                0,
                0,
                scanCanvas.width,
                scanCanvas.height,
              );
            const decoded = decodeQrCanvas(scanCanvas);
            if (decoded) {
              const scaleX = frameCanvas.width / scanCanvas.width;
              const scaleY = frameCanvas.height / scanCanvas.height;
              const scalePoint = (point: { x: number; y: number }) => ({
                x: point.x * scaleX,
                y: point.y * scaleY,
              });
              const qrQuad: Parameters<typeof drawQrIntoQuad>[1] = [
                scalePoint(decoded.location.topLeftCorner),
                scalePoint(decoded.location.topRightCorner),
                scalePoint(decoded.location.bottomRightCorner),
                scalePoint(decoded.location.bottomLeftCorner),
              ];
              drawQrIntoQuad(context, qrQuad, s710Flags.qr);
            }
            if (secondPass)
              drawMessage(
                context,
                frameCanvas.width,
                frameCanvas.height,
                s710Flags.second,
              );
            return frameCanvas;
          },
        },
        audio: { discard: true },
        tags: { raw: { BUSYBOX_TRANSFORMER: "S710_V1" } },
      });
      const decodeDiscarded = conversion.discardedTracks.some(
        ({ reason }) =>
          reason === "unknown_source_codec" ||
          reason === "undecodable_source_codec",
      );
      if (!conversion.isValid && decodeDiscarded)
        throw new DecodeFailure("input codec cannot be decoded");
      if (!conversion.isValid)
        throw new Error("compatible encoder unavailable");
      await conversion.execute();
      if (!target.buffer) throw new Error("output buffer unavailable");
      const blob = new Blob([target.buffer], { type: "video/webm" });
      const nextUrl = URL.createObjectURL(blob);
      setOutputUrl((previous) => {
        revoke(previous);
        return nextUrl;
      });
      setOutputSize(blob.size);
      setStatus(
        `${copy.done}: ${(blob.size / Math.max(1, source.size)).toFixed(2)}×.`,
      );
    } catch (error) {
      if (error instanceof DecodeFailure) {
        const size = await fetch(brokenOutput)
          .then((response) => response.blob())
          .then((blob) => blob.size);
        setOutputUrl(brokenOutput);
        setOutputSize(size);
        setStatus(copy.inputDecodeFailed);
      } else {
        setStatus(
          `${copy.conversionFailed}: ${error instanceof Error ? error.message : copy.unknownError}`,
        );
      }
    } finally {
      await conversion?.cancel().catch(() => undefined);
      setBusy(false);
    }
  };

  return (
    <main>
      <header>
        <div>
          <strong>{copy.clipPress}</strong>
          <span>{copy.localCompressor}</span>
        </div>
        <span className="privacy">{copy.runsInBrowser}</span>
      </header>
      <div className="workspace">
        <section className="pane">
          <h1>{copy.input}</h1>
          <label className="dropzone">
            <span>{copy.chooseVideo}</span>
            <input
              type="file"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                if (!file) return;
                setSource(file);
                setStatus(
                  file.type.startsWith("video/")
                    ? copy.inputReady
                    : copy.unknownFile,
                );
              }}
            />
          </label>
          <div className="buttons">
            <button type="button" onClick={() => void record()} disabled={busy}>
              {copy.record10s}
            </button>
            {recording ? (
              <button type="button" onClick={stopRecording}>
                {copy.stop}
              </button>
            ) : null}
            {recording ? (
              <output className="recording-indicator">
                ● REC {countdown ?? 0}s
              </output>
            ) : null}
          </div>
          {recordingStream || sourceUrl ? (
            <video ref={recordingVideoRef} controls muted src={sourceUrl}>
              <track
                kind="captions"
                src="data:text/vtt,WEBVTT"
                srcLang="en"
                label={copy.inputTrack}
              />
            </video>
          ) : (
            <div className="empty">{copy.noInput}</div>
          )}
        </section>
        <button
          className="compress"
          type="button"
          onClick={() => void transform()}
          disabled={!source || busy}
        >
          {copy.compress}
        </button>
        <section className="pane">
          <h1>{copy.output}</h1>
          {outputUrl ? (
            <video controls src={outputUrl}>
              <track
                kind="captions"
                src="data:text/vtt,WEBVTT"
                srcLang="en"
                label={copy.outputTrack}
              />
            </video>
          ) : (
            <div className="empty">{copy.outputPreview}</div>
          )}
          <p>
            {source?.size.toLocaleString() ?? "—"} B →{" "}
            {outputSize?.toLocaleString() ?? "—"} B
          </p>
          {outputUrl ? (
            <a
              className="download"
              href={outputUrl}
              download="clippress-compressed.webm"
            >
              {copy.download}
            </a>
          ) : null}
        </section>
      </div>
      <footer>
        <span role="status">{status}</span>
      </footer>
    </main>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("tool root unavailable");
createRoot(root).render(
  <StrictMode>
    <Tool />
  </StrictMode>,
);
