import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s890Locale } from "./S-890.locale";

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
export default function S890Stage(props: StageComponentProps) {
  const problem = props.problem("S-890-B01");
  const frameRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const update = () =>
      setIsActive(document.fullscreenElement === frameRef.current);
    document.addEventListener("fullscreenchange", update);
    update();
    const stop = () => {
      if (document.fullscreenElement === frameRef.current) {
        void document.exitFullscreen();
      }
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
      <p>{stageText(props.locale, s890Locale.intro)}</p>
      <div
        ref={frameRef}
        className="s890-frame"
        data-fullscreen={isActive ? "true" : "false"}
      >
        <div className="s890-frame__header">Busybox frame</div>
        <div className="s890-frame__content">
          <ProblemGiftBox
            problem={problem}
            locale={props.locale}
            onClick={
              isActive
                ? (event) => {
                    if (
                      event.isTrusted &&
                      document.fullscreenElement === frameRef.current
                    ) {
                      problem.solve(["fullscreen:exact-element-trusted-click"]);
                    }
                  }
                : undefined
            }
          />
          <div className="s890-frame__veil" aria-hidden="true" />
        </div>
        <button type="button" className="stage-action" onClick={request}>
          {stageText(props.locale, s890Locale.fullscreen)}
        </button>
      </div>
      <output className="interaction-status" aria-live="polite">
        {stageText(
          props.locale,
          isActive ? s890Locale.ready : s890Locale.waiting,
        )}
      </output>
    </div>
  );
}
