import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import AdsClickOutlined from "@mui/icons-material/AdsClickOutlined";
import AspectRatioOutlined from "@mui/icons-material/AspectRatioOutlined";
import BadgeOutlined from "@mui/icons-material/BadgeOutlined";
import BluetoothOutlined from "@mui/icons-material/BluetoothOutlined";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import ColorizeOutlined from "@mui/icons-material/ColorizeOutlined";
import ContentCopyOutlined from "@mui/icons-material/ContentCopyOutlined";
import DesktopWindowsOutlined from "@mui/icons-material/DesktopWindowsOutlined";
import DevicesFoldOutlined from "@mui/icons-material/DevicesFoldOutlined";
import DevicesOutlined from "@mui/icons-material/DevicesOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";
import FileUploadOutlined from "@mui/icons-material/FileUploadOutlined";
import FullscreenOutlined from "@mui/icons-material/FullscreenOutlined";
import HistoryOutlined from "@mui/icons-material/HistoryOutlined";
import HourglassEmptyOutlined from "@mui/icons-material/HourglassEmptyOutlined";
import InstallDesktopOutlined from "@mui/icons-material/InstallDesktopOutlined";
import KeyboardOutlined from "@mui/icons-material/KeyboardOutlined";
import KeyboardReturnOutlined from "@mui/icons-material/KeyboardReturnOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import MemoryOutlined from "@mui/icons-material/MemoryOutlined";
import MouseOutlined from "@mui/icons-material/MouseOutlined";
import NotificationsOutlined from "@mui/icons-material/NotificationsOutlined";
import OpenInNewOutlined from "@mui/icons-material/OpenInNewOutlined";
import PauseOutlined from "@mui/icons-material/PauseOutlined";
import PictureInPictureAltOutlined from "@mui/icons-material/PictureInPictureAltOutlined";
import RouteOutlined from "@mui/icons-material/RouteOutlined";
import ScheduleOutlined from "@mui/icons-material/ScheduleOutlined";
import ScreenRotationOutlined from "@mui/icons-material/ScreenRotationOutlined";
import SelectAllOutlined from "@mui/icons-material/SelectAllOutlined";
import ShareOutlined from "@mui/icons-material/ShareOutlined";
import SignalWifiOffOutlined from "@mui/icons-material/SignalWifiOffOutlined";
import SpeedOutlined from "@mui/icons-material/SpeedOutlined";
import SportsEsportsOutlined from "@mui/icons-material/SportsEsportsOutlined";
import SubtitlesOutlined from "@mui/icons-material/SubtitlesOutlined";
import SwapHorizOutlined from "@mui/icons-material/SwapHorizOutlined";
import TouchAppOutlined from "@mui/icons-material/TouchAppOutlined";
import UsbOutlined from "@mui/icons-material/UsbOutlined";
import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";
import VolumeUpOutlined from "@mui/icons-material/VolumeUpOutlined";
import WbSunnyOutlined from "@mui/icons-material/WbSunnyOutlined";
import WindowOutlined from "@mui/icons-material/WindowOutlined";
import type SvgIcon from "@mui/material/SvgIcon";

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
  readonly icon: typeof SvgIcon;
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
        icon: AdsClickOutlined,
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
        icon: MouseOutlined,
      },
      {
        id: "S-010-B02",
        color: "#fb7185",
        icon: TouchAppOutlined,
      },
      {
        id: "S-010-B03",
        color: "#34d399",
        icon: EditOutlined,
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
        icon: AspectRatioOutlined,
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
        icon: SelectAllOutlined,
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
        icon: VisibilityOffOutlined,
      },
      {
        id: "S-040-B02",
        color: "#64748b",
        icon: VisibilityOffOutlined,
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
        icon: WindowOutlined,
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
        icon: KeyboardReturnOutlined,
      },
      {
        id: "S-060-B02",
        color: "#a855f7",
        icon: SignalWifiOffOutlined,
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
        icon: SignalWifiOffOutlined,
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
        icon: InstallDesktopOutlined,
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
        icon: NotificationsOutlined,
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
        icon: ScreenRotationOutlined,
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
        icon: LightModeOutlined,
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
        icon: VolumeUpOutlined,
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
        icon: FileUploadOutlined,
      },
      {
        id: "S-130-B02",
        color: "#10b981",
        icon: FileDownloadOutlined,
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
        icon: CloudUploadOutlined,
      },
      {
        id: "S-140-B02",
        color: "#a78bfa",
        icon: DevicesOutlined,
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
        icon: VisibilityOffOutlined,
      },
      {
        id: "S-150-B02",
        color: "#a78bfa",
        icon: SelectAllOutlined,
      },
      {
        id: "S-150-B03",
        color: "#8b5cf6",
        icon: AccountTreeOutlined,
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
        icon: RouteOutlined,
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
        icon: ScheduleOutlined,
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
        icon: ContentCopyOutlined,
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
        icon: DesktopWindowsOutlined,
      },
      {
        id: "S-190-B02",
        color: "#38bdf8",
        icon: DesktopWindowsOutlined,
      },
      {
        id: "S-190-B03",
        color: "#818cf8",
        icon: WindowOutlined,
      },
      {
        id: "S-190-B04",
        color: "#facc15",
        icon: ColorizeOutlined,
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
        icon: SportsEsportsOutlined,
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
        icon: BadgeOutlined,
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
        icon: HistoryOutlined,
      },
      {
        id: "S-220-B02",
        color: "#f59e0b",
        icon: KeyboardReturnOutlined,
      },
      {
        id: "S-220-B03",
        color: "#fbbf24",
        icon: SwapHorizOutlined,
      },
      {
        id: "S-220-B04",
        color: "#06b6d4",
        icon: SwapHorizOutlined,
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
        icon: ShareOutlined,
      },
      {
        id: "S-240-B02",
        color: "#10b981",
        icon: InstallDesktopOutlined,
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
        icon: LockOutlined,
      },
      {
        id: "S-250-B02",
        color: "#fb7185",
        icon: HourglassEmptyOutlined,
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
        icon: ColorizeOutlined,
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
        icon: BluetoothOutlined,
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
        icon: KeyboardOutlined,
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
        icon: UsbOutlined,
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
        icon: OpenInNewOutlined,
      },
      {
        id: "S-310-B02",
        color: "#a78bfa",
        icon: OpenInNewOutlined,
      },
      {
        id: "S-310-B03",
        color: "#818cf8",
        icon: OpenInNewOutlined,
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
        icon: DevicesFoldOutlined,
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
        icon: WbSunnyOutlined,
      },
      {
        id: "S-330-B02",
        color: "#fde68a",
        icon: KeyboardReturnOutlined,
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
        icon: SwapHorizOutlined,
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
        icon: ScheduleOutlined,
      },
      {
        id: "S-350-B02",
        color: "#f472b6",
        icon: VolumeUpOutlined,
      },
      {
        id: "S-350-B03",
        color: "#34d399",
        icon: PauseOutlined,
      },
      {
        id: "S-350-B04",
        color: "#65a30d",
        icon: SpeedOutlined,
      },
      {
        id: "S-350-B05",
        color: "#4d7c0f",
        icon: SubtitlesOutlined,
      },
      {
        id: "S-350-B06",
        color: "#60a5fa",
        icon: PictureInPictureAltOutlined,
      },
      {
        id: "S-350-B08",
        color: "#38bdf8",
        icon: FullscreenOutlined,
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
        icon: VolumeUpOutlined,
      },
      {
        id: "S-360-B02",
        color: "#fb7185",
        icon: WindowOutlined,
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
        icon: WbSunnyOutlined,
      },
      {
        id: "S-370-B02",
        color: "#fb7185",
        icon: WbSunnyOutlined,
      },
      {
        id: "S-370-B03",
        color: "#facc15",
        icon: BadgeOutlined,
      },
      {
        id: "S-370-B04",
        color: "#f59e0b",
        icon: BadgeOutlined,
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
        icon: FileUploadOutlined,
      },
      {
        id: "S-380-B02",
        color: "#34d399",
        icon: LockOutlined,
      },
      {
        id: "S-380-B03",
        color: "#fb7185",
        icon: LockOutlined,
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
        icon: HourglassEmptyOutlined,
      },
      {
        id: "S-390-B02",
        color: "#94a3b8",
        icon: HourglassEmptyOutlined,
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
        icon: ScheduleOutlined,
      },
      {
        id: "S-400-B02",
        color: "#34d399",
        icon: KeyboardReturnOutlined,
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
        icon: NotificationsOutlined,
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
        icon: LockOutlined,
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
        icon: VolumeUpOutlined,
      },
      {
        id: "S-430-B02",
        color: "#a78bfa",
        icon: VolumeUpOutlined,
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
        icon: FileDownloadOutlined,
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
        icon: OpenInNewOutlined,
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
        icon: WindowOutlined,
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
        icon: AspectRatioOutlined,
      },
      {
        id: "S-480-B02",
        color: "#34d399",
        icon: AspectRatioOutlined,
      },
      {
        id: "S-480-B03",
        color: "#fbbf24",
        icon: AspectRatioOutlined,
      },
      {
        id: "S-480-B04",
        color: "#fb7185",
        icon: AspectRatioOutlined,
      },
      { id: "S-480-B05", color: "#312e81", icon: LightModeOutlined },
      { id: "S-480-B06", color: "#f8fafc", icon: SelectAllOutlined },
      { id: "S-480-B07", color: "#22c55e", icon: PauseOutlined },
      { id: "S-480-B08", color: "#94a3b8", icon: VisibilityOffOutlined },
      { id: "S-480-B09", color: "#38bdf8", icon: SignalWifiOffOutlined },
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
        icon: AccountTreeOutlined,
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
        icon: SelectAllOutlined,
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
        icon: FileUploadOutlined,
      },
      {
        id: "S-510-B02",
        color: "#10b981",
        icon: FileDownloadOutlined,
      },
      {
        id: "S-510-B03",
        color: "#6366f1",
        icon: WindowOutlined,
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
        icon: DevicesOutlined,
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
        icon: RouteOutlined,
      },
      {
        id: "S-530-B02",
        color: "#34d399",
        icon: RouteOutlined,
      },
      {
        id: "S-530-B03",
        color: "#60a5fa",
        icon: RouteOutlined,
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
        icon: LightModeOutlined,
      },
      {
        id: "S-540-B02",
        color: "#fef08a",
        icon: LightModeOutlined,
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
        icon: HourglassEmptyOutlined,
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
        icon: ScreenRotationOutlined,
      },
      {
        id: "S-560-B02",
        color: "#34d399",
        icon: ScreenRotationOutlined,
      },
      {
        id: "S-560-B03",
        color: "#60a5fa",
        icon: ScreenRotationOutlined,
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
        icon: ScreenRotationOutlined,
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
        icon: VolumeUpOutlined,
      },
      {
        id: "S-580-B02",
        color: "#ec4899",
        icon: VolumeUpOutlined,
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
        icon: RouteOutlined,
      },
      {
        id: "S-590-B02",
        color: "#fbbf24",
        icon: RouteOutlined,
      },
      {
        id: "S-590-B03",
        color: "#fb7185",
        icon: RouteOutlined,
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
        icon: RouteOutlined,
      },
      {
        id: "S-600-B02",
        color: "#fbbf24",
        icon: RouteOutlined,
      },
      {
        id: "S-600-B03",
        color: "#60a5fa",
        icon: RouteOutlined,
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
        icon: WindowOutlined,
      },
      {
        id: "S-610-B02",
        color: "#ea580c",
        icon: AdsClickOutlined,
      },
      {
        id: "S-610-B03",
        color: "#c2410c",
        icon: KeyboardReturnOutlined,
      },
    ],
  }),
  defineStage({
    id: "S-620",
    category: "page",
    problems: Array.from({ length: 17 }, (_, index) => ({
      id: `S-620-B${String(index + 1).padStart(2, "0")}` as `S-620-B${number}`,
      color: ["#38bdf8", "#22d3ee", "#2dd4bf", "#34d399", "#4ade80"][index % 5],
      icon: SelectAllOutlined,
    })) as readonly ProblemFor<"S-620">[],
  }),
  defineStage({
    id: "S-630",
    category: "device",
    problems: [
      { id: "S-630-B01", color: "#38bdf8", icon: DevicesOutlined },
      { id: "S-630-B02", color: "#fb7185", icon: DevicesOutlined },
      { id: "S-630-B03", color: "#34d399", icon: DevicesOutlined },
      { id: "S-630-B04", color: "#818cf8", icon: BluetoothOutlined },
    ],
  }),
  defineStage({
    id: "S-640",
    category: "page",
    problems: Array.from({ length: 8 }, (_, index) => ({
      id: `S-640-B${String(index + 1).padStart(2, "0")}` as `S-640-B${number}`,
      color: ["#818cf8", "#6366f1", "#4f46e5", "#4338ca"][index % 4],
      icon: VisibilityOffOutlined,
    })) as readonly ProblemFor<"S-640">[],
  }),
  defineStage({
    id: "S-650",
    category: "device",
    problems: [
      {
        id: "S-650-B01",
        color: "#22c55e",
        icon: RouteOutlined,
      },
      {
        id: "S-650-B02",
        color: "#16a34a",
        icon: NotificationsOutlined,
      },
      {
        id: "S-650-B03",
        color: "#15803d",
        icon: DesktopWindowsOutlined,
      },
      {
        id: "S-650-B04",
        color: "#166534",
        icon: VolumeUpOutlined,
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
        icon: MemoryOutlined,
      },
      {
        id: "S-660-B02",
        color: "#6ee7b7",
        icon: MemoryOutlined,
      },
      {
        id: "S-660-B03",
        color: "#10b981",
        icon: MemoryOutlined,
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
        icon: VisibilityOffOutlined,
      },
    ],
  }),
  defineStage({
    id: "S-690",
    category: "transition",
    problems: [
      {
        id: "S-690-B01",
        color: "#38bdf8",
        icon: RouteOutlined,
      },
    ],
  }),
  defineStage({
    id: "S-700",
    category: "edge",
    problems: [
      {
        id: "S-700-B01",
        color: "#f59e0b",
        icon: DesktopWindowsOutlined,
      },
      {
        id: "S-700-B02",
        color: "#22d3ee",
        icon: DevicesOutlined,
      },
      {
        id: "S-700-B03",
        color: "#0ea5e9",
        icon: DesktopWindowsOutlined,
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
        icon: VisibilityOffOutlined,
      },
      {
        id: "S-710-B02",
        color: "#94a3b8",
        icon: FileDownloadOutlined,
      },
      {
        id: "S-710-B03",
        color: "#64748b",
        icon: DevicesOutlined,
      },
      {
        id: "S-710-B04",
        color: "#475569",
        icon: FileUploadOutlined,
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
        icon: SwapHorizOutlined,
      },
      {
        id: "S-720-B02",
        color: "#e11d48",
        icon: SwapHorizOutlined,
      },
      {
        id: "S-720-B03",
        color: "#be123c",
        icon: SwapHorizOutlined,
      },
      {
        id: "S-720-B04",
        color: "#9f1239",
        icon: DevicesOutlined,
      },
    ],
  }),
  defineStage({
    id: "S-730",
    category: "device",
    problems: [
      { id: "S-730-B01", color: "#60a5fa", icon: DevicesOutlined },
      { id: "S-730-B02", color: "#a78bfa", icon: SelectAllOutlined },
    ],
  }),
  defineStage({
    id: "S-740",
    category: "edge",
    problems: [
      { id: "S-740-B01", color: "#4ade80", icon: HourglassEmptyOutlined },
    ],
  }),
  defineStage({
    id: "S-750",
    category: "edge",
    problems: [
      { id: "S-750-B01", color: "#f472b6", icon: NotificationsOutlined },
    ],
  }),
  defineStage({
    id: "S-760",
    category: "device",
    problems: [
      { id: "S-760-B01", color: "#fbbf24", icon: DevicesOutlined },
      { id: "S-760-B02", color: "#94a3b8", icon: VisibilityOffOutlined },
    ],
  }),
  defineStage({
    id: "S-770",
    category: "edge",
    problems: [{ id: "S-770-B01", color: "#4285f4", icon: SelectAllOutlined }],
  }),
  defineStage({
    id: "S-780",
    category: "edge",
    problems: [
      {
        id: "S-780-B01",
        color: "#facc15",
        icon: FileUploadOutlined,
      },
      {
        id: "S-780-B02",
        color: "#eab308",
        icon: FileDownloadOutlined,
      },
      {
        id: "S-780-B03",
        color: "#ca8a04",
        icon: SwapHorizOutlined,
      },
      {
        id: "S-780-B04",
        color: "#a16207",
        icon: SelectAllOutlined,
      },
    ],
  }),
  defineStage({
    id: "S-790",
    category: "edge",
    problems: [
      { id: "S-790-B01", color: "#c084fc", icon: InstallDesktopOutlined },
    ],
  }),
  defineStage({
    id: "S-810",
    category: "page",
    problems: Array.from({ length: 4 }, (_, index) => ({
      id: `S-810-B${String(index + 1).padStart(2, "0")}` as `S-810-B${number}`,
      color: ["#84cc16", "#65a30d", "#4d7c0f", "#3f6212"][index],
      icon: AspectRatioOutlined,
    })) as readonly ProblemFor<"S-810">[],
  }),
  defineStage({
    id: "S-820",
    category: "device",
    problems: [
      { id: "S-820-B01", color: "#fb7185", icon: MouseOutlined },
      { id: "S-820-B02", color: "#f97316", icon: MouseOutlined },
      { id: "S-820-B03", color: "#facc15", icon: MouseOutlined },
    ],
  }),
  defineStage({
    id: "S-830",
    category: "device",
    problems: [
      { id: "S-830-B01", color: "#94a3b8", icon: HourglassEmptyOutlined },
      { id: "S-830-B02", color: "#334155", icon: LockOutlined },
    ],
  }),
  defineStage({
    id: "S-850",
    category: "edge",
    problems: [
      { id: "S-850-B01", color: "#60a5fa", icon: PictureInPictureAltOutlined },
    ],
  }),
  defineStage({
    id: "S-860",
    category: "page",
    problems: [
      { id: "S-860-B01", color: "#fbbf24", icon: EditOutlined },
      { id: "S-860-B02", color: "#f59e0b", icon: EditOutlined },
      { id: "S-860-B03", color: "#d97706", icon: EditOutlined },
    ],
  }),
  defineStage({
    id: "S-870",
    category: "storage",
    problems: [
      { id: "S-870-B01", color: "#34d399", icon: EditOutlined },
      { id: "S-870-B02", color: "#10b981", icon: VisibilityOffOutlined },
      { id: "S-870-B03", color: "#059669", icon: FileUploadOutlined },
    ],
  }),
  defineStage({
    id: "S-880",
    category: "storage",
    problems: [
      { id: "S-880-B01", color: "#c084fc", icon: FileDownloadOutlined },
      { id: "S-880-B02", color: "#a855f7", icon: FileDownloadOutlined },
      { id: "S-880-B03", color: "#7e22ce", icon: FileDownloadOutlined },
    ],
  }),
  defineStage({
    id: "S-900",
    category: "edge",
    problems: [{ id: "S-900-B01", color: "#f43f5e", icon: SwapHorizOutlined }],
  }),
  defineStage({
    id: "S-910",
    category: "page",
    problems: [{ id: "S-910-B01", color: "#e879f9", icon: SubtitlesOutlined }],
  }),
  defineStage({
    id: "S-800",
    category: "page",
    problems: [
      {
        id: "S-800-B01",
        color: "#a78bfa",
        icon: SelectAllOutlined,
      },
      {
        id: "S-800-B02",
        color: "#c084fc",
        icon: SelectAllOutlined,
      },
    ],
  }),
  defineStage({
    id: "S-840",
    category: "transition",
    problems: [
      {
        id: "S-840-B01",
        color: "#2dd4bf",
        icon: SelectAllOutlined,
      },
    ],
  }),
  defineStage({
    id: "S-890",
    category: "edge",
    problems: [
      {
        id: "S-890-B01",
        color: "#0ea5e9",
        icon: FullscreenOutlined,
      },
    ],
  }),
  defineStage({
    id: "S-920",
    category: "page",
    problems: [
      { id: "S-920-B01", color: "#f59e0b", icon: RouteOutlined },
      { id: "S-920-B02", color: "#22d3ee", icon: RouteOutlined },
      { id: "S-920-B03", color: "#a78bfa", icon: RouteOutlined },
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
