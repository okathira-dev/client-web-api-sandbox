import {
  defineStageManifest,
  type StageModule,
} from "../../runtime/stageContract";
import { locale } from "./locale";

export const manifest = defineStageManifest({
  id: "S-620",
  name: locale.stageName,
  platform: { baseline: "widely", permission: "none" },
  boxes: [
    "B01",
    "B02",
    "B03",
    "B04",
    "B05",
    "B06",
    "B07",
    "B08",
    "B09",
    "B10",
    "B11",
    "B12",
    "B13",
    "B14",
    "B15",
    "B16",
    "B17",
  ],
  load: async (): Promise<StageModule> => (await import("./stage")).stage,
});
