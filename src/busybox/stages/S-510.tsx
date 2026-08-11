import { useEffect, useMemo, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

const layerAssets = {
  A: {
    filename: "drag-layer-a.png",
    sha256: "236acfa026ed37a7989897e1568b77d123d6d2c6d1f48daf7544f7e644230613",
  },
  B: {
    filename: "drag-layer-b.png",
    sha256: "4376e5de7e60526bc8e23a09513b51411d995387fa49fd7f07ec1a8285fb7000",
  },
  C: {
    filename: "drag-layer-c.png",
    sha256: "e4401cb69c104d8dccd8930e41e2efe1e2f22ee704c23bcfa05add11818c14a7",
  },
} as const;

function toHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function DropZone({
  children,
  onDrop,
}: {
  children: React.ReactNode;
  onDrop(event: React.DragEvent<HTMLElement>): void;
}) {
  return (
    <section
      className="drop-target"
      aria-label="Drop target"
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDrop={(event) => {
        event.preventDefault();
        if (event.isTrusted) onDrop(event);
      }}
    >
      {children}
    </section>
  );
}

/**
 * S-510 — drag data across browser boundaries.
 *
 * B01 uses a real downloaded PNG. The player downloads the fixed fixture and
 * drags it from the browser download shelf or the OS file manager into the
 * first drop zone. The drop must be trusted, contain a PNG-like File, and
 * match the Git-managed fixture digest.
 *
 * B02 uses an opaque-origin sandbox iframe. Dragging one of its images arms a
 * short-lived layer marker in the parent. The second drop zone accepts only
 * the iframe's text/uri-list plus matching marker, then fetches and verifies
 * that layer before composing all three images. The two zones are separate so
 * a browser-exposed File item cannot swallow the URI path.
 *
 * No file is uploaded or sent to a server. Human verification:
 * H-001, H-002, H-003, H-005, H-013, H-014, H-019, H-020, H-023, H-025.
 */
export default function S510Stage(props: StageComponentProps) {
  const problem = props.problem("S-510-B01");
  const crossWindowProblem = props.problem("S-510-B02");
  const params = useMemo(() => new URL(location.href).searchParams, []);
  const round = useMemo(
    () => params.get("round") ?? crypto.randomUUID(),
    [params],
  );
  const [status, setStatus] = useState("");
  const [layers, setLayers] = useState<Readonly<Record<string, string>>>({});
  const [armedLayer, setArmedLayer] = useState<{
    layer: string;
    expires: number;
  }>();
  const helperRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const receiveArm = (event: MessageEvent<unknown>) => {
      if (event.source !== helperRef.current?.contentWindow) return;
      if (!event.data || typeof event.data !== "object") return;
      const data = event.data as {
        channel?: unknown;
        round?: unknown;
        layer?: unknown;
        type?: unknown;
      };
      if (
        data.channel !== "busybox-s510-drag" ||
        data.type !== "start" ||
        data.round !== round ||
        typeof data.layer !== "string" ||
        !(data.layer in layerAssets)
      )
        return;
      setArmedLayer({ layer: data.layer, expires: Date.now() + 5_000 });
    };
    window.addEventListener("message", receiveArm);
    return () => window.removeEventListener("message", receiveArm);
  }, [round]);

  useEffect(() => {
    if (!armedLayer) return;
    const remaining = Math.max(0, armedLayer.expires - Date.now());
    const timer = window.setTimeout(() => setArmedLayer(undefined), remaining);
    return () => window.clearTimeout(timer);
  }, [armedLayer]);

  const sourceUrl = new URL("./drag-layer-a.png", location.href).href;
  const helperUrl = new URL("./drag-helper.html", location.href);
  helperUrl.searchParams.set("round", round);

  const handleFileDrop = (event: React.DragEvent<HTMLElement>) => {
    const dropped = event.dataTransfer.files[0];
    if (!dropped) {
      setStatus("PNGファイルをここへドロップしてください");
      return;
    }
    void dropped
      .arrayBuffer()
      .then((bytes) => crypto.subtle.digest("SHA-256", bytes))
      .then((digest) => {
        if (toHex(digest) !== layerAssets.A.sha256) {
          setStatus("別の画像です");
          return;
        }
        problem.solve(["drag-drop:png-file"]);
        setStatus(`${dropped.name} received`);
      })
      .catch(() => setStatus("画像を読み取れません"));
  };

  const handleLayerDrop = (event: React.DragEvent<HTMLElement>) => {
    const uri = event.dataTransfer
      .getData("text/uri-list")
      .split("\n")[0]
      ?.trim();
    const label = event.dataTransfer.getData("text/plain");
    if (!uri || !armedLayer || armedLayer.expires < Date.now()) {
      setStatus("iframeの画像をドラッグしてからドロップしてください");
      return;
    }
    if (label !== `busybox-round:${round}:${armedLayer.layer}`) return;
    const layer = armedLayer.layer;
    const asset = layerAssets[layer as keyof typeof layerAssets];
    if (!asset) return;
    const parsed = new URL(uri, location.href);
    const expectedPath = new URL(`./${asset.filename}`, location.href).pathname;
    if (parsed.origin !== location.origin || parsed.pathname !== expectedPath) {
      setStatus("許可されていない画像です");
      return;
    }
    setArmedLayer(undefined);
    void fetch(parsed.href)
      .then((response) => response.arrayBuffer())
      .then((bytes) => crypto.subtle.digest("SHA-256", bytes))
      .then((digest) => {
        if (toHex(digest) !== asset.sha256) {
          setStatus("画像の照合に失敗しました");
          return;
        }
        setLayers((current) => ({ ...current, [layer]: parsed.href }));
        setStatus(`${layer} received`);
      })
      .catch(() => setStatus("画像の取得に失敗しました"));
  };

  useEffect(() => {
    if (Object.keys(layers).length >= 3)
      crossWindowProblem.solve(["iframe-drag:three-layers"]);
  }, [crossWindowProblem.solve, layers]);

  return (
    <div className="puzzle puzzle--centered">
      <div className="drag-columns">
        <section className="drag-card">
          <ProblemGiftBox problem={problem} locale={props.locale} />
          <h2>{props.locale === "ja" ? "実ファイル" : "Real file"}</h2>
          <p>
            {props.locale === "ja"
              ? "画像を保存し、OSのファイルからここへドラッグする。"
              : "Save the image, then drag it here from the OS file manager."}
          </p>
          <a
            className="download"
            href={sourceUrl}
            download="busybox-sticker.png"
          >
            {props.locale === "ja" ? "PNGを保存" : "Download PNG"}
          </a>
          <DropZone onDrop={handleFileDrop}>
            {props.locale === "ja"
              ? "PNGファイルをここへ"
              : "Drop the PNG here"}
          </DropZone>
        </section>
        <section className="drag-card">
          <ProblemGiftBox problem={crossWindowProblem} locale={props.locale} />
          <h2>{props.locale === "ja" ? "iframeの画像" : "Iframe image"}</h2>
          <iframe
            ref={helperRef}
            title={
              props.locale === "ja"
                ? "窓越しの画像"
                : "Cross-origin image source"
            }
            sandbox="allow-scripts"
            loading="lazy"
            src={helperUrl.href}
          />
          <DropZone onDrop={handleLayerDrop}>
            {props.locale === "ja"
              ? "iframeの画像をここへ"
              : "Drop the iframe image here"}
          </DropZone>
          <fieldset className="drag-composite">
            <legend>
              {props.locale === "ja" ? "受領レイヤー" : "Received layers"}
            </legend>
            {Object.entries(layers).map(([layer, url]) => (
              <img key={layer} src={url} alt={layer} width={240} height={120} />
            ))}
          </fieldset>
        </section>
      </div>
      <p className="interaction-status" role="status">
        {status}
      </p>
    </div>
  );
}
