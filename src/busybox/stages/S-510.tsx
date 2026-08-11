import { useEffect, useMemo, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s510Locale } from "./S-510.locale";

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
 * S-510 — browser境界をまたぐ実ファイルとsandbox iframeのdrag-and-drop。
 * 目的: 同じD&Dでも、downloadされたFileとopaque-originのURI payloadが異なることを見せる。
 * 最初の一手: B01は固定PNGをdownloadしてOS／download shelfから最初のdrop zoneへ、B02はiframeの透明レイヤー3枚を現像台へ順にdropする。
 * 箱ごとの成功条件: B01はtrusted Fileとfixture SHA-256一致、B02はtext/uri-list・短命marker・asset SHA一致後の3枚合成で開く。
 * 開かない操作: script生成DragEvent、同一pageの画像、FileとURIの取り違え、marker期限切れでは開かない。
 * API/権限: HTML Drag and Drop、DataTransfer File、text/uri-list、sandbox iframe、SHA-256。ファイルはupload・外部送信しない。
 * cleanup/環境: message markerを5秒で失効し、listener、iframe、object URLを離脱時に破棄する。H-001/H-002/H-003/H-005/H-013/H-014/H-019/H-020/H-023/H-025を確認する。
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
      setStatus(stageText(props.locale, s510Locale.noPng));
      return;
    }
    void dropped
      .arrayBuffer()
      .then((bytes) => crypto.subtle.digest("SHA-256", bytes))
      .then((digest) => {
        if (toHex(digest) !== layerAssets.A.sha256) {
          setStatus(stageText(props.locale, s510Locale.wrongImage));
          return;
        }
        problem.solve(["drag-drop:png-file"]);
        setStatus(
          `${dropped.name} ${stageText(props.locale, s510Locale.received)}`,
        );
      })
      .catch(() => setStatus(stageText(props.locale, s510Locale.unreadable)));
  };

  const handleLayerDrop = (event: React.DragEvent<HTMLElement>) => {
    const uri = event.dataTransfer
      .getData("text/uri-list")
      .split("\n")[0]
      ?.trim();
    const label = event.dataTransfer.getData("text/plain");
    if (!uri || !armedLayer || armedLayer.expires < Date.now()) {
      setStatus(stageText(props.locale, s510Locale.needIframeDrag));
      return;
    }
    if (label !== `busybox-round:${round}:${armedLayer.layer}`) return;
    const layer = armedLayer.layer;
    const asset = layerAssets[layer as keyof typeof layerAssets];
    if (!asset) return;
    const parsed = new URL(uri, location.href);
    const expectedPath = new URL(`./${asset.filename}`, location.href).pathname;
    if (parsed.origin !== location.origin || parsed.pathname !== expectedPath) {
      setStatus(stageText(props.locale, s510Locale.forbidden));
      return;
    }
    setArmedLayer(undefined);
    void fetch(parsed.href)
      .then((response) => response.arrayBuffer())
      .then((bytes) => crypto.subtle.digest("SHA-256", bytes))
      .then((digest) => {
        if (toHex(digest) !== asset.sha256) {
          setStatus(stageText(props.locale, s510Locale.digestFailed));
          return;
        }
        setLayers((current) => ({ ...current, [layer]: parsed.href }));
        setStatus(`${layer} ${stageText(props.locale, s510Locale.received)}`);
      })
      .catch(() => setStatus(stageText(props.locale, s510Locale.fetchFailed)));
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
          <h2>{stageText(props.locale, s510Locale.realFile)}</h2>
          <p>{stageText(props.locale, s510Locale.realFileHelp)}</p>
          <a
            className="download"
            href={sourceUrl}
            download="busybox-sticker.png"
          >
            {stageText(props.locale, s510Locale.downloadPng)}
          </a>
          <DropZone onDrop={handleFileDrop}>
            {stageText(props.locale, s510Locale.dropPng)}
          </DropZone>
        </section>
        <section className="drag-card">
          <ProblemGiftBox problem={crossWindowProblem} locale={props.locale} />
          <h2>{stageText(props.locale, s510Locale.iframeImage)}</h2>
          <iframe
            ref={helperRef}
            title={stageText(props.locale, s510Locale.iframeTitle)}
            sandbox="allow-scripts"
            loading="lazy"
            src={helperUrl.href}
          />
          <DropZone onDrop={handleLayerDrop}>
            {stageText(props.locale, s510Locale.dropIframe)}
          </DropZone>
          <fieldset className="drag-composite">
            <legend>
              {stageText(props.locale, s510Locale.receivedLayers)}
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
