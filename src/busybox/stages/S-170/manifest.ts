import {
  defineStageManifest,
  type StageModule,
} from "../../runtime/stageContract";
import { locale } from "./locale";

export const manifest = defineStageManifest({
  id: "S-170",
  name: locale.stageName,
  platform: { baseline: "widely", permission: "none" },
  boxes: ["B01"],
  load: async (): Promise<StageModule> => (await import("./stage")).stage,
});
