import { useEffect, useMemo, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/** S-510 — drag a generated PNG File from a dedicated source window into this receiver. H-004/H-013/H-014/H-023. */
export default function S510Stage(props: StageComponentProps) {
  const problem = props.problem("S-510-B01");
  const params = useMemo(() => new URL(location.href).searchParams, []);
  const round = useMemo(
    () => params.get("round") ?? crypto.randomUUID(),
    [params],
  );
  const source = params.get("drag-source") === "1";
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
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
      <button
        type="button"
        className="drop-target"
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        }}
        onDrop={(event) => {
          event.preventDefault();
          const dropped = event.dataTransfer.files[0];
          if (!dropped || dropped.type !== "image/png") return;
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
        }}
      >
        {props.locale === "ja"
          ? "ここへファイルを落とす"
          : "Drop the file here"}
      </button>
      <p className="interaction-status" role="status">
        {status}
      </p>
    </div>
  );
}
