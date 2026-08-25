import RouteOutlined from "@mui/icons-material/RouteOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  resolveStageBoxColor,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { GiftBox } from "../../ui/GiftBox";
import { stageText } from "../locale";
import {
  type S920Direction,
  type S920MazeNode,
  s920ChildNodes,
  s920GoalNodes,
  s920MazeNodes,
  s920PathToNode,
  s920RootId,
} from "./functions";
import { locale } from "./locale";

type S920FrameWindow = Window & Pick<typeof globalThis, "CSS" | "HTMLElement">;

type S920AnchorStyle = CSSProperties &
  Readonly<{
    "--s920-anchor-name"?: string;
    "--s920-position-anchor"?: string;
  }>;

const s920FrameSource = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
  </head>
  <body><div id="s920-frame-root"></div></body>
</html>`;

const arrowByDirection: Readonly<Record<S920Direction, string>> = {
  up: "↑",
  right: "→",
  down: "↓",
  left: "←",
};

const localeKeyByDirection: Readonly<
  Record<
    S920Direction,
    "directionUp" | "directionRight" | "directionDown" | "directionLeft"
  >
> = {
  up: "directionUp",
  right: "directionRight",
  down: "directionDown",
  left: "directionLeft",
};

function goalLocaleKey(boxId: (typeof manifest.boxIds)[number]) {
  return boxId;
}

function supportsS920Layout(frameWindow: S920FrameWindow) {
  return (
    "showPopover" in frameWindow.HTMLElement.prototype &&
    frameWindow.CSS.supports("position-area", "right") &&
    frameWindow.CSS.supports("position-try-fallbacks", "flip-inline")
  );
}

function shadowAnchorName(goalId: string, step: number) {
  return `--s920-shadow-${goalId}-${step}`;
}

/**
 * S-920 — 入れ子の実Popoverを宣言的buttonでたどり、画面端でのAnchor Positioning fallbackも含めて3つの終点を探す。
 * 目的: tooltip風のhoverやpage製absolute panelではなく、clickでtop layerへ入るPopoverと、その入れ子・light dismiss・CSS Anchor Positioningの画面端fallbackを迷路として体験する。
 * 最初の一手: 「迷路を開く」を押して最初の浮かぶ部屋を開き、部屋内の方向buttonを押して次の部屋を開く。
 * 箱ごとの解法: B01〜B03は固定treeの別々の終点。各経由部屋は十字配置の最大3択で、各正解経路は曲がり方・手数・終点方向が異なる。迷路は額縁付きの同一origin iframe viewport内にあり、斜線の外周はPopoverを表示できない。B01はinline端、B02はblock端を越えて`position-try-fallbacks`による反射を必ず起こし、B03は非対称な混合経路になる。各影は実経路と同じ部屋寸法・方向button位置・`position-area`・fallback列を持つ非操作CSS anchor chainの終点であり、座標を測定・転記しない。影と同じCSSアルゴリズムで配置された実goal Popover内のProblemGiftBoxをtrusted clickすると対応箱が開く。行き止まりはEscまたは外側clickで閉じ、起点から入り直す。
 * 開かない操作: 通常DOMの影の箱、goal以外のPopover、script click、画面上の見た目だけの座標一致、Popoverを開かずに箱を押す操作では開かない。経路や画面座標を成功条件として再計算しない。
 * 使用API: Popover APIの`popover="auto"`、`popovertarget`、`:popover-open`、CSS Anchor Positioningのimplicit / explicit anchor、`anchor-name`、`position-anchor`、`position-area`、`position-try-fallbacks`。
 * 権限・privacy: 権限要求、端末情報、viewport座標のJavaScript取得、保存、送信を使わない。
 * cleanup: stage離脱時は開いている実Popoverを子から閉じ、abort listenerを解除する。影は通常DOMの非操作CSS anchor chainなのでlistener、observer、animation frameを持たない。
 * 対応環境: Popover APIとCSS Anchor Positioning / `position-try-fallbacks`に対応するbrowser。mouse、touch、keyboardはいずれもnative buttonで操作でき、非対応時のabsolute layout fallbackは作らない。
 * 人手確認: H-066で3終点、各経由部屋の十字最大3択、行き止まり、Esc、外側light dismiss、keyboard / touch、額縁と斜線外周、B01 inline反射、B02 block反射、狭い幅・連続iframe resize・親page scroll中もCSSだけで追従する影と実箱の一致、再入場cleanupを確認する。
 */
function S920Stage(props: Props) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLElement>());
  const [frameRoot, setFrameRoot] = useState<HTMLElement | null>(null);
  const [layoutState, setLayoutState] = useState<
    "preparing" | "ready" | "unavailable"
  >("preparing");

  const prepareFrame = useCallback(async () => {
    const frame = frameRef.current;
    const frameDocument = frame?.contentDocument;
    const nextFrameWindow = frame?.contentWindow as S920FrameWindow | null;
    if (!frame || !frameDocument || !nextFrameWindow) return;

    setLayoutState("preparing");
    frameDocument.documentElement.lang = props.locale;
    frameDocument.head
      .querySelectorAll("[data-s920-cloned-style]")
      .forEach((element) => {
        element.remove();
      });

    const styleLoads: Promise<void>[] = [];
    for (const source of document.querySelectorAll(
      'style, link[rel="stylesheet"]',
    )) {
      const clone = source.cloneNode(true) as HTMLElement;
      clone.dataset.s920ClonedStyle = "true";
      if (clone instanceof HTMLLinkElement) {
        styleLoads.push(
          new Promise((resolve) => {
            clone.addEventListener("load", () => resolve(), { once: true });
            clone.addEventListener("error", () => resolve(), { once: true });
          }),
        );
      }
      frameDocument.head.append(clone);
    }
    await Promise.all(styleLoads);

    if (frameRef.current !== frame || props.signal.aborted) return;
    const root = frameDocument.getElementById("s920-frame-root");
    if (!root) return;
    setFrameRoot(root);
    setLayoutState(
      supportsS920Layout(nextFrameWindow) ? "ready" : "unavailable",
    );
  }, [props.locale, props.signal]);

  useEffect(() => {
    const frameDocument = frameRef.current?.contentDocument;
    if (frameDocument) frameDocument.documentElement.lang = props.locale;
  }, [props.locale]);

  const setNodeRef = (nodeId: string) => (element: HTMLElement | null) => {
    if (element) nodeRefs.current.set(nodeId, element);
    else nodeRefs.current.delete(nodeId);
  };

  const closeAllPopovers = useCallback(() => {
    for (const node of [...s920MazeNodes].reverse()) {
      const element = nodeRefs.current.get(node.id);
      if (element?.matches(":popover-open")) element.hidePopover();
    }
  }, []);

  useEffect(() => {
    props.signal.addEventListener("abort", closeAllPopovers, { once: true });

    return () => {
      props.signal.removeEventListener("abort", closeAllPopovers);
      closeAllPopovers();
    };
  }, [closeAllPopovers, props.signal]);

  useEffect(() => {
    const frameWindow = frameRoot?.ownerDocument.defaultView;
    if (!frameRoot || !frameWindow) return;

    let useAlternateFallbackList = false;
    const clearRememberedFallbacks = () => {
      useAlternateFallbackList = !useAlternateFallbackList;
      frameRoot.dataset.fallbackRevision = useAlternateFallbackList ? "b" : "a";
    };

    clearRememberedFallbacks();
    frameWindow.addEventListener("resize", clearRememberedFallbacks);
    return () => {
      frameWindow.removeEventListener("resize", clearRememberedFallbacks);
      delete frameRoot.dataset.fallbackRevision;
    };
  }, [frameRoot]);

  const solveGoal = (node: S920MazeNode) => (event: ReactMouseEvent) => {
    if (!node.boxId || !event.isTrusted) return;
    if (!nodeRefs.current.get(node.id)?.matches(":popover-open")) return;
    props.boxes[node.boxId].solve();
  };

  const renderNode = (nodeId: string): React.ReactNode => {
    const node = s920MazeNodes.find((candidate) => candidate.id === nodeId);
    if (!node) return null;
    const children = s920ChildNodes(node.id);
    const direction = node.direction;
    const goalProblem = node.boxId ? props.boxes[node.boxId] : undefined;
    const isDeadEnd = !goalProblem && children.length === 0;
    const goalLabel = node.boxId
      ? stageText(props.locale, locale[goalLocaleKey(node.boxId)])
      : undefined;

    return (
      <section
        key={node.id}
        ref={setNodeRef(node.id)}
        id={node.id}
        popover="auto"
        className="s920-popover"
        data-direction={direction ?? "down"}
        aria-label={goalLabel}
      >
        <div className="s920-popover__room">
          {goalProblem ? (
            <StageProblemGiftBox
              box={goalProblem}
              locale={props.locale}
              onClick={solveGoal(node)}
            />
          ) : null}
          {isDeadEnd ? (
            <span className="s920-popover__dead-end">
              {stageText(props.locale, locale.deadEnd)}
            </span>
          ) : null}
          {children.length > 0 ? (
            <div className="s920-popover__doors">
              {children.map((child) => {
                const childDirection = child.direction;
                if (!childDirection) return null;
                return (
                  <button
                    key={child.id}
                    type="button"
                    className="s920-door"
                    data-direction={childDirection}
                    popoverTarget={child.id}
                    aria-label={stageText(
                      props.locale,
                      locale[localeKeyByDirection[childDirection] ?? "down"],
                    )}
                  >
                    <span aria-hidden="true">
                      {arrowByDirection[childDirection]}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
        {children.map((child) => renderNode(child.id))}
      </section>
    );
  };

  const renderShadowRoute = (goal: (typeof s920GoalNodes)[number]) => {
    const path = s920PathToNode(goal.id);
    const problem = props.boxes[goal.boxId];

    return (
      <div key={goal.id} className="s920-shadow-route">
        {path.map((node, index) => {
          const nextNode = path[index + 1];
          const positionAnchor =
            index === 0
              ? "--s920-start-anchor"
              : shadowAnchorName(goal.id, index - 1);
          const nextAnchor = nextNode
            ? shadowAnchorName(goal.id, index)
            : undefined;
          const roomStyle: S920AnchorStyle = {
            "--s920-position-anchor": positionAnchor,
          };

          return (
            <div
              key={`${goal.id}-${node.id}`}
              className={`s920-shadow-room${nextNode ? "" : " s920-goal-silhouette"}`}
              data-direction={node.direction ?? "down"}
              style={roomStyle}
            >
              <div className="s920-popover__room">
                {nextNode ? (
                  <div className="s920-popover__doors">
                    {s920ChildNodes(node.id).map((child) => {
                      const direction = child.direction;
                      if (!direction) return null;
                      const doorStyle: S920AnchorStyle | undefined =
                        direction === nextNode.direction && nextAnchor
                          ? { "--s920-anchor-name": nextAnchor }
                          : undefined;
                      return (
                        <span
                          key={child.id}
                          className="s920-door s920-shadow-door"
                          data-direction={direction}
                          style={doorStyle}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="problem-gift s920-shadow-gift">
                    <GiftBox
                      state="closed"
                      color={resolveStageBoxColor(problem.definition)}
                      label=""
                      decorative
                    />
                    <span className="problem-gift__clue" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const frameContent = (
    <div className="s920-frame-content">
      <div className="s920-maze" aria-busy={layoutState === "preparing"}>
        <button
          type="button"
          className="stage-action s920-start"
          popoverTarget={s920RootId}
          disabled={layoutState !== "ready"}
        >
          {stageText(props.locale, locale.start)}
        </button>
        {renderNode(s920RootId)}
      </div>
      <div className="s920-shadow-routes" aria-hidden="true">
        {s920GoalNodes.map(renderShadowRoute)}
      </div>
    </div>
  );

  return (
    <div className="puzzle s920-stage">
      <p>{stageText(props.locale, locale.intro)}</p>
      <div className="s920-frame-shell">
        <span className="s920-frame-shell__label">
          {stageText(props.locale, locale.unavailableArea)}
        </span>
        <iframe
          ref={frameRef}
          className="s920-frame"
          title={stageText(props.locale, locale.frameTitle)}
          srcDoc={s920FrameSource}
          loading="lazy"
          onLoad={() => void prepareFrame()}
        />
      </div>
      {frameRoot ? createPortal(frameContent, frameRoot) : null}
      <output className="interaction-status" aria-live="polite">
        {stageText(
          props.locale,
          layoutState === "ready"
            ? locale.ready
            : layoutState === "unavailable"
              ? locale.unavailable
              : locale.preparing,
        )}
      </output>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: RouteOutlined,
      color: "#f59e0b",
      label: locale.B01,
    },
    [manifest.box.B02]: {
      icon: RouteOutlined,
      color: "#22d3ee",
      label: locale.B02,
    },
    [manifest.box.B03]: {
      icon: RouteOutlined,
      color: "#a78bfa",
      label: locale.B03,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      "showPopover" in HTMLElement.prototype &&
      CSS.supports("position-area", "right") &&
      CSS.supports("position-try-fallbacks", "flip-inline")
        ? "available"
        : "unsupported",
    ),
  Component: S920Stage,
});
