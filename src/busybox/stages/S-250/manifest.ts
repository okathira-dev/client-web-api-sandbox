import {
  defineStageManifest,
  type StageModule,
} from "../../runtime/stageContract";
import { locale } from "./locale";

export const manifest = defineStageManifest({
  id: "S-250",
  name: locale.stageName,
  platform: { baseline: "widely", permission: "none" },
  boxes: ["B01", "B02"],
  load: async (): Promise<StageModule> => (await import("./stage")).stage,
});
