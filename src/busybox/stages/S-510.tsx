import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s510Locale } from "./S-510.locale";

const fixtures = {
  page: {
    filename: "drag-page.png",
    sha256: "7fba1a9dd15b39c8818515ee0690b1971d0bf6416b9a93ea52155b5af91d4a17",
  },
  file: {
    filename: "drag-file.png",
    sha256: "e0d1295c4edcd5445a01409a9f0f4d6a4e31c012a5abcf4bd732b3fc6584e2dd",
  },
  window: {
    filename: "drag-window.png",
    sha256: "c88fd86bbcae73533936ed34dc47db782f7daf880c6a17e44e72bd2d37654369",
  },
} as const;

function toHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

type DropState = "idle" | "allowed" | "rejected";

function DropZone({
  children,
  ariaLabel,
  hint,
  accepts,
  onDrop,
}: {
  children: ReactNode;
  ariaLabel: string;
  hint: string;
  accepts(event: React.DragEvent<HTMLElement>): boolean;
  onDrop(event: React.DragEvent<HTMLElement>): void;
}) {
  const [state, setState] = useState<DropState>("idle");
  const [dragging, setDragging] = useState(false);
  const dragDepth = useRef(0);
  const updateState = (event: React.DragEvent<HTMLElement>) => {
    setState(accepts(event) ? "allowed" : "rejected");
  };
  return (
    <section
      className="drop-target"
      aria-label={ariaLabel}
      data-drop-state={state}
      data-dragging={dragging ? "true" : undefined}
      onDragEnter={(event) => {
        dragDepth.current += 1;
        setDragging(true);
        updateState(event);
      }}
      onDragOver={(event) => {
        setDragging(true);
        updateState(event);
        if (!accepts(event)) {
          event.dataTransfer.dropEffect = "none";
          return;
        }
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={() => {
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (dragDepth.current === 0) {
          setDragging(false);
          setState("idle");
        }
      }}
      onDragEnd={() => {
        dragDepth.current = 0;
        setDragging(false);
        setState("idle");
      }}
      onDrop={(event) => {
        const accepted = accepts(event);
        event.preventDefault();
        dragDepth.current = 0;
        setDragging(false);
        setState("idle");
        if (event.isTrusted && accepted) onDrop(event);
        else if (!accepted) setState("rejected");
      }}
    >
      <span className="drop-target__content">
        <strong>{children}</strong>
        <small>{hint}</small>
      </span>
    </section>
  );
}

function uriFromTransfer(transfer: DataTransfer) {
  return transfer
    .getData("text/uri-list")
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);
}

/**
 * S-510 — 同じD&Dでも、ページ内画像・OSファイル・別window画像で境界が変わることを体験する。
 * 目的: HTML Drag and DropのDataTransferがdocument、OS、window境界でどう変わるかを、見た目とカーソルで推理できるようにする。
 * 最初の一手: B01のページ内画像をそのまま左のドロップ欄へドラッグし、受け付けるカーソルと欄の色を確認する。
 * 箱ごとの解法: B01は固定fixtureのページ内画像URLとSHA-256を実dropで一致させる。B02はdraggable=falseの画像を保存し、OSのファイル管理画面から`drag-file.png`を実Fileとしてdropする。B03はiframe画像が禁止カーソルになることを確認し、別windowを開いて`drag-window.png`をdropする。各箱は対応する実操作だけで開く。
 * 開かない操作: 同じページの画像をB02へ落とす、B01/B03へFileを落とす、iframeの画像をB03へ落とす、file inputで選ぶ、script生成DragEvent、DevToolsでDOMやDataTransferを改変する操作では開かない。
 * 使用API: HTML Drag and Drop、DataTransfer、File、`text/uri-list`、`window.open`、`postMessage`、SHA-256。画像は固定fixtureとしてGit管理し、外部へ送信しない。
 * 権限・privacy: OSファイルはdropされた一枚のPNGをメモリ上で照合するだけで、保存・upload・外部送信を行わない。別windowは同一originの固定helperを開く。
 * cleanup: stage離脱時にmessage listener、iframe、別window、5秒のarm timerを解除し、drop状態と一時的な照合状態を破棄する。
 * 対応環境: desktop browserの実native D&Dを対象とする。touch-only環境やiframeからのD&Dを受け付けないbrowserでは、欄を赤い禁止状態として表示し、操作を要求しない。
 * 人手確認: H-001/H-002/H-003/H-005/H-013/H-014/H-019/H-020/H-023/H-025で、3箱のカーソル、保存経路、別window経路、再入場とcleanupを確認する。
 */
export default function S510Stage(props: StageComponentProps) {
  const pageProblem = props.problem("S-510-B01");
  const fileProblem = props.problem("S-510-B02");
  const windowProblem = props.problem("S-510-B03");
  const params = useMemo(() => new URL(location.href).searchParams, []);
  const round = useMemo(
    () => params.get("round") ?? crypto.randomUUID(),
    [params],
  );
  const [status, setStatus] = useState("");
  const [armed, setArmed] = useState<"iframe" | "window">();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const popupRef = useRef<Window | null>(null);
  const armTimerRef = useRef<number | undefined>(undefined);

  const pageUrl = useMemo(
    () => new URL(`./${fixtures.page.filename}`, location.href).href,
    [],
  );
  const fileUrl = useMemo(
    () => new URL(`./${fixtures.file.filename}`, location.href).href,
    [],
  );
  const windowUrl = useMemo(
    () => new URL(`./${fixtures.window.filename}`, location.href).href,
    [],
  );
  const helperUrl = useMemo(() => {
    const url = new URL("./drag-helper.html", location.href);
    url.searchParams.set("round", round);
    url.searchParams.set("locale", props.locale);
    url.searchParams.set("mode", "iframe");
    return url.href;
  }, [props.locale, round]);

  useEffect(() => {
    const receiveArm = (event: MessageEvent<unknown>) => {
      const source =
        event.source === iframeRef.current?.contentWindow
          ? "iframe"
          : event.source === popupRef.current
            ? "window"
            : undefined;
      if (!source || !event.data || typeof event.data !== "object") return;
      const data = event.data as {
        channel?: unknown;
        round?: unknown;
        type?: unknown;
        asset?: unknown;
      };
      if (
        data.channel !== "busybox-s510-drag" ||
        data.type !== "start" ||
        data.round !== round ||
        data.asset !== "window"
      )
        return;
      setArmed(source);
      if (armTimerRef.current !== undefined)
        window.clearTimeout(armTimerRef.current);
      armTimerRef.current = window.setTimeout(() => {
        armTimerRef.current = undefined;
        setArmed(undefined);
      }, 5_000);
    };
    window.addEventListener("message", receiveArm);
    return () => {
      window.removeEventListener("message", receiveArm);
      if (armTimerRef.current !== undefined)
        window.clearTimeout(armTimerRef.current);
      popupRef.current?.close();
      popupRef.current = null;
    };
  }, [round]);

  const verifyBytes = async (bytes: ArrayBuffer, expected: string) =>
    toHex(await crypto.subtle.digest("SHA-256", bytes)) === expected;

  const handlePageDrop = (event: React.DragEvent<HTMLElement>) => {
    const uri = uriFromTransfer(event.dataTransfer);
    if (!uri) {
      setStatus(stageText(props.locale, s510Locale.pageNeedsImage));
      return;
    }
    const parsed = new URL(uri, location.href);
    const expected = new URL(pageUrl);
    if (
      parsed.origin !== expected.origin ||
      parsed.pathname !== expected.pathname
    ) {
      setStatus(stageText(props.locale, s510Locale.wrongImage));
      return;
    }
    void fetch(parsed.href)
      .then((response) => response.arrayBuffer())
      .then((bytes) => verifyBytes(bytes, fixtures.page.sha256))
      .then((valid) => {
        if (!valid) {
          setStatus(stageText(props.locale, s510Locale.digestFailed));
          return;
        }
        pageProblem.solve(["drag-drop:page-image"]);
        setStatus(stageText(props.locale, s510Locale.pageReceived));
      })
      .catch(() => setStatus(stageText(props.locale, s510Locale.fetchFailed)));
  };

  const handleFileDrop = (event: React.DragEvent<HTMLElement>) => {
    const dropped = event.dataTransfer.files[0];
    if (!dropped) {
      setStatus(stageText(props.locale, s510Locale.fileNeedsPng));
      return;
    }
    void dropped
      .arrayBuffer()
      .then((bytes) => verifyBytes(bytes, fixtures.file.sha256))
      .then((valid) => {
        if (!valid) {
          setStatus(stageText(props.locale, s510Locale.wrongImage));
          return;
        }
        fileProblem.solve(["drag-drop:os-file"]);
        setStatus(stageText(props.locale, s510Locale.fileReceived));
      })
      .catch(() => setStatus(stageText(props.locale, s510Locale.unreadable)));
  };

  const handleWindowDrop = (event: React.DragEvent<HTMLElement>) => {
    const uri = uriFromTransfer(event.dataTransfer);
    const marker = event.dataTransfer.getData("text/plain");
    const expectedMarker = `busybox-round:${round}:window`;
    if (armed !== "window" || marker !== expectedMarker || !uri) {
      setStatus(stageText(props.locale, s510Locale.needSeparateWindow));
      return;
    }
    const parsed = new URL(uri, location.href);
    const expected = new URL(windowUrl);
    if (
      parsed.origin !== expected.origin ||
      parsed.pathname !== expected.pathname
    ) {
      setStatus(stageText(props.locale, s510Locale.forbidden));
      return;
    }
    setArmed(undefined);
    void fetch(parsed.href)
      .then((response) => response.arrayBuffer())
      .then((bytes) => verifyBytes(bytes, fixtures.window.sha256))
      .then((valid) => {
        if (!valid) {
          setStatus(stageText(props.locale, s510Locale.digestFailed));
          return;
        }
        windowProblem.solve(["drag-drop:separate-window"]);
        setStatus(stageText(props.locale, s510Locale.windowReceived));
      })
      .catch(() => setStatus(stageText(props.locale, s510Locale.fetchFailed)));
  };

  const openSeparateWindow = () => {
    const url = new URL("./drag-helper.html", location.href);
    url.searchParams.set("round", round);
    url.searchParams.set("locale", props.locale);
    url.searchParams.set("mode", "window");
    popupRef.current = window.open(
      url.href,
      "busybox-s510-source",
      "popup,width=420,height=300",
    );
    if (popupRef.current) {
      popupRef.current.focus();
      setStatus(stageText(props.locale, s510Locale.windowOpened));
    } else setStatus(stageText(props.locale, s510Locale.popupBlocked));
  };

  const pageAccepts = (event: React.DragEvent<HTMLElement>) =>
    event.dataTransfer.types.includes("text/uri-list") &&
    !event.dataTransfer.types.includes("Files");
  const fileAccepts = (event: React.DragEvent<HTMLElement>) =>
    event.dataTransfer.types.includes("Files");
  const windowAccepts = (event: React.DragEvent<HTMLElement>) =>
    armed === "window" &&
    event.dataTransfer.types.includes("text/uri-list") &&
    !event.dataTransfer.types.includes("Files");

  return (
    <div className="puzzle puzzle--centered">
      <div className="drag-columns drag-columns--three">
        <section className="drag-card">
          <ProblemGiftBox problem={pageProblem} locale={props.locale} />
          <h2>{stageText(props.locale, s510Locale.pageImage)}</h2>
          <p>{stageText(props.locale, s510Locale.pageImageHelp)}</p>
          <img
            className="drag-fixture"
            src={pageUrl}
            alt={stageText(props.locale, s510Locale.pageImageAlt)}
            draggable="true"
            width={240}
            height={120}
          />
          <DropZone
            ariaLabel={stageText(props.locale, s510Locale.dropTarget)}
            hint={stageText(props.locale, s510Locale.dropHint)}
            accepts={pageAccepts}
            onDrop={handlePageDrop}
          >
            {stageText(props.locale, s510Locale.dropPage)}
          </DropZone>
        </section>
        <section className="drag-card">
          <ProblemGiftBox problem={fileProblem} locale={props.locale} />
          <h2>{stageText(props.locale, s510Locale.fileImage)}</h2>
          <p>{stageText(props.locale, s510Locale.fileImageHelp)}</p>
          <img
            className="drag-fixture drag-fixture--disabled"
            src={fileUrl}
            alt={stageText(props.locale, s510Locale.fileImageAlt)}
            draggable={false}
            width={240}
            height={120}
          />
          <a
            className="download"
            href={fileUrl}
            download="busybox-drag-file.png"
          >
            {stageText(props.locale, s510Locale.downloadPng)}
          </a>
          <DropZone
            ariaLabel={stageText(props.locale, s510Locale.dropTarget)}
            hint={stageText(props.locale, s510Locale.dropHint)}
            accepts={fileAccepts}
            onDrop={handleFileDrop}
          >
            {stageText(props.locale, s510Locale.dropFile)}
          </DropZone>
        </section>
        <section className="drag-card">
          <ProblemGiftBox problem={windowProblem} locale={props.locale} />
          <h2>{stageText(props.locale, s510Locale.windowImage)}</h2>
          <p>{stageText(props.locale, s510Locale.windowImageHelp)}</p>
          <iframe
            ref={iframeRef}
            title={stageText(props.locale, s510Locale.iframeTitle)}
            sandbox="allow-scripts"
            loading="lazy"
            src={helperUrl}
          />
          <button type="button" onClick={openSeparateWindow}>
            {stageText(props.locale, s510Locale.openWindow)}
          </button>
          <DropZone
            ariaLabel={stageText(props.locale, s510Locale.dropTarget)}
            hint={stageText(props.locale, s510Locale.dropHint)}
            accepts={windowAccepts}
            onDrop={handleWindowDrop}
          >
            {stageText(props.locale, s510Locale.dropWindow)}
          </DropZone>
        </section>
      </div>
      <p className="interaction-status" role="status">
        {status}
      </p>
    </div>
  );
}
