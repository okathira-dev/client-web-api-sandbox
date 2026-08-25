import {
  defineStageManifest,
  type StageModule,
} from "../../runtime/stageContract";

export const manifest = defineStageManifest({
  id: "S-010",
  name: { ja: "三つの手", en: "Three hands" },
  platform: { baseline: "widely", permission: "none" },
  boxes: ["B01", "B02", "B03"],
  load: async (): Promise<StageModule> => (await import("./stage")).stage,
});
