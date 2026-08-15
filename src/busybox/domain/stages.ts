import type { ClueIconName } from "../ui/ClueIcon";

export type StageCategory =
  | "page"
  | "transition"
  | "storage"
  | "device"
  | "edge";

export type StageMapBranch = "page" | "device" | "storage" | "passage" | "labs";

type StageIdFormat = `S-${number}`;
type ProblemBoxIdFormat = `${StageIdFormat}-B${number}`;

export interface ProblemSpec {
  readonly id: ProblemBoxIdFormat;
  readonly color: string;
  readonly clue: ClueIconName;
}

export interface StageSpec {
  readonly id: StageIdFormat;
  readonly category: StageCategory;
  readonly map: {
    readonly branch: StageMapBranch;
    readonly order: number;
    readonly relatedStageIds?: readonly StageIdFormat[];
    readonly clueFromStageIds?: readonly StageIdFormat[];
  };
  readonly problems: readonly ProblemSpec[];
}

type ProblemFor<TStageId extends StageIdFormat> = Omit<ProblemSpec, "id"> & {
  id: `${TStageId}-B${number}`;
};

function defineStage<
  const TStageId extends StageIdFormat,
  const TProblems extends readonly ProblemFor<TStageId>[],
>(stage: {
  id: TStageId;
  category: StageCategory;
  map?: {
    branch?: StageMapBranch;
    order?: number;
    relatedStageIds?: readonly StageIdFormat[];
    clueFromStageIds?: readonly StageIdFormat[];
  };
  problems: TProblems;
}) {
  const branchByCategory: Readonly<Record<StageCategory, StageMapBranch>> = {
    page: "page",
    device: "device",
    storage: "storage",
    transition: "passage",
    edge: "labs",
  };
  return {
    ...stage,
    map: {
      branch: stage.map?.branch ?? branchByCategory[stage.category],
      order: stage.map?.order ?? Number(stage.id.slice(2)),
      relatedStageIds: stage.map?.relatedStageIds,
      clueFromStageIds: stage.map?.clueFromStageIds,
    },
  };
}

