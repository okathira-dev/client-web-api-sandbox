import {
  defineStageManifest,
  type StageModule,
} from "../../runtime/stageContract";

export const manifest = defineStageManifest({
  id: "S-000",
  name: { ja: "最初の箱", en: "The first box" },
  platform: { baseline: "widely", permission: "none" },
  boxes: ["B01"],
  load: async (): Promise<StageModule> => (await import("./stage")).stage,
});
