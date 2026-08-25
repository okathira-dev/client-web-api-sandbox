import PictureInPictureAltOutlined from "@mui/icons-material/PictureInPictureAltOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { stageText } from "../locale";
import { locale } from "./locale";

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
function S850Stage(props: Props) {
  const problem = props.boxes[manifest.box.B01];
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
      pipWindow.document.title = stageText(props.locale, locale.floatingTitle);
      copyDocumentStyles(pipWindow.document);
      const close = () => {
        if (windowRef.current === pipWindow) {
          windowRef.current = null;
          setPipDocument(undefined);
        }
      };
      pipWindow.addEventListener("pagehide", close, { once: true });
      setPipDocument(pipWindow.document);
      setStatus(stageText(props.locale, locale.opened));
    } catch {
      setStatus(stageText(props.locale, locale.unavailable));
    }
  };

  const floatingBox =
    pipDocument && windowRef.current
      ? createPortal(
          <main className="s850-floating-root">
            <h1>{stageText(props.locale, locale.floatingTitle)}</h1>
            <StageProblemGiftBox
              box={problem}
              locale={props.locale}
              onClick={(event) => {
                if (
                  event.isTrusted &&
                  event.currentTarget.ownerDocument === pipDocument &&
                  event.nativeEvent.view === windowRef.current
                ) {
                  problem.solve();
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
        <StageProblemGiftBox box={problem} locale={props.locale} />
      </div>
      <p>{stageText(props.locale, locale.intro)}</p>
      <button
        type="button"
        className="stage-action"
        onClick={() => void open()}
      >
        {stageText(props.locale, locale.open)}
      </button>
      <output className="interaction-status" aria-live="polite">
        {pipDocument
          ? stageText(props.locale, locale.opened)
          : status || stageText(props.locale, locale.mainPlaceholder)}
      </output>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: PictureInPictureAltOutlined,
      color: "#60a5fa",
      label: locale.B01,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      window.documentPictureInPicture ? "available" : "unsupported",
    ),
  Component: S850Stage,
});