export const stageCatalogue = [
  defineStage({
    id: "S-000",
    category: "page",
    problems: [
      {
        id: "S-000-B01",
        color: "#a78bfa",
        clue: "click",
      },
    ],
  }),
  defineStage({
    id: "S-010",
    category: "device",
    problems: [
      {
        id: "S-010-B01",
        color: "#60a5fa",
        clue: "mouse",
      },
      {
        id: "S-010-B02",
        color: "#fb7185",
        clue: "touch",
      },
      {
        id: "S-010-B03",
        color: "#34d399",
        clue: "pen",
      },
    ],
  }),
  defineStage({
    id: "S-020",
    category: "page",
    problems: [
      {
        id: "S-020-B01",
        color: "#818cf8",
        clue: "resize",
      },
    ],
  }),
  defineStage({
    id: "S-030",
    category: "page",
    problems: [
      {
        id: "S-030-B01",
        color: "#fbbf24",
        clue: "selection",
      },
    ],
  }),
  defineStage({
    id: "S-040",
    category: "transition",
    problems: [
      {
        id: "S-040-B01",
        color: "#94a3b8",
        clue: "hidden",
      },
      {
        id: "S-040-B02",
        color: "#64748b",
        clue: "hidden",
      },
    ],
  }),
  defineStage({
    id: "S-050",
    category: "transition",
    problems: [
      {
        id: "S-050-B01",
        color: "#38bdf8",
        clue: "windows",
      },
    ],
  }),
  defineStage({
    id: "S-060",
    category: "storage",
    problems: [
      {
        id: "S-060-B01",
        color: "#c084fc",
        clue: "return",
      },
      {
        id: "S-060-B02",
        color: "#a855f7",
        clue: "offline",
      },
    ],
  }),
  defineStage({
    id: "S-070",
    category: "storage",
    problems: [
      {
        id: "S-070-B01",
        color: "#2dd4bf",
        clue: "offline",
      },
    ],
  }),
  defineStage({
    id: "S-080",
    category: "edge",
    problems: [
      {
        id: "S-080-B01",
        color: "#f59e0b",
        clue: "install",
      },
    ],
  }),
  defineStage({
    id: "S-090",
    category: "transition",
    problems: [
      {
        id: "S-090-B01",
        color: "#f472b6",
        clue: "notification",
      },
    ],
  }),
  defineStage({
    id: "S-100",
    category: "device",
    problems: [
      {
        id: "S-100-B01",
        color: "#fb7185",
        clue: "orientation",
      },
    ],
  }),
  defineStage({
    id: "S-110",
    category: "device",
    problems: [
      {
        id: "S-110-B01",
        color: "#facc15",
        clue: "light",
      },
    ],
  }),
  defineStage({
    id: "S-120",
    category: "device",
    problems: [
      {
        id: "S-120-B01",
        color: "#22d3ee",
        clue: "sound",
      },
    ],
  }),
  defineStage({
    id: "S-130",
    category: "storage",
    problems: [
      {
        id: "S-130-B01",
        color: "#34d399",
        clue: "export",
      },
      {
        id: "S-130-B02",
        color: "#10b981",
        clue: "import",
      },
    ],
  }),
  defineStage({
    id: "S-140",
    category: "edge",
    problems: [
      {
        id: "S-140-B01",
        color: "#60a5fa",
        clue: "backup",
      },
      {
        id: "S-140-B02",
        color: "#a78bfa",
        clue: "devices",
      },
    ],
  }),
  defineStage({
    id: "S-150",
    category: "page",
    problems: [
      {
        id: "S-150-B01",
        color: "#c084fc",
        clue: "hidden",
      },
      {
        id: "S-150-B02",
        color: "#a78bfa",
        clue: "selection",
      },
      {
        id: "S-150-B03",
        color: "#8b5cf6",
        clue: "dom",
      },
    ],
  }),
  defineStage({
    id: "S-160",
    category: "page",
    problems: [
      {
        id: "S-160-B01",
        color: "#38bdf8",
        clue: "path",
      },
    ],
  }),
  defineStage({
    id: "S-170",
    category: "page",
    problems: [
      {
        id: "S-170-B01",
        color: "#fbbf24",
        clue: "time",
      },
    ],
  }),
  defineStage({
    id: "S-180",
    category: "transition",
    problems: [
      {
        id: "S-180-B01",
        color: "#a78bfa",
        clue: "copy",
      },
    ],
  }),
  defineStage({
    id: "S-190",
    category: "device",
    problems: [
      {
        id: "S-190-B01",
        color: "#22d3ee",
        clue: "screen",
      },
      {
        id: "S-190-B02",
        color: "#38bdf8",
        clue: "screen",
      },
      {
        id: "S-190-B03",
        color: "#818cf8",
        clue: "windows",
      },
      {
        id: "S-190-B04",
        color: "#facc15",
        clue: "eyedropper",
      },
    ],
  }),
  defineStage({
    id: "S-200",
    category: "device",
    problems: [
      {
        id: "S-200-B01",
        color: "#fb7185",
        clue: "gamepad",
      },
    ],
  }),
  defineStage({
    id: "S-210",
    category: "edge",
    problems: [
      {
        id: "S-210-B01",
        color: "#fbbf24",
        clue: "badge",
      },
    ],
  }),
  defineStage({
    id: "S-220",
    category: "transition",
    problems: [
      {
        id: "S-220-B01",
        color: "#fb7185",
        clue: "history",
      },
      {
        id: "S-220-B02",
        color: "#f59e0b",
        clue: "return",
      },
      {
        id: "S-220-B03",
        color: "#fbbf24",
        clue: "transition",
      },
      {
        id: "S-220-B04",
        color: "#06b6d4",
        clue: "transition",
      },
    ],
  }),
  defineStage({
    id: "S-240",
    category: "transition",
    problems: [
      {
        id: "S-240-B01",
        color: "#34d399",
        clue: "share",
      },
      {
        id: "S-240-B02",
        color: "#10b981",
        clue: "install",
      },
    ],
  }),
  defineStage({
    id: "S-250",
    category: "transition",
    problems: [
      {
        id: "S-250-B01",
        color: "#fbbf24",
        clue: "lock",
      },
      {
        id: "S-250-B02",
        color: "#fb7185",
        clue: "wait",
      },
    ],
  }),
  defineStage({
    id: "S-260",
    category: "device",
    problems: [
      {
        id: "S-260-B01",
        color: "#a78bfa",
        clue: "eyedropper",
      },
    ],
  }),
  defineStage({
    id: "S-280",
    category: "device",
    problems: [
      {
        id: "S-280-B01",
        color: "#22d3ee",
        clue: "bluetooth",
      },
    ],
  }),
  defineStage({
    id: "S-290",
    category: "device",
    problems: [
      {
        id: "S-290-B01",
        color: "#60a5fa",
        clue: "hid",
      },
    ],
  }),
  defineStage({
    id: "S-300",
    category: "device",
    problems: [
      {
        id: "S-300-B01",
        color: "#818cf8",
        clue: "usb",
      },
    ],
  }),
  defineStage({
    id: "S-310",
    category: "edge",
    problems: [
      {
        id: "S-310-B01",
        color: "#c084fc",
        clue: "launch",
      },
      {
        id: "S-310-B02",
        color: "#a78bfa",
        clue: "launch",
      },
      {
        id: "S-310-B03",
        color: "#818cf8",
        clue: "launch",
      },
    ],
  }),
  defineStage({
    id: "S-320",
    category: "device",
    problems: [
      {
        id: "S-320-B01",
        color: "#c084fc",
        clue: "fold",
      },
    ],
  }),
  defineStage({
    id: "S-330",
    category: "edge",
    problems: [
      {
        id: "S-330-B01",
        color: "#facc15",
        clue: "wake",
      },
      {
        id: "S-330-B02",
        color: "#fde68a",
        clue: "return",
      },
    ],
  }),
  defineStage({
    id: "S-340",
    category: "page",
    problems: [
      {
        id: "S-340-B01",
        color: "#34d399",
        clue: "transition",
      },
    ],
  }),
  defineStage({
    id: "S-350",
    category: "page",
    problems: [
      {
        id: "S-350-B01",
        color: "#60a5fa",
        clue: "time",
      },
      {
        id: "S-350-B02",
        color: "#f472b6",
        clue: "sound",
      },
      {
        id: "S-350-B03",
        color: "#34d399",
        clue: "pause",
      },
      {
        id: "S-350-B04",
        color: "#65a30d",
        clue: "speed",
      },
      {
        id: "S-350-B05",
        color: "#4d7c0f",
        clue: "subtitles",
      },
      {
        id: "S-350-B06",
        color: "#60a5fa",
        clue: "pip",
      },
      {
        id: "S-350-B08",
        color: "#38bdf8",
        clue: "fullscreen",
      },
    ],
  }),
  defineStage({
    id: "S-360",
    category: "transition",
    problems: [
      {
        id: "S-360-B01",
        color: "#22d3ee",
        clue: "sound",
      },
      {
        id: "S-360-B02",
        color: "#fb7185",
        clue: "windows",
      },
    ],
  }),
  defineStage({
    id: "S-370",
    category: "device",
    problems: [
      {
        id: "S-370-B01",
        color: "#34d399",
        clue: "wake",
      },
      {
        id: "S-370-B02",
        color: "#fb7185",
        clue: "wake",
      },
      {
        id: "S-370-B03",
        color: "#facc15",
        clue: "badge",
      },
      {
        id: "S-370-B04",
        color: "#f59e0b",
        clue: "badge",
      },
    ],
  }),
  defineStage({
    id: "S-380",
    category: "edge",
    problems: [
      {
        id: "S-380-B01",
        color: "#a78bfa",
        clue: "export",
      },
      {
        id: "S-380-B02",
        color: "#34d399",
        clue: "lock",
      },
      {
        id: "S-380-B03",
        color: "#fb7185",
        clue: "lock",
      },
    ],
  }),
  defineStage({
    id: "S-390",
    category: "edge",
    problems: [
      {
        id: "S-390-B01",
        color: "#f59e0b",
        clue: "wait",
      },
      {
        id: "S-390-B02",
        color: "#94a3b8",
        clue: "wait",
      },
    ],
  }),
  defineStage({
    id: "S-400",
    category: "device",
    problems: [
      {
        id: "S-400-B01",
        color: "#818cf8",
        clue: "time",
      },
      {
        id: "S-400-B02",
        color: "#34d399",
        clue: "return",
      },
    ],
  }),
  defineStage({
    id: "S-410",
    category: "edge",
    problems: [
      {
        id: "S-410-B01",
        color: "#f472b6",
        clue: "notification",
      },
    ],
  }),
  defineStage({
    id: "S-420",
    category: "edge",
    problems: [
      {
        id: "S-420-B01",
        color: "#fbbf24",
        clue: "lock",
      },
    ],
  }),
  defineStage({
    id: "S-430",
    category: "edge",
    problems: [
      {
        id: "S-430-B01",
        color: "#22d3ee",
        clue: "sound",
      },
    ],
  }),
  defineStage({
    id: "S-440",
    category: "edge",
    problems: [
      {
        id: "S-440-B01",
        color: "#a78bfa",
        clue: "import",
      },
    ],
  }),
  defineStage({
    id: "S-450",
    category: "edge",
    problems: [
      {
        id: "S-450-B01",
        color: "#60a5fa",
        clue: "launch",
      },
    ],
  }),
  defineStage({
    id: "S-460",
    category: "edge",
    problems: [
      {
        id: "S-460-B01",
        color: "#c084fc",
        clue: "windows",
      },
    ],
  }),
  defineStage({
    id: "S-480",
    category: "device",
    problems: [
      {
        id: "S-480-B01",
        color: "#60a5fa",
        clue: "resize",
      },
      {
        id: "S-480-B02",
        color: "#34d399",
        clue: "resize",
      },
      {
        id: "S-480-B03",
        color: "#fbbf24",
        clue: "resize",
      },
      {
        id: "S-480-B04",
        color: "#fb7185",
        clue: "resize",
      },
    ],
  }),
  defineStage({
    id: "S-490",
    category: "page",
    map: { clueFromStageIds: [] },
    problems: [
      {
        id: "S-490-B01",
        color: "#a78bfa",
        clue: "dom",
      },
    ],
  }),
  defineStage({
    id: "S-500",
    category: "transition",
    map: { clueFromStageIds: ["S-180", "S-490"] },
    problems: [
      {
        id: "S-500-B01",
        color: "#818cf8",
        clue: "selection",
      },
    ],
  }),
  defineStage({
    id: "S-510",
    category: "transition",
    problems: [
      {
        id: "S-510-B01",
        color: "#34d399",
        clue: "export",
      },
      {
        id: "S-510-B02",
        color: "#10b981",
        clue: "import",
      },
    ],
  }),
  defineStage({
    id: "S-520",
    category: "device",
    problems: [
      {
        id: "S-520-B01",
        color: "#f472b6",
        clue: "devices",
      },
    ],
  }),
  defineStage({
    id: "S-530",
    category: "device",
    problems: [
      {
        id: "S-530-B01",
        color: "#fb7185",
        clue: "path",
      },
      {
        id: "S-530-B02",
        color: "#34d399",
        clue: "path",
      },
      {
        id: "S-530-B03",
        color: "#60a5fa",
        clue: "path",
      },
    ],
  }),
  defineStage({
    id: "S-540",
    category: "device",
    problems: [
      {
        id: "S-540-B01",
        color: "#0f172a",
        clue: "light",
      },
      {
        id: "S-540-B02",
        color: "#fef08a",
        clue: "light",
      },
    ],
  }),
  defineStage({
    id: "S-550",
    category: "device",
    problems: [
      {
        id: "S-550-B01",
        color: "#c084fc",
        clue: "wait",
      },
    ],
  }),
  defineStage({
    id: "S-560",
    category: "device",
    problems: [
      {
        id: "S-560-B01",
        color: "#fb7185",
        clue: "orientation",
      },
      {
        id: "S-560-B02",
        color: "#34d399",
        clue: "orientation",
      },
      {
        id: "S-560-B03",
        color: "#60a5fa",
        clue: "orientation",
      },
    ],
  }),
  defineStage({
    id: "S-570",
    category: "device",
    problems: [
      {
        id: "S-570-B01",
        color: "#22d3ee",
        clue: "orientation",
      },
    ],
  }),
  defineStage({
    id: "S-580",
    category: "device",
    map: { clueFromStageIds: ["S-490"] },
    problems: [
      {
        id: "S-580-B01",
        color: "#f472b6",
        clue: "sound",
      },
      {
        id: "S-580-B02",
        color: "#ec4899",
        clue: "sound",
      },
    ],
  }),
  defineStage({
    id: "S-590",
    category: "device",
    problems: [
      {
        id: "S-590-B01",
        color: "#34d399",
        clue: "path",
      },
      {
        id: "S-590-B02",
        color: "#fbbf24",
        clue: "path",
      },
      {
        id: "S-590-B03",
        color: "#fb7185",
        clue: "path",
      },
    ],
  }),
  defineStage({
    id: "S-600",
    category: "device",
    problems: [
      {
        id: "S-600-B01",
        color: "#34d399",
        clue: "path",
      },
      {
        id: "S-600-B02",
        color: "#fbbf24",
        clue: "path",
      },
      {
        id: "S-600-B03",
        color: "#60a5fa",
        clue: "path",
      },
    ],
  }),
  defineStage({
    id: "S-610",
    category: "page",
    problems: [
      {
        id: "S-610-B01",
        color: "#f97316",
        clue: "windows",
      },
      {
        id: "S-610-B02",
        color: "#ea580c",
        clue: "click",
      },
      {
        id: "S-610-B03",
        color: "#c2410c",
        clue: "return",
      },
    ],
  }),
  defineStage({
    id: "S-620",
    category: "page",
    problems: Array.from({ length: 17 }, (_, index) => ({
      id: `S-620-B${String(index + 1).padStart(2, "0")}` as `S-620-B${number}`,
      color: ["#38bdf8", "#22d3ee", "#2dd4bf", "#34d399", "#4ade80"][index % 5],
      clue: "selection" as const,
    })) as readonly ProblemFor<"S-620">[],
  }),
  defineStage({
    id: "S-640",
    category: "page",
    problems: Array.from({ length: 8 }, (_, index) => ({
      id: `S-640-B${String(index + 1).padStart(2, "0")}` as `S-640-B${number}`,
      color: ["#818cf8", "#6366f1", "#4f46e5", "#4338ca"][index % 4],
      clue: "hidden" as const,
    })) as readonly ProblemFor<"S-640">[],
  }),
  defineStage({
    id: "S-650",
    category: "device",
    problems: [
      {
        id: "S-650-B01",
        color: "#22c55e",
        clue: "path",
      },
      {
        id: "S-650-B02",
        color: "#16a34a",
        clue: "notification",
      },
      {
        id: "S-650-B03",
        color: "#15803d",
        clue: "screen",
      },
      {
        id: "S-650-B04",
        color: "#166534",
        clue: "sound",
      },
    ],
  }),
  defineStage({
    id: "S-660",
    category: "device",
    problems: [
      {
        id: "S-660-B01",
        color: "#a7f3d0",
        clue: "gpu",
      },
      {
        id: "S-660-B02",
        color: "#6ee7b7",
        clue: "gpu",
      },
      {
        id: "S-660-B03",
        color: "#10b981",
        clue: "gpu",
      },
    ],
  }),
  defineStage({
    id: "S-670",
    category: "edge",
    problems: [
      {
        id: "S-670-B01",
        color: "#eab308",
        clue: "hidden",
      },
    ],
  }),
  defineStage({
    id: "S-710",
    category: "edge",
    problems: [
      {
        id: "S-710-B01",
        color: "#f8fafc",
        clue: "hidden",
      },
      {
        id: "S-710-B02",
        color: "#94a3b8",
        clue: "import",
      },
      {
        id: "S-710-B03",
        color: "#64748b",
        clue: "devices",
      },
      {
        id: "S-710-B04",
        color: "#475569",
        clue: "export",
      },
    ],
  }),
  defineStage({
    id: "S-720",
    category: "edge",
    problems: [
      {
        id: "S-720-B01",
        color: "#f43f5e",
        clue: "transition",
      },
      {
        id: "S-720-B02",
        color: "#e11d48",
        clue: "transition",
      },
      {
        id: "S-720-B03",
        color: "#be123c",
        clue: "transition",
      },
      {
        id: "S-720-B04",
        color: "#9f1239",
        clue: "devices",
      },
    ],
  }),
  defineStage({
    id: "S-810",
    category: "page",
    problems: Array.from({ length: 4 }, (_, index) => ({
      id: `S-810-B${String(index + 1).padStart(2, "0")}` as `S-810-B${number}`,
      color: ["#84cc16", "#65a30d", "#4d7c0f", "#3f6212"][index],
      clue: "time" as const,
    })) as readonly ProblemFor<"S-810">[],
  }),
] as const satisfies readonly StageSpec[];

export type StageId = (typeof stageCatalogue)[number]["id"];
export type ProblemBoxId =
  (typeof stageCatalogue)[number]["problems"][number]["id"];

export const stageById = Object.fromEntries(
  stageCatalogue.map((stage) => [stage.id, stage]),
) as Readonly<Record<StageId, (typeof stageCatalogue)[number]>>;

export const problemById = Object.fromEntries(
  stageCatalogue.flatMap((stage) =>
    stage.problems.map((problem) => [problem.id, problem]),
  ),
) as Readonly<
  Record<ProblemBoxId, (typeof stageCatalogue)[number]["problems"][number]>
>;

export const totalBoxCount = stageCatalogue.reduce(
  (total, stage) => total + stage.problems.length,
  0,
);
