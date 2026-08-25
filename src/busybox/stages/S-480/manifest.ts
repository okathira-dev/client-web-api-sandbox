import {
  defineStageManifest,
  type StageModule,
} from "../../runtime/stageContract";
import { locale } from "./locale";

export const manifest = defineStageManifest({
  id: "S-480",
  name: locale.stageName,
  platform: { baseline: "newly", permission: "none" },
  boxes: ["B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08", "B09"],
  load: async (): Promise<StageModule> => (await import("./stage")).stage,
});
