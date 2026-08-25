import FullscreenOutlined from "@mui/icons-material/FullscreenOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useEffect, useRef, useState } from "react";
import { stageText } from "../locale";
import { locale } from "./locale";

/**
 * S-890 — 任意HTML要素だけを実Fullscreenにし、その要素内でだけ箱を操作する。
 * 目的: F11やvideo fullscreenではなく、`requestFullscreen()`を呼んだ特定elementの`:fullscreen`状態を体験する。
 * 最初の一手: 額縁内のbuttonを押して、額縁そのものをfullscreenにする。
 * 箱ごとの解法: B01は`document.fullscreenElement === frame`の間に表示・操作可能になり、その箱へのtrusted clickで開く。
 * 開かない操作: F11、videoのfullscreen、別elementのfullscreen、CSSだけの拡大、script click、fullscreen外でのclickでは開かない。
 * 使用API: Fullscreen API、`fullscreenchange`、`:fullscreen`。game製の疑似fullscreen stateを成功条件に使わない。
 * 権限・privacy: browserのfullscreen許可以外の権限、保存、送信は行わない。
 * cleanup: stage離脱時にこのframeがfullscreenなら`exitFullscreen()`し、listenerを解除する。Escによる終了も`fullscreenchange`で反映する。
 * 対応環境: Fullscreen APIに対応するbrowser。user activationが失われた場合はboxを開かず、再度buttonを押す。
 * 人手確認: H-063で額縁fullscreen、F11、別要素、Esc、拒否、再入場cleanupを確認する。
 */
function S890Stage(props: Props) {
  const problem = props.boxes[manifest.box.B01];
  const frameRef = useRef<HTMLDivElement>(null);
  const exitPromiseRef = useRef<Promise<void> | undefined>(undefined);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const update = () =>
      setIsActive(document.fullscreenElement === frameRef.current);
    document.addEventListener("fullscreenchange", update);
    update();
    const stop = () => {
      if (
        document.fullscreenElement !== frameRef.current ||
        exitPromiseRef.current
      )
        return;
      exitPromiseRef.current = document
        .exitFullscreen()
        .catch(() => undefined)
        .finally(() => {
          exitPromiseRef.current = undefined;
        });
    };
    props.signal.addEventListener("abort", stop, { once: true });
    return () => {
      document.removeEventListener("fullscreenchange", update);
      props.signal.removeEventListener("abort", stop);
      stop();
    };
  }, [props.signal]);

  const request = () => {
    void frameRef.current?.requestFullscreen().catch(() => undefined);
  };

  return (
    <div className="puzzle puzzle--centered s890-stage">
      <p>{stageText(props.locale, locale.intro)}</p>
      <div
        ref={frameRef}
        className="s890-frame"
        data-fullscreen={isActive ? "true" : "false"}
      >
        <div className="s890-frame__header">Busybox frame</div>
        <div className="s890-frame__content">
          <StageProblemGiftBox
            box={problem}
            locale={props.locale}
            onClick={
              isActive
                ? (event) => {
                    if (
                      event.isTrusted &&
                      document.fullscreenElement === frameRef.current
                    ) {
                      problem.solve();
                    }
                  }
                : undefined
            }
          />
          <div className="s890-frame__veil" aria-hidden="true" />
        </div>
        <button type="button" className="stage-action" onClick={request}>
          {stageText(props.locale, locale.fullscreen)}
        </button>
      </div>
      <output className="interaction-status" aria-live="polite">
        {stageText(props.locale, isActive ? locale.ready : locale.waiting)}
      </output>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: FullscreenOutlined,
      color: "#0ea5e9",
      label: locale.B01,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      "requestFullscreen" in Element.prototype ? "available" : "unsupported",
    ),
  Component: S890Stage,
});
