import { useEffect, useMemo, useRef, useState } from "react";
import {
  type StageId,
  type StageMapBranch,
  type StageSpec,
  stageCatalogue,
} from "../domain/stages";

const canvasWidth = 2700;
const canvasHeight = Math.max(
  1900,
  ...(["page", "device", "storage", "passage", "labs"] as StageMapBranch[]).map(
    (branch) =>
      stageCatalogue.filter((stage) => stage.map.branch === branch).length *
        225 +
      520,
  ),
);
const nodeWidth = 260;
const nodeHeight = 168;

const branchColumns: Readonly<Record<StageMapBranch, number>> = {
  page: 120,
  device: 650,
  storage: 1180,
  passage: 1710,
  labs: 2240,
};

interface Point {
  x: number;
  y: number;
}

function buildPositions(stages: readonly StageSpec[]) {
  const positions = new Map<string, Point>();
  for (const branch of Object.keys(branchColumns) as StageMapBranch[]) {
    stages
      .filter((stage) => stage.map.branch === branch)
      .sort((a, b) => a.map.order - b.map.order)
      .forEach((stage, index) => {
        positions.set(stage.id, {
          x: branchColumns[branch],
          y: 230 + index * 225,
        });
      });
  }
  return positions;
}

interface StageMapProps {
  locale: "ja" | "en";
  renderStage(stage: (typeof stageCatalogue)[number]): React.ReactNode;
}

export function StageMap({ locale, renderStage }: StageMapProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [markerRound, setMarkerRound] = useState<string | null>(null);
  const positions = useMemo(() => buildPositions(stageCatalogue), []);
  const branchNames: Readonly<Record<StageMapBranch, string>> =
    locale === "ja"
      ? {
          page: "ページ",
          device: "端末",
          storage: "記憶",
          passage: "往来",
          labs: "外縁",
        }
      : {
          page: "Page",
          device: "Device",
          storage: "Memory",
          passage: "Passage",
          labs: "Edge",
        };

  const center = { x: canvasWidth / 2, y: 82 };
  useEffect(() => {
    const round = new URL(location.href).searchParams.get("map-round");
    if (!round) return;
    const channel = new BroadcastChannel(`busybox:S-190:marker:${round}`);
    const receive = (event: MessageEvent<unknown>) => {
      if (event.data === `arm:${round}`) setMarkerRound(round);
    };
    channel.addEventListener("message", receive);
    channel.postMessage(`hello:${round}`);
    return () => {
      channel.removeEventListener("message", receive);
      channel.close();
    };
  }, []);
  const centerOnHub = () => {
    viewportRef.current?.scrollTo({
      left: center.x * scale - (viewportRef.current.clientWidth ?? 0) / 2,
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  return (
    <div className="stage-map-shell">
      <div className="stage-map-controls">
        <button
          type="button"
          onClick={() => setScale((value) => Math.max(0.7, value - 0.15))}
          aria-label={locale === "ja" ? "地図を縮小" : "Zoom map out"}
        >
          −
        </button>
        <output aria-live="polite">{Math.round(scale * 100)}%</output>
        <button
          type="button"
          onClick={() => setScale((value) => Math.min(1.3, value + 0.15))}
          aria-label={locale === "ja" ? "地図を拡大" : "Zoom map in"}
        >
          +
        </button>
        <button type="button" onClick={centerOnHub}>
          {locale === "ja" ? "中央へ" : "Center"}
        </button>
      </div>
      <section
        className="stage-map-viewport"
        ref={viewportRef}
        aria-label={locale === "ja" ? "ステージ地図" : "Stage map"}
      >
        <div
          className="stage-map-scale"
          style={{ width: canvasWidth * scale, height: canvasHeight * scale }}
        >
          <div
            className="stage-map-canvas"
            style={{
              width: canvasWidth,
              height: canvasHeight,
              transform: `scale(${scale})`,
            }}
          >
            <div
              className="stage-map-hub"
              style={{ left: center.x - 90, top: center.y - 38 }}
            >
              Busybox
            </div>
            <svg
              className="stage-map-edges"
              viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
              aria-hidden="true"
            >
              {(Object.keys(branchColumns) as StageMapBranch[]).map(
                (branch) => {
                  const first = stageCatalogue
                    .filter((stage) => stage.map.branch === branch)
                    .sort((a, b) => a.map.order - b.map.order)[0];
                  const point = first ? positions.get(first.id) : undefined;
                  return point ? (
                    <path
                      key={branch}
                      className={`stage-map-edge stage-map-edge--${branch}`}
                      d={`M ${center.x} ${center.y + 38} C ${center.x} 170, ${point.x + nodeWidth / 2} 150, ${point.x + nodeWidth / 2} ${point.y}`}
                    />
                  ) : null;
                },
              )}
              {stageCatalogue.flatMap((stage) => {
                const to = positions.get(stage.id);
                if (!to) return [];
                return [
                  ...(stage.map.relatedStageIds ?? []).map((fromId) => ({
                    fromId,
                    kind: "related",
                  })),
                  ...(stage.map.clueFromStageIds ?? []).map((fromId) => ({
                    fromId,
                    kind: "clue",
                  })),
                ].flatMap(({ fromId, kind }) => {
                  const from = positions.get(fromId);
                  return from
                    ? [
                        <line
                          key={`${fromId}-${stage.id}-${kind}`}
                          className={`stage-map-edge stage-map-edge--${kind}`}
                          x1={from.x + nodeWidth / 2}
                          y1={from.y + nodeHeight / 2}
                          x2={to.x + nodeWidth / 2}
                          y2={to.y + nodeHeight / 2}
                        />,
                      ]
                    : [];
                });
              })}
            </svg>
            {(Object.keys(branchColumns) as StageMapBranch[]).map((branch) => (
              <p
                key={branch}
                className={`stage-map-branch stage-map-branch--${branch}`}
                style={{ left: branchColumns[branch], top: 170 }}
              >
                {branchNames[branch]}
              </p>
            ))}
            <ol className="stage-map-list">
              {stageCatalogue.map((stage) => {
                const point = positions.get(stage.id);
                if (!point) return null;
                return (
                  <li
                    key={stage.id}
                    data-stage-id={stage.id satisfies StageId}
                    style={{ left: point.x, top: point.y }}
                  >
                    {renderStage(stage)}
                  </li>
                );
              })}
            </ol>
            <div
              className={`stage-map-marker-slot ${markerRound ? "stage-map-marker-slot--active" : ""}`}
              data-busybox-map-marker={markerRound ?? "inactive"}
              style={{ left: canvasWidth - 110, top: canvasHeight - 110 }}
              aria-hidden="true"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
