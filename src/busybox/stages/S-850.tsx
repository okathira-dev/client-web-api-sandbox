import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s850Locale } from "./S-850.locale";

function copyDocumentStyles(target: Document) {
  for (const style of document.head.querySelectorAll(
    "link[rel='stylesheet'], style",
  )) {
    target.head.append(style.cloneNode(true));
  }
}

/**
 * S-850 — Document Picture-in-Pictureのdocumentへ実ProblemGiftBoxをReact portalで移動する。
 * 目的: video PiPや通常popupではなく、別documentを持つbrowser所有の浮かぶwindowへUIが移る感覚を体験する。
 * 最初の一手: 「浮かぶ画面を開く」を押し、main pageの台座から消えた箱を新しい常時手前windowで探す。
 * 箱ごとの解法: B01は`documentPictureInPicture.requestWindow()`の返したdocumentにportalした実ProblemGiftBoxへのtrusted clickで開く。clickのownerDocumentとviewがPiP側であることを確認する。
 * 開かない操作: main pageの台座、通常`window.open`、iframe、video PiP、script click、別documentの模倣箱では開かない。
 * 使用API: Document Picture-in-Picture、React `createPortal`、`pagehide`。必要なstylesheetだけをPiP documentへcloneする。
 * 権限・privacy: popup情報、camera、画面共有、保存、送信を使わない。browserが開いたPiP windowだけを保持する。
 * cleanup: PiPのpagehide、stage abort、再試行でportal stateとlistenerを解除し、保持しているPiP windowをcloseする。
 * 対応環境: Document Picture-in-Pictureを提供するdesktop Chromium系browser。通常PiPへのfallbackは作らない。
 * 人手確認: H-059で実PiP、close / reopen、通常popup等の負例、style、keyboard click、離脱cleanupを確認する。
 */
export default function S850Stage(props: StageComponentProps) {
  const problem = props.problem("S-850-B01");
  const windowRef = useRef<Window | null>(null);
  const [pipDocument, setPipDocument] = useState<Document>();
  const [status, setStatus] = useState("");

  useEffect(() => {
    const close = () => {
      windowRef.current?.close();
      windowRef.current = null;
      setPipDocument(undefined);
    };
    props.signal.addEventListener("abort", close, { once: true });
    return () => {
      props.signal.removeEventListener("abort", close);
      close();
    };
  }, [props.signal]);

  const open = async () => {
    const api = window.documentPictureInPicture;
    if (!api) return;
    windowRef.current?.close();
    try {
      const pipWindow = await api.requestWindow({ width: 360, height: 320 });
      windowRef.current = pipWindow;
      pipWindow.document.title = stageText(
        props.locale,
        s850Locale.floatingTitle,
      );
      copyDocumentStyles(pipWindow.document);
      const close = () => {
        if (windowRef.current === pipWindow) {
          windowRef.current = null;
          setPipDocument(undefined);
        }
      };
      pipWindow.addEventListener("pagehide", close, { once: true });
      setPipDocument(pipWindow.document);
      setStatus(stageText(props.locale, s850Locale.opened));
    } catch {
      setStatus(stageText(props.locale, s850Locale.unavailable));
    }
  };

  const floatingBox =
    pipDocument && windowRef.current
      ? createPortal(
          <main className="s850-floating-root">
            <h1>{stageText(props.locale, s850Locale.floatingTitle)}</h1>
            <ProblemGiftBox
              problem={problem}
              locale={props.locale}
              onClick={(event) => {
                if (
                  event.isTrusted &&
                  event.currentTarget.ownerDocument === pipDocument &&
                  event.nativeEvent.view === windowRef.current
                ) {
                  problem.solve(["document-picture-in-picture:trusted-click"]);
                }
              }}
            />
          </main>,
          pipDocument.body,
        )
      : null;

  return (
    <div className="puzzle puzzle--centered s850-stage">
      {floatingBox}
      <div className="problem-row">
        <ProblemGiftBox problem={problem} locale={props.locale} />
      </div>
      <p>{stageText(props.locale, s850Locale.intro)}</p>
      <button
        type="button"
        className="stage-action"
        onClick={() => void open()}
      >
        {stageText(props.locale, s850Locale.open)}
      </button>
      <output className="interaction-status" aria-live="polite">
        {pipDocument
          ? stageText(props.locale, s850Locale.opened)
          : status || stageText(props.locale, s850Locale.mainPlaceholder)}
      </output>
    </div>
  );
}
