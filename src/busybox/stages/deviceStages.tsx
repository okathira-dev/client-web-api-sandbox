import { type ChangeEvent, useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

type InteractionState = "idle" | "active" | "denied" | "unavailable";

interface PermissionAwareOrientationEvent {
  requestPermission?: () => Promise<"granted" | "denied">;
}

export function OrientationStage(props: StageComponentProps) {
  const boxId = "S-100-B01";
  const [status, setStatus] = useState<InteractionState>("idle");
  const [tilt, setTilt] = useState({ beta: 0, gamma: 0 });
  const cleanupRef = useRef<() => void>(() => undefined);

  useEffect(() => () => cleanupRef.current(), []);

  const start = async () => {
    const orientation =
      DeviceOrientationEvent as unknown as PermissionAwareOrientationEvent;
    if (orientation.requestPermission) {
      const permission = await orientation.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }
    }

    let targetSince: number | null = null;
    const observe = (event: DeviceOrientationEvent) => {
      const beta = event.beta ?? 0;
      const gamma = event.gamma ?? 0;
      setTilt({ beta, gamma });
      const onTarget = Math.abs(beta - 45) <= 12 && Math.abs(gamma) <= 12;
      if (!onTarget) {
        targetSince = null;
      } else if (targetSince === null) {
        targetSince = performance.now();
      } else if (performance.now() - targetSince >= 1000) {
        props.solve(boxId, ["orientation:held"]);
      }
    };
    window.addEventListener("deviceorientation", observe);
    cleanupRef.current = () =>
      window.removeEventListener("deviceorientation", observe);
    props.signal.addEventListener("abort", cleanupRef.current, { once: true });
    setStatus("active");
  };

  return (
    <div className="puzzle puzzle--centered">
      <div
        className="tilt-clue"
        style={{ transform: `rotate(${tilt.gamma}deg)` }}
        aria-hidden="true"
      >
        ▰
      </div>
      <p className="measurement">
        β {Math.round(tilt.beta)}° · γ {Math.round(tilt.gamma)}°
      </p>
      <button
        type="button"
        className="stage-action"
        onClick={() => void start()}
      >
        {props.locale === "ja" ? "姿勢を感じる" : "Sense orientation"}
      </button>
      <p className="interaction-status" role="status">
        {status}
      </p>
      <ProblemGiftBox
        boxId={boxId}
        state={props.problemState(boxId)}
        locale={props.locale}
      />
    </div>
  );
}

export function CameraLightStage(props: StageComponentProps) {
  const boxId = "S-110-B01";
  const [status, setStatus] = useState<InteractionState>("idle");
  const [brightness, setBrightness] = useState(0);
  const cleanupRef = useRef<() => void>(() => undefined);

  useEffect(() => () => cleanupRef.current(), []);

  const start = async () => {
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
      await video.play();
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 24;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      let darkSeen = false;
      const timer = window.setInterval(() => {
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
        if (darkSeen && nextBrightness > 165)
          props.solve(boxId, ["camera:dark-light"]);
      }, 200);

      // The stream and derived pixels live only in this stage session. Cleanup is
      // explicit so camera indicators and hardware access end immediately on exit.
      cleanupRef.current = () => {
        window.clearInterval(timer);
        for (const track of stream.getTracks()) track.stop();
        video.srcObject = null;
      };
      props.signal.addEventListener("abort", cleanupRef.current, {
        once: true,
      });
      setStatus("active");
    } catch (error) {
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
        {props.locale === "ja" ? "光だけを見る" : "See only light"}
      </button>
      <p className="interaction-status" role="status">
        {status}
      </p>
      <ProblemGiftBox
        boxId={boxId}
        state={props.problemState(boxId)}
        locale={props.locale}
      />
    </div>
  );
}

export function SoundShapeStage(props: StageComponentProps) {
  const boxId = "S-120-B01";
  const [status, setStatus] = useState<InteractionState>("idle");
  const [level, setLevel] = useState(0);
  const cleanupRef = useRef<() => void>(() => undefined);

  useEffect(() => () => cleanupRef.current(), []);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      const context = new AudioContext();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const samples = new Uint8Array(analyser.fftSize);
      let phase = 0;
      let animationFrame = 0;
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
        else if (phase === 2 && rms < 0.06)
          props.solve(boxId, ["audio:quiet-loud-quiet"]);
        animationFrame = requestAnimationFrame(sample);
      };
      animationFrame = requestAnimationFrame(sample);

      // Only RMS leaves the analyser loop; no audio sample is persisted or sent.
      cleanupRef.current = () => {
        cancelAnimationFrame(animationFrame);
        source.disconnect();
        for (const track of stream.getTracks()) track.stop();
        void context.close();
      };
      props.signal.addEventListener("abort", cleanupRef.current, {
        once: true,
      });
      setStatus("active");
    } catch (error) {
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
        {props.locale === "ja" ? "音の形を見る" : "See the sound"}
      </button>
      <p className="interaction-status" role="status">
        {status}
      </p>
      <ProblemGiftBox
        boxId={boxId}
        state={props.problemState(boxId)}
        locale={props.locale}
      />
    </div>
  );
}

async function hashToken(token: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function isKeyFile(
  value: unknown,
): value is { format: "busybox-key-v1"; token: string } {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as { format?: unknown; token?: unknown };
  return (
    candidate.format === "busybox-key-v1" && typeof candidate.token === "string"
  );
}

export function FileKeyStage(props: StageComponentProps) {
  const [status, setStatus] = useState("");
  const [attemptKeyHash, setAttemptKeyHash] = useState<string | null>(null);

  const exportKey = async () => {
    const bytes = crypto.getRandomValues(new Uint8Array(18));
    const token = btoa(String.fromCharCode(...bytes));
    const hash = await hashToken(token);
    setAttemptKeyHash(hash);
    props.observe("S-130:key", [hash]);
    props.solve("S-130-B01", ["file:exported"]);
    const blob = new Blob(
      [JSON.stringify({ format: "busybox-key-v1", token })],
      {
        type: "application/json",
      },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "busybox-key.busykey";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importKey = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || file.size > 4096) {
      setStatus("invalid");
      return;
    }
    try {
      const value: unknown = JSON.parse(await file.text());
      if (!isKeyFile(value)) throw new Error("invalid key file");
      const hash = await hashToken(value.token);
      if (hash !== attemptKeyHash) throw new Error("different key");
      props.solve("S-130-B02", ["file:returned"]);
      setStatus("matched");
    } catch {
      setStatus("invalid");
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        <ProblemGiftBox
          boxId="S-130-B01"
          state={props.problemState("S-130-B01")}
          locale={props.locale}
        />
        <ProblemGiftBox
          boxId="S-130-B02"
          state={props.problemState("S-130-B02")}
          locale={props.locale}
        />
      </div>
      <button
        type="button"
        className="stage-action"
        onClick={() => void exportKey()}
      >
        {props.locale === "ja" ? "鍵を外へ" : "Send key outside"}
      </button>
      <label className="stage-action file-action">
        {props.locale === "ja" ? "鍵を戻す" : "Bring key back"}
        <input
          type="file"
          accept=".busykey,application/json"
          onChange={(event) => void importKey(event)}
        />
      </label>
      <p role="status">{status}</p>
    </div>
  );
}
