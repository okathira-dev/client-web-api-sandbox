import type { Locale } from "../i18n";
import type { ClueIconName } from "../ui/ClueIcon";

export type StageCategory =
  | "page"
  | "transition"
  | "storage"
  | "device"
  | "edge";

type StageIdFormat = `S-${number}`;
type ProblemBoxIdFormat = `${StageIdFormat}-B${number}`;

export interface ProblemSpec {
  readonly id: ProblemBoxIdFormat;
  readonly color: string;
  readonly clue: ClueIconName;
  readonly label: Readonly<Record<Locale, string>>;
}

export interface StageSpec {
  readonly id: StageIdFormat;
  // Labels are presentation copy only. IDs remain the sole routing, storage,
  // filename, CSS, and test identity so copy edits cannot break compatibility.
  readonly label: Readonly<Record<Locale, string>>;
  readonly category: StageCategory;
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
  label: Record<Locale, string>;
  category: StageCategory;
  problems: TProblems;
}) {
  return stage;
}

export const stageCatalogue = [
  defineStage({
    id: "S-000",
    label: { ja: "最初の箱", en: "The first box" },
    category: "page",
    problems: [
      {
        id: "S-000-B01",
        color: "#a78bfa",
        clue: "click",
        label: { ja: "クリックする箱", en: "Click box" },
      },
    ],
  }),
  defineStage({
    id: "S-010",
    label: { ja: "三つの手", en: "Three hands" },
    category: "device",
    problems: [
      {
        id: "S-010-B01",
        color: "#60a5fa",
        clue: "mouse",
        label: { ja: "マウスの箱", en: "Mouse box" },
      },
      {
        id: "S-010-B02",
        color: "#fb7185",
        clue: "touch",
        label: { ja: "タッチの箱", en: "Touch box" },
      },
      {
        id: "S-010-B03",
        color: "#34d399",
        clue: "pen",
        label: { ja: "ペンの箱", en: "Pen box" },
      },
    ],
  }),
  defineStage({
    id: "S-020",
    label: { ja: "枠に合わせる", en: "Fit the frame" },
    category: "page",
    problems: [
      {
        id: "S-020-B01",
        color: "#818cf8",
        clue: "resize",
        label: { ja: "画面幅の箱", en: "Viewport box" },
      },
    ],
  }),
  defineStage({
    id: "S-030",
    label: { ja: "選ばれた範囲", en: "The selected range" },
    category: "page",
    problems: [
      {
        id: "S-030-B01",
        color: "#fbbf24",
        clue: "selection",
        label: { ja: "選択範囲の箱", en: "Selection box" },
      },
    ],
  }),
  defineStage({
    id: "S-040",
    label: { ja: "見ない時間", en: "Time unseen" },
    category: "transition",
    problems: [
      {
        id: "S-040-B01",
        color: "#94a3b8",
        clue: "hidden",
        label: { ja: "見ない時間の箱", en: "Hidden-time box" },
      },
    ],
  }),
  defineStage({
    id: "S-050",
    label: { ja: "二つの窓", en: "Two windows" },
    category: "transition",
    problems: [
      {
        id: "S-050-B01",
        color: "#38bdf8",
        clue: "windows",
        label: { ja: "二つの窓の箱", en: "Two-window box" },
      },
    ],
  }),
  defineStage({
    id: "S-060",
    label: { ja: "帰ってくる箱", en: "The returning box" },
    category: "storage",
    problems: [
      {
        id: "S-060-B01",
        color: "#c084fc",
        clue: "return",
        label: { ja: "再訪の箱", en: "Return box" },
      },
    ],
  }),
  defineStage({
    id: "S-070",
    label: { ja: "通信のない返事", en: "An offline reply" },
    category: "storage",
    problems: [
      {
        id: "S-070-B01",
        color: "#2dd4bf",
        clue: "offline",
        label: { ja: "オフラインの箱", en: "Offline box" },
      },
    ],
  }),
  defineStage({
    id: "S-080",
    label: { ja: "別の入口", en: "Another entrance" },
    category: "edge",
    problems: [
      {
        id: "S-080-B01",
        color: "#f59e0b",
        clue: "install",
        label: { ja: "別の入口の箱", en: "Installed-app box" },
      },
    ],
  }),
  defineStage({
    id: "S-090",
    label: { ja: "外からの呼び声", en: "A call from outside" },
    category: "transition",
    problems: [
      {
        id: "S-090-B01",
        color: "#f472b6",
        clue: "notification",
        label: { ja: "通知の箱", en: "Notification box" },
      },
    ],
  }),
  defineStage({
    id: "S-100",
    label: { ja: "傾けて止める", en: "Tilt and hold" },
    category: "device",
    problems: [
      {
        id: "S-100-B01",
        color: "#fb7185",
        clue: "orientation",
        label: { ja: "端末姿勢の箱", en: "Orientation box" },
      },
    ],
  }),
  defineStage({
    id: "S-110",
    label: { ja: "光だけを見る", en: "See only light" },
    category: "device",
    problems: [
      {
        id: "S-110-B01",
        color: "#facc15",
        clue: "light",
        label: { ja: "光の箱", en: "Light box" },
      },
    ],
  }),
  defineStage({
    id: "S-120",
    label: { ja: "音のかたち", en: "The shape of sound" },
    category: "device",
    problems: [
      {
        id: "S-120-B01",
        color: "#22d3ee",
        clue: "sound",
        label: { ja: "音の箱", en: "Sound box" },
      },
    ],
  }),
  defineStage({
    id: "S-130",
    label: { ja: "箱の外の鍵", en: "A key outside the box" },
    category: "storage",
    problems: [
      {
        id: "S-130-B01",
        color: "#34d399",
        clue: "export",
        label: { ja: "鍵を外へ出す箱", en: "Export-key box" },
      },
      {
        id: "S-130-B02",
        color: "#10b981",
        clue: "import",
        label: { ja: "鍵を戻す箱", en: "Import-key box" },
      },
    ],
  }),
  defineStage({
    id: "S-140",
    label: { ja: "もう一つの端末", en: "Another device" },
    category: "edge",
    problems: [
      {
        id: "S-140-B01",
        color: "#60a5fa",
        clue: "backup",
        label: { ja: "バックアップの箱", en: "Backup box" },
      },
      {
        id: "S-140-B02",
        color: "#a78bfa",
        clue: "devices",
        label: { ja: "別端末の箱", en: "Remote-device box" },
      },
    ],
  }),
  defineStage({
    id: "S-150",
    label: { ja: "文書の順番", en: "Document order" },
    category: "page",
    problems: [
      {
        id: "S-150-B01",
        color: "#c084fc",
        clue: "dom",
        label: { ja: "文書構造の箱", en: "Document-structure box" },
      },
    ],
  }),
  defineStage({
    id: "S-160",
    label: { ja: "速さの軌跡", en: "A trace of speed" },
    category: "page",
    problems: [
      {
        id: "S-160-B01",
        color: "#38bdf8",
        clue: "path",
        label: { ja: "入力軌跡の箱", en: "Pointer-trace box" },
      },
    ],
  }),
  defineStage({
    id: "S-170",
    label: { ja: "止まった時間", en: "Paused time" },
    category: "page",
    problems: [
      {
        id: "S-170-B01",
        color: "#fbbf24",
        clue: "time",
        label: { ja: "時間の箱", en: "Animation-time box" },
      },
    ],
  }),
  defineStage({
    id: "S-180",
    label: { ja: "見えない受け渡し", en: "An invisible handoff" },
    category: "transition",
    problems: [
      {
        id: "S-180-B01",
        color: "#a78bfa",
        clue: "copy",
        label: { ja: "コピーの箱", en: "Copy box" },
      },
      {
        id: "S-180-B02",
        color: "#818cf8",
        clue: "paste",
        label: { ja: "貼り付けの箱", en: "Paste box" },
      },
    ],
  }),
  defineStage({
    id: "S-190",
    label: { ja: "画面の中の画面", en: "A screen within the screen" },
    category: "device",
    problems: [
      {
        id: "S-190-B01",
        color: "#22d3ee",
        clue: "screen",
        label: { ja: "再帰画面の箱", en: "Recursive-screen box" },
      },
    ],
  }),
  defineStage({
    id: "S-200",
    label: { ja: "同時に押す", en: "Press together" },
    category: "device",
    problems: [
      {
        id: "S-200-B01",
        color: "#fb7185",
        clue: "gamepad",
        label: { ja: "同時入力の箱", en: "Simultaneous-input box" },
      },
    ],
  }),
  defineStage({
    id: "S-210",
    label: { ja: "外側の数字", en: "The number outside" },
    category: "edge",
    problems: [
      {
        id: "S-210-B01",
        color: "#fbbf24",
        clue: "badge",
        label: { ja: "外側の数字の箱", en: "Outer-number box" },
      },
    ],
  }),
  defineStage({
    id: "S-220",
    label: { ja: "戻る道", en: "The path back" },
    category: "transition",
    problems: [
      {
        id: "S-220-B01",
        color: "#fb7185",
        clue: "history",
        label: { ja: "履歴の箱", en: "History box" },
      },
    ],
  }),
  defineStage({
    id: "S-230",
    label: { ja: "浮かぶ窓", en: "The floating window" },
    category: "edge",
    problems: [
      {
        id: "S-230-B01",
        color: "#60a5fa",
        clue: "pip",
        label: { ja: "小窓の箱", en: "Picture-in-picture box" },
      },
    ],
  }),
  defineStage({
    id: "S-240",
    label: { ja: "渡した印", en: "The shared mark" },
    category: "transition",
    problems: [
      {
        id: "S-240-B01",
        color: "#34d399",
        clue: "share",
        label: { ja: "共有の箱", en: "Share box" },
      },
    ],
  }),
  defineStage({
    id: "S-250",
    label: { ja: "一つだけの鍵", en: "The one lock" },
    category: "transition",
    problems: [
      {
        id: "S-250-B01",
        color: "#fbbf24",
        clue: "lock",
        label: { ja: "鍵を持つ箱", en: "Lock-holder box" },
      },
      {
        id: "S-250-B02",
        color: "#fb7185",
        clue: "wait",
        label: { ja: "鍵を待つ箱", en: "Lock-waiter box" },
      },
    ],
  }),
  defineStage({
    id: "S-260",
    label: { ja: "画面の一滴", en: "A drop from the screen" },
    category: "device",
    problems: [
      {
        id: "S-260-B01",
        color: "#a78bfa",
        clue: "eyedropper",
        label: { ja: "色を採る箱", en: "Color-picker box" },
      },
    ],
  }),
  defineStage({
    id: "S-270",
    label: { ja: "並列の捜索", en: "The parallel search" },
    category: "edge",
    problems: [
      {
        id: "S-270-B01",
        color: "#34d399",
        clue: "gpu",
        label: { ja: "並列計算の箱", en: "Parallel-compute box" },
      },
    ],
  }),
  defineStage({
    id: "S-280",
    label: { ja: "近くの電池", en: "A nearby battery" },
    category: "device",
    problems: [
      {
        id: "S-280-B01",
        color: "#22d3ee",
        clue: "bluetooth",
        label: { ja: "近くの電池の箱", en: "Nearby-battery box" },
      },
    ],
  }),
  defineStage({
    id: "S-290",
    label: { ja: "生の入力", en: "Raw input" },
    category: "device",
    problems: [
      {
        id: "S-290-B01",
        color: "#60a5fa",
        clue: "hid",
        label: { ja: "入力レポートの箱", en: "Input-report box" },
      },
    ],
  }),
  defineStage({
    id: "S-300",
    label: { ja: "線の向こう", en: "Across the wire" },
    category: "device",
    problems: [
      {
        id: "S-300-B01",
        color: "#818cf8",
        clue: "usb",
        label: { ja: "USB転送の箱", en: "USB-transfer box" },
      },
    ],
  }),
  defineStage({
    id: "S-310",
    label: { ja: "もう一度の起動", en: "Launch once more" },
    category: "edge",
    problems: [
      {
        id: "S-310-B01",
        color: "#c084fc",
        clue: "launch",
        label: { ja: "再起動の箱", en: "Launch-handler box" },
      },
    ],
  }),
  defineStage({
    id: "S-320",
    label: { ja: "折れ目をまたぐ", en: "Across the fold" },
    category: "device",
    problems: [
      {
        id: "S-320-B01",
        color: "#c084fc",
        clue: "fold",
        label: { ja: "折れ目の箱", en: "Fold box" },
      },
    ],
  }),
  defineStage({
    id: "S-330",
    label: { ja: "消えない灯り", en: "The light that stays" },
    category: "edge",
    problems: [
      {
        id: "S-330-B01",
        color: "#facc15",
        clue: "wake",
        label: { ja: "灯りを保つ箱", en: "Wake-lock box" },
      },
      {
        id: "S-330-B02",
        color: "#fde68a",
        clue: "return",
        label: { ja: "灯りを戻す箱", en: "Wake-lock return box" },
      },
    ],
  }),
  defineStage({
    id: "S-340",
    label: { ja: "形をつなぐ", en: "Connect the shapes" },
    category: "page",
    problems: [
      {
        id: "S-340-B01",
        color: "#34d399",
        clue: "transition",
        label: { ja: "画面遷移の箱", en: "View-transition box" },
      },
    ],
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
