import { useEffect, useMemo, useRef, useState } from "react";
import { type StageId, type StageSpec, stageCatalogue } from "../domain/stages";

const canvasWidth = 1480;
const canvasHeight = 1650;
const nodeWidth = 196;
const nodeHeight = 92;
const nodeGapX = 20;
const nodeGapY = 16;
const clusterWidth = nodeWidth * 2 + nodeGapX;

interface StageMapCluster {
  id: string;
  label: Readonly<Record<"ja" | "en", string>>;
  x: number;
  y: number;
  stageIds: readonly StageId[];
}

export const stageMapClusters: readonly StageMapCluster[] = [
  {
    id: "input",
    label: { ja: "入力と文字", en: "Input & text" },
    x: 48,
    y: 230,
    stageIds: [
      "S-000",
      "S-010",
      "S-020",
      "S-030",
      "S-150",
      "S-160",
      "S-170",
      "S-340",
      "S-480",
      "S-490",
      "S-500",
    ],
  },
  {
    id: "lifecycle",
    label: { ja: "ページの往来", en: "Page journeys" },
    x: 534,
    y: 230,
    stageIds: [
      "S-040",
      "S-050",
      "S-060",
      "S-070",
      "S-090",
      "S-180",
      "S-220",
      "S-250",
      "S-310",
      "S-400",
    ],
  },
  {
    id: "media",
    label: { ja: "音・映像・通知", en: "Media & notices" },
    x: 1020,
    y: 230,
    stageIds: [
      "S-110",
      "S-120",
      "S-190",
      "S-230",
      "S-240",
      "S-350",
      "S-360",
      "S-410",
      "S-420",
      "S-430",
      "S-510",
      "S-580",
    ],
  },
  {
    id: "pwa",
    label: { ja: "PWAと認証", en: "PWA & identity" },
    x: 48,
    y: 950,
    stageIds: [
      "S-080",
      "S-130",
      "S-140",
      "S-210",
      "S-330",
      "S-380",
      "S-390",
      "S-440",
      "S-450",
      "S-460",
    ],
  },
  {
    id: "hardware",
    label: { ja: "端末と周辺機器", en: "Device & hardware" },
    x: 534,
    y: 950,
    stageIds: [
      "S-100",
      "S-200",
      "S-260",
      "S-270",
      "S-280",
      "S-290",
      "S-300",
      "S-320",
      "S-370",
    ],
  },
  {
    id: "sensors",
    label: { ja: "位置とセンサー", en: "Location & sensors" },
    x: 1020,
    y: 950,
    stageIds: [
      "S-520",
      "S-530",
      "S-540",
      "S-550",
      "S-560",
      "S-570",
      "S-590",
      "S-600",
    ],
  },
];

interface Point {
  x: number;
  y: number;
}

function buildPositions(stages: readonly StageSpec[]) {
  const stageIds = new Set(stages.map((stage) => stage.id));
  const positions = new Map<string, Point>();
  for (const cluster of stageMapClusters) {
    cluster.stageIds.forEach((stageId, index) => {
      if (!stageIds.has(stageId)) return;
      positions.set(stageId, {
        x: cluster.x + (index % 2) * (nodeWidth + nodeGapX),
        y: cluster.y + Math.floor(index / 2) * (nodeHeight + nodeGapY),
      });
    });
  }
  return positions;
}

function clusterRows(cluster: StageMapCluster) {
  return Array.from(
    { length: Math.ceil(cluster.stageIds.length / 2) },
    (_, row) => cluster.stageIds.slice(row * 2, row * 2 + 2),
  );
}

interface StageMapProps {
  locale: "ja" | "en";
  renderStage(stage: (typeof stageCatalogue)[number]): React.ReactNode;
}

export function StageMap({ locale, renderStage }: StageMapProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8);
  const [markerRound, setMarkerRound] = useState<string | null>(null);
  const positions = useMemo(() => buildPositions(stageCatalogue), []);
  const center = { x: canvasWidth / 2, y: 76 };

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
          onClick={() => setScale((value) => Math.max(0.55, value - 0.1))}
          aria-label={locale === "ja" ? "地図を縮小" : "Zoom map out"}
        >
          −
        </button>
        <output aria-live="polite">{Math.round(scale * 100)}%</output>
        <button
          type="button"
          onClick={() => setScale((value) => Math.min(1.3, value + 0.1))}
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
              style={{ left: center.x - 78, top: center.y - 30 }}
            >
              Busybox
            </div>
            <svg
              className="stage-map-edges"
              viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
              aria-hidden="true"
            >
              {stageMapClusters.flatMap((cluster) => {
                const clusterCenter = cluster.x + clusterWidth / 2;
                const rows = clusterRows(cluster);
                const lastRowY =
                  cluster.y +
                  (rows.length - 1) * (nodeHeight + nodeGapY) +
                  nodeHeight / 2;
                return [
                  <path
                    key={`${cluster.id}-root`}
                    className="stage-map-edge stage-map-edge--cluster"
                    d={`M ${center.x} ${center.y + 30} C ${center.x} ${cluster.y - 100}, ${clusterCenter} ${cluster.y - 100}, ${clusterCenter} ${cluster.y - 22}`}
                  />,
                  <line
                    key={`${cluster.id}-trunk`}
                    className="stage-map-edge stage-map-edge--cluster"
                    x1={clusterCenter}
                    y1={cluster.y - 22}
                    x2={clusterCenter}
                    y2={lastRowY}
                  />,
                  ...rows.map((row, rowIndex) => {
                    const y =
                      cluster.y +
                      rowIndex * (nodeHeight + nodeGapY) +
                      nodeHeight / 2;
                    const firstId = row[0];
                    const lastId = row.at(-1);
                    if (!firstId || !lastId) return null;
                    const first = positions.get(firstId);
                    const last = positions.get(lastId);
                    return first && last ? (
                      <line
                        key={`${cluster.id}-row-${row[0]}`}
                        className="stage-map-edge stage-map-edge--cluster"
                        x1={Math.min(clusterCenter, first.x + nodeWidth / 2)}
                        y1={y}
                        x2={Math.max(clusterCenter, last.x + nodeWidth / 2)}
                        y2={y}
                      />
                    ) : null;
                  }),
                ];
              })}
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
            {stageMapClusters.map((cluster) => (
              <p
                key={cluster.id}
                className="stage-map-cluster"
                style={{ left: cluster.x, top: cluster.y - 48 }}
              >
                {cluster.label[locale]}
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
              style={{ left: canvasWidth - 92, top: canvasHeight - 92 }}
              aria-hidden="true"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
