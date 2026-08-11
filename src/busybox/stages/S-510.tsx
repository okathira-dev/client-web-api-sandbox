import { useEffect, useMemo, useState } from "react";
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

/** S-510 — drag a generated PNG File from a dedicated source window into this receiver. H-004/H-013/H-014/H-023. */
export default function S510Stage(props: StageComponentProps) {
  const problem = props.problem("S-510-B01");
  const crossWindowProblem = props.problem("S-510-B02");
  const params = useMemo(() => new URL(location.href).searchParams, []);
  const round = useMemo(
    () => params.get("round") ?? crypto.randomUUID(),
    [params],
  );
  const source = params.get("drag-source") === "1";
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [layers, setLayers] = useState<Readonly<Record<string, string>>>({});
  useEffect(() => {
    if (!source) return;
    const canvas = document.createElement("canvas");
    canvas.width = 240;
    canvas.height = 120;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.fillStyle = "#171329";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#facc15";
    context.font = "24px sans-serif";
    context.fillText(".busybox", 55, 68);
    canvas.toBlob((blob) => {
      if (blob)
        setFile(
          new File(
            [blob, new TextEncoder().encode(`busybox-round:${round}`)],
            `busybox-${round}.png`,
            { type: "image/png" },
          ),
        );
    }, "image/png");
  }, [round, source]);
  useEffect(() => {
    if (Object.keys(layers).length >= 3)
      crossWindowProblem.solve(["iframe-drag:three-layers"]);
  }, [crossWindowProblem.solve, layers]);
  if (source)
    return (
      <div className="puzzle puzzle--centered">
        <button
          type="button"
          className="drag-token"
          draggable={Boolean(file)}
          onDragStart={(event) => {
            if (file) {
              event.dataTransfer.items.add(file);
              event.dataTransfer.effectAllowed = "copy";
            }
          }}
        >
          {props.locale === "ja"
            ? "この印を別の窓へドラッグ"
            : "Drag this mark to the other window"}
        </button>
      </div>
    );
  const sourceUrl = new URL(location.href);
  sourceUrl.searchParams.set("round", round);
  sourceUrl.searchParams.set("drag-source", "1");
  const helperUrl = new URL("./drag-helper.html", location.href);
  helperUrl.searchParams.set("round", round);
  return (
    <div className="puzzle puzzle--centered">
      <ProblemGiftBox problem={problem} locale={props.locale} />
      <button
        type="button"
        className="stage-action"
        onClick={() => window.open(sourceUrl, "_blank")}
      >
        {props.locale === "ja" ? "印の窓を開く" : "Open the mark window"}
      </button>
      <iframe
        title={
          props.locale === "ja" ? "窓越しの画像" : "Cross-window image source"
        }
        sandbox="allow-scripts"
        loading="lazy"
        src={helperUrl.href}
        style={{
          width: "100%",
          minHeight: 220,
          border: "1px solid currentColor",
        }}
      />
      <button
        type="button"
        className="drop-target"
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        }}
        onDrop={(event) => {
          event.preventDefault();
          if (!event.isTrusted) return;
          const dropped = event.dataTransfer.files[0];
          if (dropped) {
            if (dropped.type !== "image/png") return;
            void dropped.arrayBuffer().then((bytes) => {
              const text = new TextDecoder().decode(bytes);
              if (
                dropped.name === `busybox-${round}.png` &&
                text.includes(`busybox-round:${round}`)
              ) {
                problem.solve(["drag-drop:png-file"]);
                setStatus(dropped.name);
              }
            });
            return;
          }
          const uri = event.dataTransfer
            .getData("text/uri-list")
            .split("\n")[0]
            ?.trim();
          const label = event.dataTransfer.getData("text/plain");
          if (!uri || !label.startsWith(`busybox-round:${round}:`)) return;
          const layer = label.slice(`busybox-round:${round}:`.length);
          const asset = layerAssets[layer as keyof typeof layerAssets];
          if (!asset) return;
          const parsed = new URL(uri, location.href);
          const expectedPath = new URL(`./${asset.filename}`, location.href)
            .pathname;
          if (
            parsed.origin !== location.origin ||
            parsed.pathname !== expectedPath
          )
            return;
          void fetch(parsed.href)
            .then((response) => response.arrayBuffer())
            .then((bytes) => crypto.subtle.digest("SHA-256", bytes))
            .then((digest) => {
              if (toHex(digest) !== asset.sha256) return;
              setLayers((current) => {
                return { ...current, [layer]: parsed.href };
              });
              setStatus(`${layer} received`);
            })
            .catch(() => setStatus("image fetch failed"));
        }}
      >
        {props.locale === "ja"
          ? "ここへファイルを落とす"
          : "Drop the file here"}
      </button>
      <fieldset className="drag-composite">
        <legend>
          {props.locale === "ja" ? "受領レイヤー" : "Received layers"}
        </legend>
        {Object.entries(layers).map(([layer, url]) => (
          <img key={layer} src={url} alt={layer} width={240} height={120} />
        ))}
      </fieldset>
      <ProblemGiftBox problem={crossWindowProblem} locale={props.locale} />
      <p className="interaction-status" role="status">
        {status}
      </p>
    </div>
  );
}
