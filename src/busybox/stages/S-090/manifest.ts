import {
  defineStageManifest,
  type StageModule,
} from "../../runtime/stageContract";
import { locale } from "./locale";

export const manifest = defineStageManifest({
  id: "S-090",
  name: locale.stageName,
  platform: { baseline: "widely", permission: "required" },
  boxes: ["B01"],
  load: async (): Promise<StageModule> => (await import("./stage")).stage,
});
